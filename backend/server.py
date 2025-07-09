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
import re

# GetStream imports
from stream_chat import StreamChat


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# GetStream configuration
STREAM_API_KEY = os.environ['STREAM_API_KEY']
STREAM_API_SECRET = os.environ['STREAM_API_SECRET']
STREAM_APP_ID = os.environ['STREAM_APP_ID']
stream_client = StreamChat(api_key=STREAM_API_KEY, api_secret=STREAM_API_SECRET)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Utility function to normalize phone numbers
def normalize_phone(phone):
    """
    Normalize phone number by removing spaces, dashes, and other non-digit characters.
    Follows E.164 format best practices for 2025.
    """
    if not phone:
        return ""
    # Remove all non-digit characters (spaces, dashes, parentheses, etc.)
    normalized = re.sub(r'\D', '', str(phone))
    # Don't remove leading zeros as they might be significant in some countries
    # Just return the normalized string with all non-digit characters removed
    return normalized

def normalize_country_code(country_code):
    """Normalize country code by removing spaces and ensuring it starts with +"""
    if not country_code:
        return "+33"  # Default to France
    normalized = str(country_code).strip()
    if not normalized.startswith('+'):
        normalized = '+' + normalized
    return normalized

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
        # Normalize phone number and country code
        normalized_phone = normalize_phone(request.phone)
        normalized_country_code = normalize_country_code(request.country_code)
        
        # Generate a random 6-digit code
        verification_code = ''.join(random.choices(string.digits, k=6))
        
        # Create or update user session
        session = UserSession(
            phone=normalized_phone,
            country_code=normalized_country_code,
            verification_code=verification_code,
            is_verified=False
        )
        
        # Remove any existing session for this phone
        await db.user_sessions.delete_many({
            "phone": normalized_phone,
            "country_code": normalized_country_code
        })
        
        # Save new session
        await db.user_sessions.insert_one(session.dict())
        
        logger.info(f"Generated verification code {verification_code} for {normalized_country_code}{normalized_phone}")
        
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
        # Normalize phone number and country code
        normalized_phone = normalize_phone(request.phone)
        normalized_country_code = normalize_country_code(request.country_code)
        
        # Validate code format (must be 6 digits)
        if not request.code.isdigit() or len(request.code) != 6:
            return AuthResponse(
                success=False,
                message="Le code doit contenir exactement 6 chiffres"
            )
        
        # Find active session for this phone
        session_data = await db.user_sessions.find_one({
            "phone": normalized_phone,
            "country_code": normalized_country_code,
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
        
        logger.info(f"Successfully verified code for {normalized_country_code}{normalized_phone}")
        
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
        
        # Check if profile already exists (with normalized phone data)
        normalized_phone = normalize_phone(session.phone)
        normalized_country_code = normalize_country_code(session.country_code)
        
        existing_profile = await db.user_profiles.find_one({
            "phone": normalized_phone,
            "country_code": normalized_country_code
        })
        
        if existing_profile:
            return ProfileResponse(
                success=False,
                message="Un profil existe déjà pour ce numéro"
            )
        
        # Create new profile with normalized phone data
        profile_data = request.dict()
        profile_data.update({
            "id": str(uuid.uuid4()),
            "phone": normalized_phone,
            "country_code": normalized_country_code,
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

# Ledger Event Models for the chronological registry system
class LedgerEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group_id: str
    event_type: str  # 'payment', 'member_joined', 'goal_achieved', 'cycle_completed', etc.
    icon_name: str  # 'cash', 'arrow-right', 'flag', 'lock-closed'
    content: str  # The generated system message
    actor_name: Optional[str] = None  # Who performed the action
    amount: Optional[str] = None  # For payment events
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_immutable: bool = True  # Always true for ledger events

class UserPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group_id: str
    author_name: str
    author_avatar_url: Optional[str] = None
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0
    comments: int = 0

class FeedItem(BaseModel):
    type: str  # 'POST' or 'LEDGER_EVENT'
    id: str
    timestamp: datetime
    # For posts
    author: Optional[dict] = None
    content: Optional[str] = None
    likes: Optional[int] = None
    comments: Optional[int] = None
    # For ledger events
    icon_name: Optional[str] = None

class GroupFeedResponse(BaseModel):
    success: bool
    message: str
    items: List[FeedItem] = []

# Group Activity Feed endpoint
@api_router.get("/v1/group/{group_id}/feed", response_model=GroupFeedResponse)
async def get_group_activity_feed(group_id: str, session_id: str):
    """
    Get mixed activity feed for a group (user posts + system ledger events)
    """
    try:
        # Verify session
        session_data = await db.user_sessions.find_one({
            "id": session_id,
            "is_verified": True
        })
        
        if not session_data:
            raise HTTPException(status_code=401, detail="Session invalide")
        
        # Mock data for demonstration - In reality, this would fetch from database
        mock_ledger_events = [
            {
                "type": "LEDGER_EVENT",
                "id": "evt_001",
                "icon_name": "cash",
                "content": "Mariam K. a payé sa cotisation de 250 000 FCFA.",
                "timestamp": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "type": "LEDGER_EVENT", 
                "id": "evt_002",
                "icon_name": "arrow-right",
                "content": "Abdoulaye C. a rejoint le groupe.",
                "timestamp": datetime.utcnow() - timedelta(hours=6)
            },
            {
                "type": "LEDGER_EVENT",
                "id": "evt_003", 
                "icon_name": "flag",
                "content": "Le groupe a atteint 75% de son objectif trimestriel.",
                "timestamp": datetime.utcnow() - timedelta(days=1)
            },
            {
                "type": "LEDGER_EVENT",
                "id": "evt_004",
                "icon_name": "cash",
                "content": "Fatou D. a validé la réception du tour.",
                "timestamp": datetime.utcnow() - timedelta(days=2)
            },
            {
                "type": "LEDGER_EVENT",
                "id": "evt_005",
                "icon_name": "lock-closed",
                "content": "Le système a enregistré une nouvelle échéance : Tour du 15 Mars 2025.",
                "timestamp": datetime.utcnow() - timedelta(days=3)
            }
        ]
        
        mock_user_posts = [
            {
                "type": "POST",
                "id": "post_001",
                "author": {
                    "name": "Moussa C.",
                    "avatarUrl": None
                },
                "content": "N'oubliez pas le paiement de demain les amis !",
                "timestamp": datetime.utcnow() - timedelta(hours=4),
                "likes": 5,
                "comments": 2
            },
            {
                "type": "POST", 
                "id": "post_002",
                "author": {
                    "name": "Aminata K.",
                    "avatarUrl": None
                },
                "content": "Merci à tous pour votre soutien. J'ai bien reçu mon tour ! 🎉",
                "timestamp": datetime.utcnow() - timedelta(hours=8),
                "likes": 12,
                "comments": 6
            },
            {
                "type": "POST",
                "id": "post_003", 
                "author": {
                    "name": "Ibrahim T.",
                    "avatarUrl": None
                },
                "content": "Une question sur l'ordre des tours : est-ce qu'on peut échanger nos positions ?",
                "timestamp": datetime.utcnow() - timedelta(days=1, hours=2),
                "likes": 3,
                "comments": 8
            }
        ]
        
        # Combine and sort by timestamp (most recent first)
        all_items = mock_ledger_events + mock_user_posts
        all_items.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Convert timestamps to ISO format for JSON serialization
        for item in all_items:
            item['timestamp'] = item['timestamp'].isoformat()
        
        logger.info(f"Retrieved feed for group {group_id} with {len(all_items)} items")
        
        return GroupFeedResponse(
            success=True,
            message=f"Feed récupéré avec succès ({len(all_items)} éléments)",
            items=all_items
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting group feed: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération du feed")

# ============================
# GetStream Chat Models
# ============================
class StreamTokenRequest(BaseModel):
    session_id: str

class StreamTokenResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user_id: Optional[str] = None
    username: Optional[str] = None
    stream_api_key: Optional[str] = None

class CreateChannelRequest(BaseModel):
    session_id: str
    channel_type: str = "team"  # 'team' for group chats, 'messaging' for direct messages
    channel_id: Optional[str] = None
    channel_name: Optional[str] = None
    members: List[str] = []  # List of user IDs to add to the channel
    tontine_id: Optional[str] = None  # Link to tontine if it's a tontine chat

class CreateChannelResponse(BaseModel):
    success: bool
    message: str
    channel_id: Optional[str] = None
    channel_cid: Optional[str] = None

# ============================
# GetStream Chat Endpoints
# ============================
@api_router.post("/chat/token", response_model=StreamTokenResponse)
async def get_stream_token(request: StreamTokenRequest):
    """
    Generate a GetStream token for authenticated user
    """
    try:
        # Verify session
        session_data = await db.user_sessions.find_one({
            "id": request.session_id,
            "is_verified": True
        })
        
        if not session_data:
            raise HTTPException(status_code=401, detail="Session invalide")
        
        session = UserSession(**session_data)
        
        # Get user profile
        profile_data = await db.user_profiles.find_one({
            "phone": session.phone,
            "country_code": session.country_code
        })
        
        if not profile_data:
            raise HTTPException(status_code=404, detail="Profil utilisateur non trouvé")
        
        profile = UserProfile(**profile_data)
        
        # Generate unique user ID for Stream
        user_id = f"user_{profile.id}"
        username = f"{profile.first_name} {profile.last_name}"
        
        # Create or update user in Stream
        user_data = {
            "id": user_id,
            "name": username,
            "phone": f"{session.country_code}{session.phone}",
            "role": "user"
        }
        
        # Create user in Stream if doesn't exist
        stream_client.update_user(user_data)
        
        # Generate token
        token = stream_client.create_token(user_id)
        
        logger.info(f"Generated Stream token for user {user_id}")
        
        return StreamTokenResponse(
            success=True,
            message="Token généré avec succès",
            token=token,
            user_id=user_id,
            username=username,
            stream_api_key=STREAM_API_KEY
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating Stream token: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la génération du token")

@api_router.post("/chat/channel", response_model=CreateChannelResponse)
async def create_chat_channel(request: CreateChannelRequest):
    """
    Create a new chat channel (for tontines or direct messages)
    """
    try:
        # Verify session
        session_data = await db.user_sessions.find_one({
            "id": request.session_id,
            "is_verified": True
        })
        
        if not session_data:
            raise HTTPException(status_code=401, detail="Session invalide")
        
        session = UserSession(**session_data)
        
        # Get user profile
        profile_data = await db.user_profiles.find_one({
            "phone": session.phone,
            "country_code": session.country_code
        })
        
        if not profile_data:
            raise HTTPException(status_code=404, detail="Profil utilisateur non trouvé")
        
        profile = UserProfile(**profile_data)
        user_id = f"user_{profile.id}"
        
        # Generate channel ID if not provided
        if not request.channel_id:
            if request.tontine_id:
                request.channel_id = f"tontine_{request.tontine_id}"
            else:
                request.channel_id = f"channel_{str(uuid.uuid4())}"
        
        # Prepare channel data
        channel_data = {
            "created_by": {"id": user_id},
            "members": [user_id] + request.members
        }
        
        if request.channel_name:
            channel_data["name"] = request.channel_name
        
        if request.tontine_id:
            channel_data["tontine_id"] = request.tontine_id
            if not request.channel_name:
                channel_data["name"] = f"Chat Tontine {request.tontine_id}"
        
        # Create channel in Stream
        channel = stream_client.channel(request.channel_type, request.channel_id, channel_data)
        channel.create(user_id)  # Pass the user_id as created_by parameter
        
        # Store channel metadata in our database
        channel_metadata = {
            "id": str(uuid.uuid4()),
            "channel_id": request.channel_id,
            "channel_type": request.channel_type,
            "channel_cid": f"{request.channel_type}:{request.channel_id}",
            "created_by": user_id,
            "tontine_id": request.tontine_id,
            "members": channel_data["members"],
            "created_at": datetime.utcnow()
        }
        
        await db.chat_channels.insert_one(channel_metadata)
        
        logger.info(f"Created chat channel {request.channel_id} for user {user_id}")
        
        return CreateChannelResponse(
            success=True,
            message="Canal de chat créé avec succès",
            channel_id=request.channel_id,
            channel_cid=f"{request.channel_type}:{request.channel_id}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating chat channel: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création du canal")

@api_router.get("/chat/channels/{session_id}")
async def get_user_channels(session_id: str):
    """
    Get all channels for a user
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
        
        # Get user profile
        profile_data = await db.user_profiles.find_one({
            "phone": session.phone,
            "country_code": session.country_code
        })
        
        if not profile_data:
            raise HTTPException(status_code=404, detail="Profil utilisateur non trouvé")
        
        profile = UserProfile(**profile_data)
        user_id = f"user_{profile.id}"
        
        # Get channels from our database
        channels_data = await db.chat_channels.find({"members": user_id}).to_list(1000)
        
        # Convert MongoDB ObjectId to string to make it JSON serializable
        channels = []
        for channel in channels_data:
            # Convert ObjectId to string if present
            if '_id' in channel:
                channel['_id'] = str(channel['_id'])
            channels.append(channel)
        
        return {
            "success": True,
            "message": "Canaux récupérés avec succès",
            "channels": channels
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user channels: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des canaux")

# User Search and Contact Management
class UserSearchRequest(BaseModel):
    phone: str
    country_code: str = "+33"

class UserSearchResponse(BaseModel):
    success: bool
    message: str
    user_found: bool = False
    user_data: Optional[dict] = None

class AddContactRequest(BaseModel):
    session_id: str
    contact_phone: str
    contact_country_code: str = "+33"

class AddContactResponse(BaseModel):
    success: bool
    message: str
    contact_id: Optional[str] = None

@api_router.post("/users/search", response_model=UserSearchResponse)
async def search_user_by_phone(request: UserSearchRequest):
    """
    Search for a user by phone number
    """
    try:
        # Normalize phone number and country code
        normalized_phone = normalize_phone(request.phone)
        normalized_country_code = normalize_country_code(request.country_code)
        
        # Look for user profile by phone number
        profile_data = await db.user_profiles.find_one({
            "phone": normalized_phone,
            "country_code": normalized_country_code
        })
        
        if not profile_data:
            return UserSearchResponse(
                success=True,
                message="Utilisateur non trouvé",
                user_found=False
            )
        
        profile = UserProfile(**profile_data)
        
        # Return basic user information (not sensitive data)
        user_data = {
            "id": profile.id,
            "user_id": f"user_{profile.id}",
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "phone": profile.phone,
            "country_code": profile.country_code,
            "city": profile.city,
            "country": profile.country,
            "avatar_url": f"https://ui-avatars.com/api/?name={profile.first_name}+{profile.last_name}&background=random"
        }
        
        logger.info(f"User search successful for phone {normalized_phone}")
        
        return UserSearchResponse(
            success=True,
            message="Utilisateur trouvé",
            user_found=True,
            user_data=user_data
        )
        
    except Exception as e:
        logger.error(f"Error searching user: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la recherche")

@api_router.post("/users/add-contact", response_model=AddContactResponse)
async def add_contact(request: AddContactRequest):
    """
    Add a user as a contact
    """
    try:
        # Verify session
        session_data = await db.user_sessions.find_one({
            "id": request.session_id,
            "is_verified": True
        })
        
        if not session_data:
            raise HTTPException(status_code=401, detail="Session invalide")
        
        session = UserSession(**session_data)
        
        # Get current user profile
        current_profile_data = await db.user_profiles.find_one({
            "phone": session.phone,
            "country_code": session.country_code
        })
        
        if not current_profile_data:
            raise HTTPException(status_code=404, detail="Profil utilisateur non trouvé")
        
        current_profile = UserProfile(**current_profile_data)
        
        # Check if contact exists
        contact_profile_data = await db.user_profiles.find_one({
            "phone": request.contact_phone,
            "country_code": request.contact_country_code
        })
        
        if not contact_profile_data:
            raise HTTPException(status_code=404, detail="Contact non trouvé")
        
        contact_profile = UserProfile(**contact_profile_data)
        
        # Check if contact is already added
        existing_contact = await db.user_contacts.find_one({
            "user_id": current_profile.id,
            "contact_id": contact_profile.id
        })
        
        if existing_contact:
            return AddContactResponse(
                success=True,
                message="Contact déjà ajouté",
                contact_id=contact_profile.id
            )
        
        # Add contact
        contact_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_profile.id,
            "contact_id": contact_profile.id,
            "contact_name": f"{contact_profile.first_name} {contact_profile.last_name}",
            "contact_phone": contact_profile.phone,
            "contact_country_code": contact_profile.country_code,
            "added_at": datetime.utcnow()
        }
        
        await db.user_contacts.insert_one(contact_data)
        
        logger.info(f"Contact added: {current_profile.id} -> {contact_profile.id}")
        
        return AddContactResponse(
            success=True,
            message="Contact ajouté avec succès",
            contact_id=contact_profile.id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding contact: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'ajout du contact")

@api_router.get("/users/contacts/{session_id}")
async def get_user_contacts(session_id: str):
    """
    Get all contacts for a user
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
        
        # Get user profile
        profile_data = await db.user_profiles.find_one({
            "phone": session.phone,
            "country_code": session.country_code
        })
        
        if not profile_data:
            raise HTTPException(status_code=404, detail="Profil utilisateur non trouvé")
        
        profile = UserProfile(**profile_data)
        
        # Get contacts from database
        contacts_data = await db.user_contacts.find({"user_id": profile.id}).to_list(1000)
        
        # Enrich contacts with profile data
        contacts = []
        for contact in contacts_data:
            # Get contact profile
            contact_profile_data = await db.user_profiles.find_one({"id": contact["contact_id"]})
            if contact_profile_data:
                contact_profile = UserProfile(**contact_profile_data)
                enriched_contact = {
                    "id": contact["contact_id"],
                    "user_id": f"user_{contact['contact_id']}",
                    "name": f"{contact_profile.first_name} {contact_profile.last_name}",
                    "first_name": contact_profile.first_name,
                    "last_name": contact_profile.last_name,
                    "phone": contact_profile.phone,
                    "country_code": contact_profile.country_code,
                    "city": contact_profile.city,
                    "country": contact_profile.country,
                    "avatar_url": f"https://ui-avatars.com/api/?name={contact_profile.first_name}+{contact_profile.last_name}&background=random",
                    "added_at": contact["added_at"]
                }
                contacts.append(enriched_contact)
        
        return {
            "success": True,
            "message": "Contacts récupérés avec succès",
            "contacts": contacts
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user contacts: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des contacts")

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
