#!/usr/bin/env python3
import requests
import json
import time
import os
from dotenv import load_dotenv
import re

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

def search_user(phone, country_code):
    """Search for a user by phone number"""
    url = f"{BACKEND_URL}/api/users/search"
    payload = {
        "phone": phone,
        "country_code": country_code
    }
    
    print(f"\nSearching for user with phone: {country_code}{phone}")
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

def test_user_search_with_different_numbers():
    """Test creating two users with different phone numbers and searching for each other"""
    print("\n=== Testing User Search with Different Phone Numbers ===")
    
    # Create two users with different phone numbers
    user1 = {
        "phone": "076749406",  # The specific number from the request
        "country_code": "+225",
        "first_name": "User",
        "last_name": "One"
    }
    
    user2 = {
        "phone": "076749407",  # Different number
        "country_code": "+225",
        "first_name": "User",
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
    
    # Test User One searching for User Two
    print("\n=== User One searching for User Two ===")
    search_result1 = search_user(user2["phone"], user2["country_code"])
    
    if search_result1["user_found"]:
        print(f"✅ User One successfully found User Two with phone {user2['country_code']}{user2['phone']}")
    else:
        print(f"❌ User One failed to find User Two with phone {user2['country_code']}{user2['phone']}")
    
    # Test User Two searching for User One
    print("\n=== User Two searching for User One ===")
    search_result2 = search_user(user1["phone"], user1["country_code"])
    
    if search_result2["user_found"]:
        print(f"✅ User Two successfully found User One with phone {user1['country_code']}{user1['phone']}")
    else:
        print(f"❌ User Two failed to find User One with phone {user1['country_code']}{user1['phone']}")
    
    # Test with different phone formats
    print("\n=== Testing search with different phone formats ===")
    
    # Format variations for User One's phone
    user1_phone_variations = [
        {"phone": user1["phone"], "country_code": user1["country_code"]},  # Original
        {"phone": normalize_phone(user1["phone"]), "country_code": user1["country_code"]},  # Normalized
        {"phone": "0 76 74 94 06", "country_code": "+225"},  # With spaces
        {"phone": "76749406", "country_code": "+225"},  # Without leading zero
        {"phone": user1["phone"], "country_code": "225"}  # Without + in country code
    ]
    
    # User Two searches for User One with different formats
    for variation in user1_phone_variations:
        search_result = search_user(variation["phone"], variation["country_code"])
        if search_result["user_found"]:
            print(f"✅ Found User One with format: {variation['country_code']}{variation['phone']}")
        else:
            print(f"❌ Could not find User One with format: {variation['country_code']}{variation['phone']}")
    
    # Test adding contacts
    print("\n=== Testing adding contacts ===")
    
    # User One adds User Two as contact
    add_result1 = add_contact(user1["session_id"], user2["phone"], user2["country_code"])
    if add_result1["success"]:
        print(f"✅ User One successfully added User Two as contact")
    else:
        print(f"❌ User One failed to add User Two as contact: {add_result1['message']}")
    
    # User Two adds User One as contact
    add_result2 = add_contact(user2["session_id"], user1["phone"], user1["country_code"])
    if add_result2["success"]:
        print(f"✅ User Two successfully added User One as contact")
    else:
        print(f"❌ User Two failed to add User One as contact: {add_result2['message']}")
    
    # Get contacts for both users
    print("\n=== Getting contacts for both users ===")
    
    # User One's contacts
    contacts1 = get_contacts(user1["session_id"])
    if contacts1["success"]:
        if len(contacts1["contacts"]) > 0:
            print(f"✅ User One has {len(contacts1['contacts'])} contacts")
            for contact in contacts1["contacts"]:
                print(f"  - {contact['name']} ({contact['country_code']}{contact['phone']})")
        else:
            print("❌ User One has no contacts")
    else:
        print(f"❌ Failed to get User One's contacts: {contacts1['message']}")
    
    # User Two's contacts
    contacts2 = get_contacts(user2["session_id"])
    if contacts2["success"]:
        if len(contacts2["contacts"]) > 0:
            print(f"✅ User Two has {len(contacts2['contacts'])} contacts")
            for contact in contacts2["contacts"]:
                print(f"  - {contact['name']} ({contact['country_code']}{contact['phone']})")
        else:
            print("❌ User Two has no contacts")
    else:
        print(f"❌ Failed to get User Two's contacts: {contacts2['message']}")
    
    # Test the specific case mentioned in the request
    print("\n=== Testing Specific Case from Request ===")
    specific_result = search_user("076749406", "+225")
    if specific_result["user_found"]:
        print(f"✅ Found user with phone +225076749406: {specific_result['user_data']['first_name']} {specific_result['user_data']['last_name']}")
    else:
        print("❌ Could not find user with phone +225076749406")
    
    return {
        "user1": user1,
        "user2": user2,
        "user1_search_result": search_result1,
        "user2_search_result": search_result2,
        "format_variations_results": user1_phone_variations
    }

if __name__ == "__main__":
    test_user_search_with_different_numbers()