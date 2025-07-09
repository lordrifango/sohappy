#!/usr/bin/env python3
import requests
import json
import time
import os
from dotenv import load_dotenv

# Load environment variables from frontend/.env
load_dotenv("/app/frontend/.env")

# Use the REACT_APP_BACKEND_URL from frontend/.env
BACKEND_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")

print(f"Using backend URL: {BACKEND_URL}")

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

def test_phone_number_formats():
    """Test searching for users with different phone number formats"""
    print("\n=== Testing Phone Number Format Handling ===")
    
    # Test data - different phone number formats
    test_cases = [
        # Case 1: Standard format without spaces
        {"phone": "0767494061", "country_code": "+225", "first_name": "User1", "last_name": "Test"},
        
        # Case 2: With spaces
        {"phone": "07 67 49 40 62", "country_code": "+225", "first_name": "User2", "last_name": "Test"},
        
        # Case 3: Without leading zero
        {"phone": "767494063", "country_code": "+225", "first_name": "User3", "last_name": "Test"},
        
        # Case 4: The specific number mentioned in the request
        {"phone": "076749406", "country_code": "+225", "first_name": "User4", "last_name": "Test"}
    ]
    
    # Create users with different phone formats
    created_users = []
    for case in test_cases:
        print(f"\nCreating user with phone: {case['country_code']}{case['phone']}")
        session_id = create_and_verify_session(case["phone"], case["country_code"])
        profile_result = create_profile(session_id, case["first_name"], case["last_name"])
        
        if profile_result["success"]:
            print(f"Created user: {case['first_name']} {case['last_name']} with phone {case['country_code']}{case['phone']}")
            created_users.append({
                "phone": case["phone"],
                "country_code": case["country_code"],
                "name": f"{case['first_name']} {case['last_name']}",
                "session_id": session_id
            })
        else:
            print(f"Failed to create user: {profile_result['message']}")
    
    print("\n=== Testing Search with Different Phone Formats ===")
    
    # Test searching with different formats
    search_formats = [
        # Original formats
        {"phone": "0767494061", "country_code": "+225"},
        {"phone": "07 67 49 40 62", "country_code": "+225"},
        {"phone": "767494063", "country_code": "+225"},
        {"phone": "076749406", "country_code": "+225"},
        
        # Format variations
        {"phone": "0767494061", "country_code": "+225"},  # No spaces
        {"phone": "07 67 49 40 61", "country_code": "+225"},  # With spaces
        {"phone": "767494061", "country_code": "+225"},  # Without leading zero
        
        # The specific number from the request
        {"phone": "076749406", "country_code": "+225"},
        
        # Different country code formats
        {"phone": "0767494061", "country_code": "225"},  # Without +
        {"phone": "0767494061", "country_code": "+225 "},  # With trailing space
    ]
    
    search_results = []
    for format in search_formats:
        result = search_user(format["phone"], format["country_code"])
        search_results.append({
            "search_phone": format["phone"],
            "search_country_code": format["country_code"],
            "found": result["user_found"],
            "user_data": result["user_data"] if result["user_found"] else None
        })
    
    # Print summary of search results
    print("\n=== Search Results Summary ===")
    for result in search_results:
        status = "✅ Found" if result["found"] else "❌ Not Found"
        name = result["user_data"]["first_name"] + " " + result["user_data"]["last_name"] if result["found"] else "N/A"
        print(f"{status}: {result['search_country_code']}{result['search_phone']} -> {name}")
    
    # Test the specific case mentioned in the request
    print("\n=== Testing Specific Case from Request ===")
    specific_result = search_user("076749406", "+225")
    if specific_result["user_found"]:
        print(f"✅ Found user with phone +225076749406: {specific_result['user_data']['first_name']} {specific_result['user_data']['last_name']}")
    else:
        print("❌ Could not find user with phone +225076749406")
    
    return search_results

if __name__ == "__main__":
    test_phone_number_formats()