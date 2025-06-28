from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import random
import string


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Authentication Models
class PhoneAuthRequest(BaseModel):
    phone: str
    country_code: str

class VerifyCodeRequest(BaseModel):
    phone: str
    country_code: str
    code: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    session_id: Optional[str] = None

class UserSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    country_code: str
    verification_code: str
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(minutes=5))

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Authentication endpoints
@api_router.post("/auth/send-code", response_model=AuthResponse)
async def send_verification_code(request: PhoneAuthRequest):
    """
    Simulate sending SMS verification code.
    In reality, this would integrate with an SMS service.
    """
    try:
        # Generate a random 6-digit code
        verification_code = ''.join(random.choices(string.digits, k=6))
        
        # Create or update user session
        session = UserSession(
            phone=request.phone,
            country_code=request.country_code,
            verification_code=verification_code,
            is_verified=False
        )
        
        # Remove any existing session for this phone
        await db.user_sessions.delete_many({
            "phone": request.phone,
            "country_code": request.country_code
        })
        
        # Save new session
        await db.user_sessions.insert_one(session.dict())
        
        logger.info(f"Generated verification code {verification_code} for {request.country_code}{request.phone}")
        
        return AuthResponse(
            success=True,
            message="Code de vérification envoyé",
            session_id=session.id
        )
        
    except Exception as e:
        logger.error(f"Error sending verification code: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi du code")

@api_router.post("/auth/verify-code", response_model=AuthResponse)
async def verify_code(request: VerifyCodeRequest):
    """
    Verify the SMS code. Any 6-digit code is accepted.
    """
    try:
        # Validate code format (must be 6 digits)
        if not request.code.isdigit() or len(request.code) != 6:
            return AuthResponse(
                success=False,
                message="Le code doit contenir exactement 6 chiffres"
            )
        
        # Find active session for this phone
        session_data = await db.user_sessions.find_one({
            "phone": request.phone,
            "country_code": request.country_code,
            "is_verified": False
        })
        
        if not session_data:
            return AuthResponse(
                success=False,
                message="Session non trouvée ou expirée"
            )
        
        session = UserSession(**session_data)
        
        # Check if session is expired
        if datetime.utcnow() > session.expires_at:
            await db.user_sessions.delete_one({"id": session.id})
            return AuthResponse(
                success=False,
                message="Code expiré, veuillez demander un nouveau code"
            )
        
        # Mark session as verified
        await db.user_sessions.update_one(
            {"id": session.id},
            {"$set": {"is_verified": True}}
        )
        
        logger.info(f"Successfully verified code for {request.country_code}{request.phone}")
        
        return AuthResponse(
            success=True,
            message="Connexion réussie",
            session_id=session.id
        )
        
    except Exception as e:
        logger.error(f"Error verifying code: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la vérification")

@api_router.get("/auth/check-session/{session_id}")
async def check_session(session_id: str):
    """
    Check if a session is valid and verified
    """
    try:
        session_data = await db.user_sessions.find_one({
            "id": session_id,
            "is_verified": True
        })
        
        if not session_data:
            return {"valid": False, "message": "Session invalide"}
        
        session = UserSession(**session_data)
        
        # Check if session is expired (extend to 24 hours for verified sessions)
        if datetime.utcnow() > (session.created_at + timedelta(hours=24)):
            await db.user_sessions.delete_one({"id": session_id})
            return {"valid": False, "message": "Session expirée"}
        
        return {
            "valid": True,
            "phone": session.phone,
            "country_code": session.country_code
        }
        
    except Exception as e:
        logger.error(f"Error checking session: {str(e)}")
        return {"valid": False, "message": "Erreur serveur"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
