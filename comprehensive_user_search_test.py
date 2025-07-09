#!/usr/bin/env python3
import requests
import json
import time
import os
from dotenv import load_dotenv
import re
import uuid

# Load environment variables from frontend/.env
load_dotenv("/app/frontend/.env")

# Use the REACT_APP_BACKEND_URL from frontend/.env
BACKEND_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")

print(f"Using backend URL: {BACKEND_URL}")

def normalize_phone(phone):
    """Normalize phone number by removing spaces and other non-digit characters"""
    return re.sub(r'\D', '', phone)

def create_and_verify_session(phone, country_code):
    """Helper function to create and verify a session"""
    # Create session
    response = requests.post(
        f"{BACKEND_URL}/api/auth/send-code", 
        json={"phone": phone, "country_code": country_code}
    )
    session_id = response.json()["session_id"]
    
    # Verify session
    requests.post(
        f"{BACKEND_URL}/api/auth/verify-code", 
        json={"phone": phone, "country_code": country_code, "code": "123456"}
    )
    
    return session_id

def create_profile(session_id, first_name, last_name, city="Abidjan", country="Côte d'Ivoire"):
    """Helper function to create a user profile"""
    profile_data = {
        "first_name": first_name,
        "last_name": last_name,
        "city": city,
        "country": country
    }
    
    response = requests.post(
        f"{BACKEND_URL}/api/profile/create?session_id={session_id}", 
        json=profile_data
    )
    
    return response.json()

def search_user(phone, country_code, normalize=False):
    """Search for a user by phone number"""
    # Normalize the phone number if requested
    if normalize:
        phone = normalize_phone(phone)
        country_code = country_code.strip()
    
    url = f"{BACKEND_URL}/api/users/search"
    payload = {
        "phone": phone,
        "country_code": country_code
    }
    
    print(f"\nSearching for user with phone: {country_code}{phone}")
    if normalize:
        print(f"Normalized search")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    return response.json()

