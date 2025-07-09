#!/usr/bin/env python3
"""
Proposed fix for the phone number format issue in user search functionality.

This script demonstrates how to modify the server.py file to normalize phone numbers
before storing and searching, which would solve the issue where users can't find
accounts created with different phone number formats.
"""

import re

def normalize_phone(phone):
    """Normalize phone number by removing spaces and other non-digit characters"""
    return re.sub(r'\D', '', phone)

# Changes needed in server.py:

# 1. Add the normalize_phone function at the top of the file
'''
def normalize_phone(phone):
    """Normalize phone number by removing spaces and other non-digit characters"""
    return re.sub(r'\D', '', phone)
'''

# 2. Modify the /api/auth/send-code endpoint to normalize phone numbers before storing
'''
@api_router.post("/api/auth/send-code", response_model=AuthResponse)
async def send_verification_code(request: PhoneAuthRequest):
    """
    Simulate sending SMS verification code.
    In reality, this would integrate with an SMS service.
    """
    try:
        # Normalize the phone number
        normalized_phone = normalize_phone(request.phone)
        
        # Generate a random 6-digit code
        verification_code = ''.join(random.choices(string.digits, k=6))
        
        # Create or update user session
        session = UserSession(
            phone=normalized_phone,  # Store normalized phone
            country_code=request.country_code.strip(),  # Remove leading/trailing spaces
            verification_code=verification_code,
            is_verified=False
        )
        
        # Remove any existing session for this phone
        await db.user_sessions.delete_many({
            "phone": normalized_phone,
            "country_code": request.country_code.strip()
        })
        
        # Save new session
        await db.user_sessions.insert_one(session.dict())
        
        logger.info(f"Generated verification code {verification_code} for {request.country_code}{normalized_phone}")
        
        return AuthResponse(
            success=True,
            message="Code de vérification envoyé",
            session_id=session.id
        )
        
    except Exception as e:
        logger.error(f"Error sending verification code: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi du code")
'''

# 3. Modify the /api/auth/verify-code endpoint to normalize phone numbers before searching
'''
@api_router.post("/api/auth/verify-code", response_model=AuthResponse)
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
        
        # Normalize the phone number
        normalized_phone = normalize_phone(request.phone)
        normalized_country_code = request.country_code.strip()
        
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
'''

# 4. Modify the /api/users/search endpoint to normalize phone numbers before searching
'''
@api_router.post("/api/users/search", response_model=UserSearchResponse)
async def search_user_by_phone(request: UserSearchRequest):
    """
    Search for a user by phone number
    """
    try:
        # Normalize the phone number and country code
        normalized_phone = normalize_phone(request.phone)
        normalized_country_code = request.country_code.strip()
        
        # Look for user profile by normalized phone number
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
'''

# 5. Modify the /api/users/add-contact endpoint to normalize phone numbers before searching
'''
@api_router.post("/api/users/add-contact", response_model=AddContactResponse)
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
        
        # Normalize contact phone and country code
        normalized_contact_phone = normalize_phone(request.contact_phone)
        normalized_contact_country_code = request.contact_country_code.strip()
        
        # Check if contact exists
        contact_profile_data = await db.user_profiles.find_one({
            "phone": normalized_contact_phone,
            "country_code": normalized_contact_country_code
        })
        
        if not contact_profile_data:
            raise HTTPException(status_code=404, detail="Contact non trouvé")
        
        contact_profile = UserProfile(**contact_profile_data)
        
        # Check if contact is already added
        existing_contact = await db.user_sessions.find_one({
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
'''

print("Proposed fix for phone number format issue:")
print("1. Add normalize_phone function to remove spaces and non-digit characters")
print("2. Normalize phone numbers in /api/auth/send-code before storing")
print("3. Normalize phone numbers in /api/auth/verify-code before searching")
print("4. Normalize phone numbers in /api/users/search before searching")
print("5. Normalize phone numbers in /api/users/add-contact before searching")
print("\nThis fix will ensure that phone numbers are stored and searched in a consistent format,")
print("allowing users to find their accounts regardless of format variations like spaces or leading zeros.")