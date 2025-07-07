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

# User Profile Models
class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    country_code: str
    first_name: str
    last_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None  # 'male', 'female', 'other'
    city: Optional[str] = None
    country: Optional[str] = None
    occupation: Optional[str] = None
    avatar_base64: Optional[str] = None  # Base64 encoded image
    language: str = "fr"  # Default to French
    currency: str = "FCFA"  # Default currency
    has_completed_tutorial: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Network Models
class NetworkMember(BaseModel):
    id: str
    avatar_url: Optional[str] = None
    initials: str
    full_name: str
    trust_link: str
    member_since: Optional[str] = None
    common_tontines: List[str] = []
    collaboration_duration: str = "0 mois"

class NetworkResponse(BaseModel):
    success: bool
    message: str
    members: List[NetworkMember] = []

class UserProfileCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    occupation: Optional[str] = None
    avatar_base64: Optional[str] = None
    language: str = "fr"
    currency: str = "FCFA"

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    occupation: Optional[str] = None
    avatar_base64: Optional[str] = None
    language: Optional[str] = None
    currency: Optional[str] = None
    has_completed_tutorial: Optional[bool] = None

class ProfileResponse(BaseModel):
    success: bool
    message: str
    profile: Optional[UserProfile] = None

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

# User Profile endpoints
@api_router.post("/profile/create", response_model=ProfileResponse)
async def create_user_profile(request: UserProfileCreate, session_id: str):
    """
    Create a user profile after authentication
    """
    try:
        # Verify session
        session_data = await db.user_sessions.find_one({
            "id": session_id,
            "is_verified": True
        })
        
        if not session_data:
            raise HTTPException(status_code=401, detail="Session invalide")
        
        session = UserSession(**session_data)
        
        # Check if profile already exists
        existing_profile = await db.user_profiles.find_one({
            "phone": session.phone,
            "country_code": session.country_code
        })
        
        if existing_profile:
            return ProfileResponse(
                success=False,
                message="Un profil existe déjà pour ce numéro"
            )
        
        # Create new profile
        profile_data = request.dict()
        profile_data.update({
            "id": str(uuid.uuid4()),
            "phone": session.phone,
            "country_code": session.country_code,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        profile = UserProfile(**profile_data)
        await db.user_profiles.insert_one(profile.dict())
        
        logger.info(f"Created profile for {session.country_code}{session.phone}")
        
        return ProfileResponse(
            success=True,
            message="Profil créé avec succès",
            profile=profile
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création du profil")

@api_router.get("/profile/{session_id}", response_model=ProfileResponse)
async def get_user_profile(session_id: str):
    """
    Get user profile by session ID
    """
    try:
        # Verify session
        session_data = await db.user_sessions.find_one({
            "id": session_id,
            "is_verified": True
        })
        
        if not session_data:
            raise HTTPException(status_code=401, detail="Session invalide")
        
        session = UserSession(**session_data)
        
        # Get profile
        profile_data = await db.user_profiles.find_one({
            "phone": session.phone,
            "country_code": session.country_code
        })
        
        if not profile_data:
            return ProfileResponse(
                success=False,
                message="Profil non trouvé"
            )
        
        profile = UserProfile(**profile_data)
        
        return ProfileResponse(
            success=True,
            message="Profil récupéré avec succès",
            profile=profile
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération du profil")

@api_router.put("/profile/{session_id}", response_model=ProfileResponse)
async def update_user_profile(session_id: str, request: UserProfileUpdate):
    """
    Update user profile
    """
    try:
        # Verify session
        session_data = await db.user_sessions.find_one({
            "id": session_id,
            "is_verified": True
        })
        
        if not session_data:
            raise HTTPException(status_code=401, detail="Session invalide")
        
        session = UserSession(**session_data)
        
        # Get existing profile
        existing_profile = await db.user_profiles.find_one({
            "phone": session.phone,
            "country_code": session.country_code
        })
        
        if not existing_profile:
            raise HTTPException(status_code=404, detail="Profil non trouvé")
        
        # Update profile
        update_data = {k: v for k, v in request.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        await db.user_profiles.update_one(
            {"phone": session.phone, "country_code": session.country_code},
            {"$set": update_data}
        )
        
        # Get updated profile
        updated_profile_data = await db.user_profiles.find_one({
            "phone": session.phone,
            "country_code": session.country_code
        })
        
        updated_profile = UserProfile(**updated_profile_data)
        
        logger.info(f"Updated profile for {session.country_code}{session.phone}")
        
        return ProfileResponse(
            success=True,
            message="Profil mis à jour avec succès",
            profile=updated_profile
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour du profil")

# Network endpoint
@api_router.get("/network/{session_id}", response_model=NetworkResponse)
async def get_user_network(session_id: str):
    """
    Get user's trust network members
    """
    try:
        # Verify session
        session_data = await db.user_sessions.find_one({
            "id": session_id,
            "is_verified": True
        })
        
        if not session_data:
            raise HTTPException(status_code=401, detail="Session invalide")
        
        session = UserSession(**session_data)
        
        # Mock network data - In a real app, this would be calculated from tontine memberships
        mock_network_members = [
            NetworkMember(
                id="usr_001",
                avatar_url=None,
                initials="MK",
                full_name="Mariam Konaté",
                trust_link="Membre de la Tontine Familiale Konaté avec vous.",
                member_since="Février 2025",
                common_tontines=["TFK"],
                collaboration_duration="2 ans"
            ),
            NetworkMember(
                id="usr_002",
                avatar_url=None,
                initials="AK", 
                full_name="Aminata Koné",
                trust_link="Vous avez participé à 2 projets ensemble.",
                member_since="Mars 2025",
                common_tontines=["TFK", "GAA"],
                collaboration_duration="1 an 8 mois"
            ),
            NetworkMember(
                id="usr_003",
                avatar_url=None,
                initials="FD",
                full_name="Fatou Diallo", 
                trust_link="Lien via Moussa C. dans le Groupe Amis Abidjan.",
                member_since="Janvier 2025",
                common_tontines=["GAA"],
                collaboration_duration="10 mois"
            ),
            NetworkMember(
                id="usr_004",
                avatar_url=None,
                initials="IT",
                full_name="Ibrahim Touré",
                trust_link="Membre de votre réseau depuis Février 2025.",
                member_since="Février 2025", 
                common_tontines=["ÉQB"],
                collaboration_duration="11 mois"
            ),
            NetworkMember(
                id="usr_005",
                avatar_url=None,
                initials="MC",
                full_name="Moussa Camara",
                trust_link="Co-fondateur de 3 tontines avec vous.",
                member_since="Janvier 2025",
                common_tontines=["TFK", "GAA", "ÉQB"],
                collaboration_duration="2 ans 1 mois"
            )
        ]
        
        logger.info(f"Retrieved network for {session.country_code}{session.phone}")
        
        return NetworkResponse(
            success=True,
            message=f"Réseau récupéré avec succès ({len(mock_network_members)} membres)",
            members=mock_network_members
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting network: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération du réseau")

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
