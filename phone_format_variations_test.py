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

def test_phone_format_variations():
    """Test searching for users with various phone number format variations"""
    print("\n=== Testing Phone Number Format Variations ===")
    
    # Create a unique timestamp to avoid conflicts with existing users
    timestamp = int(time.time())
    
    # Create a user with a specific phone format
    original_phone = f"07674940{timestamp % 10}"
    original_country_code = "+225"
    
    print(f"\nCreating user with phone: {original_country_code}{original_phone}")
    session_id = create_and_verify_session(original_phone, original_country_code)
    profile_result = create_profile(session_id, "Format", "Test")
    
    if profile_result["success"]:
        print(f"Created user: Format Test with phone {original_country_code}{original_phone}")
        
        # Generate variations of the phone number
        variations = [
            {"phone": original_phone, "country_code": original_country_code, "desc": "Original format"},
            {"phone": normalize_phone(original_phone), "country_code": original_country_code, "desc": "Normalized (digits only)"},
            {"phone": f"0 76 74 94 0{timestamp % 10}", "country_code": original_country_code, "desc": "With spaces"},
            {"phone": f"76749{timestamp % 10}0", "country_code": original_country_code, "desc": "Different digit order"},
            {"phone": original_phone, "country_code": "225", "desc": "Without + in country code"},
            {"phone": f" {original_phone} ", "country_code": original_country_code, "desc": "With leading/trailing spaces"},
            {"phone": f"0{normalize_phone(original_phone)}", "country_code": original_country_code, "desc": "With extra leading zero"},
            {"phone": normalize_phone(original_phone)[1:], "country_code": original_country_code, "desc": "Without leading zero"}
        ]
        
        # Test searching with each variation
        results = []
        for variation in variations:
            result = search_user(variation["phone"], variation["country_code"])
            found = result["user_found"]
            results.append({
                "variation": variation,
                "found": found,
                "user_data": result["user_data"] if found else None
            })
        
        # Print summary
        print("\n=== Search Results Summary ===")
        for result in results:
            status = "✅ Found" if result["found"] else "❌ Not Found"
            variation = result["variation"]
            print(f"{status}: {variation['country_code']}{variation['phone']} ({variation['desc']})")
        
        # Count successes and failures
        successes = sum(1 for result in results if result["found"])
        failures = len(results) - successes
        
        print(f"\nSuccessful searches: {successes}/{len(results)}")
        print(f"Failed searches: {failures}/{len(results)}")
        
        if failures > 0:
            print("\n⚠️ ISSUE DETECTED: Some phone number format variations are not being found.")
            print("This could be causing the reported problem where users can't find accounts created with different phone formats.")
            print("\nRecommendation: Normalize phone numbers by removing spaces and non-digit characters before storing and searching.")
        else:
            print("\n✅ All phone number format variations were successfully found.")
        
        return results
    else:
        print(f"Failed to create user: {profile_result['message']}")
        return None

if __name__ == "__main__":
    test_phone_format_variations()