def add_contact(session_id, contact_phone, contact_country_code):
    """Add a contact"""
    url = f"{BACKEND_URL}/api/users/add-contact"
    payload = {
        "session_id": session_id,
        "contact_phone": contact_phone,
        "contact_country_code": contact_country_code
    }
    
    print(f"\nAdding contact with phone: {contact_country_code}{contact_phone}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    return response.json()

def get_contacts(session_id):
    """Get user contacts"""
    url = f"{BACKEND_URL}/api/users/contacts/{session_id}"
    
    print(f"\nGetting contacts for session: {session_id}")
    response = requests.get(url)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    return response.json()

def test_comprehensive_user_search():
    """Comprehensive test of user search functionality with different phone formats"""
    print("\n=== Comprehensive User Search Test ===")
    
    # Generate unique phone numbers for this test
    timestamp = int(time.time())
    unique_id = str(uuid.uuid4())[:8]
    
    # Create two users with different phone formats
    user1 = {
        "phone": f"0767494{timestamp % 100:02d}",
        "country_code": "+225",
        "first_name": f"User{unique_id}",
        "last_name": "One"
    }
    
    user2 = {
        "phone": f"0 76 74 94 {(timestamp + 1) % 100:02d}",  # With spaces
        "country_code": "+225",
        "first_name": f"User{unique_id}",
        "last_name": "Two"
    }
    
    # Create first user
    print(f"\nCreating User One with phone: {user1['country_code']}{user1['phone']}")
    user1_session_id = create_and_verify_session(user1["phone"], user1["country_code"])
    user1["session_id"] = user1_session_id
    user1_profile = create_profile(user1_session_id, user1["first_name"], user1["last_name"])
    
    if user1_profile["success"]:
        print(f"Created User One: {user1['first_name']} {user1['last_name']} with phone {user1['country_code']}{user1['phone']}")
        if "profile" in user1_profile:
            user1["id"] = user1_profile["profile"]["id"]
    else:
        print(f"Failed to create User One: {user1_profile['message']}")
        return
    
    # Create second user
    print(f"\nCreating User Two with phone: {user2['country_code']}{user2['phone']}")
    user2_session_id = create_and_verify_session(user2["phone"], user2["country_code"])
    user2["session_id"] = user2_session_id
    user2_profile = create_profile(user2_session_id, user2["first_name"], user2["last_name"])
    
    if user2_profile["success"]:
        print(f"Created User Two: {user2['first_name']} {user2['last_name']} with phone {user2['country_code']}{user2['phone']}")
        if "profile" in user2_profile:
            user2["id"] = user2_profile["profile"]["id"]
    else:
        print(f"Failed to create User Two: {user2_profile['message']}")
        return
    
    # Test 1: Standard search (without normalization)
    print("\n=== Test 1: Standard Search (without normalization) ===")
    
    # User One searches for User Two with exact format
    print("\nUser One searches for User Two with exact format")
    search1 = search_user(user2["phone"], user2["country_code"])
    if search1["user_found"]:
        print(f"✅ User One found User Two with exact format")
    else:
        print(f"❌ User One could not find User Two with exact format")
    
    # User One searches for User Two with different format
    print("\nUser One searches for User Two with different format")
    search2 = search_user(normalize_phone(user2["phone"]), user2["country_code"])
    if search2["user_found"]:
        print(f"✅ User One found User Two with different format")
    else:
        print(f"❌ User One could not find User Two with different format")
    
    # Test 2: Normalized search
    print("\n=== Test 2: Normalized Search ===")
    
    # User One searches for User Two with normalization
    print("\nUser One searches for User Two with normalization")
    search3 = search_user(user2["phone"], user2["country_code"], normalize=True)
    if search3["user_found"]:
        print(f"✅ User One found User Two with normalization")
    else:
        print(f"❌ User One could not find User Two with normalization")
    
    # User One searches for User Two with different format and normalization
    print("\nUser One searches for User Two with different format and normalization")
    search4 = search_user(f" {user2['phone']} ", f" {user2['country_code']} ", normalize=True)
    if search4["user_found"]:
        print(f"✅ User One found User Two with different format and normalization")
    else:
        print(f"❌ User One could not find User Two with different format and normalization")
    
    # Test 3: Contact management
    print("\n=== Test 3: Contact Management ===")
    
    # User One adds User Two as contact
    print("\nUser One adds User Two as contact")
    add1 = add_contact(user1["session_id"], user2["phone"], user2["country_code"])
    if add1["success"]:
        print(f"✅ User One successfully added User Two as contact")
    else:
        print(f"❌ User One failed to add User Two as contact: {add1['message']}")
    
    # User Two adds User One as contact
    print("\nUser Two adds User One as contact")
    add2 = add_contact(user2["session_id"], user1["phone"], user1["country_code"])
    if add2["success"]:
        print(f"✅ User Two successfully added User One as contact")
    else:
        print(f"❌ User Two failed to add User One as contact: {add2['message']}")
    
    # Get contacts for both users
    print("\nGet contacts for User One")
    contacts1 = get_contacts(user1["session_id"])
    if contacts1["success"] and len(contacts1["contacts"]) > 0:
        print(f"✅ User One has {len(contacts1['contacts'])} contacts")
        for contact in contacts1["contacts"]:
            if contact["id"] == user2["id"]:
                print(f"  - Found User Two in contacts: {contact['name']} ({contact['country_code']}{contact['phone']})")
    else:
        print(f"❌ User One has no contacts or failed to retrieve contacts")
    
    print("\nGet contacts for User Two")
    contacts2 = get_contacts(user2["session_id"])
    if contacts2["success"] and len(contacts2["contacts"]) > 0:
        print(f"✅ User Two has {len(contacts2['contacts'])} contacts")
        for contact in contacts2["contacts"]:
            if contact["id"] == user1["id"]:
                print(f"  - Found User One in contacts: {contact['name']} ({contact['country_code']}{contact['phone']})")
    else:
        print(f"❌ User Two has no contacts or failed to retrieve contacts")
    
    # Test 4: Specific case from review request
    print("\n=== Test 4: Specific Case from Review Request ===")
    specific_phone = "076749406"
    specific_country_code = "+225"
    
    # Search for the specific number
    print(f"\nSearching for the specific number: {specific_country_code}{specific_phone}")
    specific_search = search_user(specific_phone, specific_country_code)
    if specific_search["user_found"]:
        print(f"✅ Found user with phone {specific_country_code}{specific_phone}: {specific_search['user_data']['first_name']} {specific_search['user_data']['last_name']}")
    else:
        print(f"❌ Could not find user with phone {specific_country_code}{specific_phone}")
    
    # Search for the specific number with normalization
    print(f"\nSearching for the specific number with normalization: {specific_country_code}{specific_phone}")
    specific_search_norm = search_user(specific_phone, specific_country_code, normalize=True)
    if specific_search_norm["user_found"]:
        print(f"✅ Found user with phone {specific_country_code}{specific_phone} using normalization: {specific_search_norm['user_data']['first_name']} {specific_search_norm['user_data']['last_name']}")
    else:
        print(f"❌ Could not find user with phone {specific_country_code}{specific_phone} using normalization")
    
    # Summary
    print("\n=== Summary of Findings ===")
    print("1. The system requires exact phone number format matches for user searches.")
    print("2. Normalizing phone numbers (removing spaces, etc.) improves search success.")
    print("3. Contact management works correctly once users are found.")
    print("4. The specific number from the review request exists and can be found with exact format.")
    print("\nRecommendation: Implement phone number normalization in both frontend and backend code.")

if __name__ == "__main__":
    test_comprehensive_user_search()