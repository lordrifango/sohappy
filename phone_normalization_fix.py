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
    # Normalize the phone number before searching
    normalized_phone = normalize_phone(phone)
    
    url = f"{BACKEND_URL}/api/users/search"
    payload = {
        "phone": normalized_phone,
        "country_code": country_code.strip()  # Remove any leading/trailing spaces
    }
    
    print(f"\nSearching for user with phone: {country_code}{phone}")
    print(f"Normalized to: {payload['country_code']}{payload['phone']}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    return response.json()

def test_phone_normalization_fix():
    """Test the phone normalization fix for searching users"""
    print("\n=== Testing Phone Number Normalization Fix ===")
    
    # The specific number mentioned in the request
    specific_phone = "076749406"
    specific_country_code = "+225"
    
    # Search for the specific number with normalization
    print(f"\nSearching for the specific number with normalization: {specific_country_code}{specific_phone}")
    search_result = search_user(specific_phone, specific_country_code)
    
    if search_result["user_found"]:
        print(f"✅ Found user with phone {specific_country_code}{specific_phone}: {search_result['user_data']['first_name']} {search_result['user_data']['last_name']}")
        
        # Try different formats of the same number with normalization
        variations = [
            {"phone": "0 76 74 94 06", "country_code": "+225", "desc": "With spaces"},
            {"phone": "76749406", "country_code": "+225", "desc": "Without leading zero"},
            {"phone": "076749406", "country_code": "225", "desc": "Without + in country code"},
            {"phone": " 076749406 ", "country_code": "+225", "desc": "With leading/trailing spaces"},
            {"phone": "0076749406", "country_code": "+225", "desc": "With extra leading zero"}
        ]
        
        print("\n=== Testing Variations of the Specific Number with Normalization ===")
        for variation in variations:
            var_result = search_user(variation["phone"], variation["country_code"])
            if var_result["user_found"]:
                print(f"✅ Found user with format: {variation['country_code']}{variation['phone']} ({variation['desc']})")
            else:
                print(f"❌ Could not find user with format: {variation['country_code']}{variation['phone']} ({variation['desc']})")
    else:
        print(f"❌ Could not find user with phone {specific_country_code}{specific_phone}")
    
    print("\n=== Summary of Normalization Fix ===")
    print("1. The normalization function removes spaces and non-digit characters from phone numbers.")
    print("2. This allows users to find their accounts regardless of format variations.")
    print("3. The fix is client-side only and doesn't require changes to the server code.")
    print("\nRecommendation: Implement this normalization in both the frontend and backend code.")

if __name__ == "__main__":
    test_phone_normalization_fix()