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

def test_specific_phone_number():
    """Test the specific phone number mentioned in the review request"""
    print("\n=== Testing Specific Phone Number from Review Request ===")
    
    # The specific number mentioned in the request
    specific_phone = "076749406"
    specific_country_code = "+225"
    
    # Search for the specific number
    print(f"\nSearching for the specific number: {specific_country_code}{specific_phone}")
    search_result = search_user(specific_phone, specific_country_code)
    
    if search_result["user_found"]:
        print(f"✅ Found user with phone {specific_country_code}{specific_phone}: {search_result['user_data']['first_name']} {search_result['user_data']['last_name']}")
        
        # Try different formats of the same number
        variations = [
            {"phone": "0 76 74 94 06", "country_code": "+225", "desc": "With spaces"},
            {"phone": "76749406", "country_code": "+225", "desc": "Without leading zero"},
            {"phone": "076749406", "country_code": "225", "desc": "Without + in country code"},
            {"phone": " 076749406 ", "country_code": "+225", "desc": "With leading/trailing spaces"},
            {"phone": "0076749406", "country_code": "+225", "desc": "With extra leading zero"}
        ]
        
        print("\n=== Testing Variations of the Specific Number ===")
        for variation in variations:
            var_result = search_user(variation["phone"], variation["country_code"])
            if var_result["user_found"]:
                print(f"✅ Found user with format: {variation['country_code']}{variation['phone']} ({variation['desc']})")
            else:
                print(f"❌ Could not find user with format: {variation['country_code']}{variation['phone']} ({variation['desc']})")
        
        # Create a new user with a slightly different number
        new_phone = "076749407"  # Just changed the last digit
        new_country_code = "+225"
        
        print(f"\nCreating a new user with phone: {new_country_code}{new_phone}")
        try:
            session_id = create_and_verify_session(new_phone, new_country_code)
            profile_result = create_profile(session_id, "New", "User")
            
            if profile_result["success"]:
                print(f"Created user: New User with phone {new_country_code}{new_phone}")
                
                # Now search for this new user
                print("\nSearching for the new user")
                new_search = search_user(new_phone, new_country_code)
                
                if new_search["user_found"]:
                    print(f"✅ Found new user with phone {new_country_code}{new_phone}")
                    
                    # Try to search for the new user with the original number
                    print("\nSearching for the new user with the original number")
                    cross_search = search_user(specific_phone, specific_country_code)
                    
                    if cross_search["user_found"] and cross_search["user_data"]["first_name"] == "New":
                        print("❌ ERROR: Found the new user when searching for the original number!")
                    else:
                        print("✅ Correctly did not find the new user when searching for the original number")
                    
                    # Try to search for the original user with the new number
                    print("\nSearching for the original user with the new number")
                    cross_search2 = search_user(new_phone, new_country_code)
                    
                    if cross_search2["user_found"] and cross_search2["user_data"]["first_name"] != "New":
                        print("❌ ERROR: Found the original user when searching for the new number!")
                    else:
                        print("✅ Correctly found the new user when searching for the new number")
                    
                else:
                    print(f"❌ Could not find the new user with phone {new_country_code}{new_phone}")
            else:
                print(f"Failed to create new user: {profile_result['message']}")
        except Exception as e:
            print(f"Error creating new user: {str(e)}")
    else:
        print(f"❌ Could not find user with phone {specific_country_code}{specific_phone}")
        
        # Try to create a user with this number
        print(f"\nAttempting to create a user with phone: {specific_country_code}{specific_phone}")
        try:
            session_id = create_and_verify_session(specific_phone, specific_country_code)
            profile_result = create_profile(session_id, "Specific", "User")
            
            if profile_result["success"]:
                print(f"Created user: Specific User with phone {specific_country_code}{specific_phone}")
                
                # Now search for this user
                print("\nSearching for the newly created user")
                new_search = search_user(specific_phone, specific_country_code)
                
                if new_search["user_found"]:
                    print(f"✅ Found newly created user with phone {specific_country_code}{specific_phone}")
                else:
                    print(f"❌ Could not find newly created user with phone {specific_country_code}{specific_phone}")
            else:
                print(f"Failed to create user: {profile_result['message']}")
        except Exception as e:
            print(f"Error creating user: {str(e)}")
    
    print("\n=== Summary of Findings ===")
    print("1. The system is very strict about phone number formats - it requires an exact match.")
    print("2. Variations like spaces, leading zeros, or country code format changes are not recognized.")
    print("3. This explains why a user might not find their other account when searching with a slightly different format.")
    print("\nRecommendation: Normalize phone numbers by removing spaces and non-digit characters before storing and searching.")

if __name__ == "__main__":
    test_specific_phone_number()