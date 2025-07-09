#!/usr/bin/env python3
import requests
import json
import time
import re
import statistics
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

# Load environment variables from frontend/.env
load_dotenv("/app/frontend/.env")

# Use the REACT_APP_BACKEND_URL from frontend/.env
BACKEND_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")

print(f"Using backend URL: {BACKEND_URL}")

# Test data
valid_phone = "6505551234"
valid_country_code = "+1"
invalid_code_short = "12345"  # Not 6 digits
invalid_code_letters = "12345a"  # Contains letters
valid_code = "123456"  # Any 6 digits should work

# Profile test data
valid_profile_data = {
    "first_name": "Jean",
    "last_name": "Dupont",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "city": "Paris",
    "country": "France",
    "occupation": "Engineer",
    "language": "fr",
    "currency": "FCFA"
}

update_profile_data = {
    "first_name": "Jean-Pierre",
    "city": "Lyon",
    "occupation": "Senior Engineer"
}

# Contact test data
contact_phone = "6505552222"
contact_country_code = "+1"

def test_send_code_endpoint():
    """Test the /api/auth/send-code endpoint"""
    print("\n=== Testing POST /api/auth/send-code ===")
    
    # Test with valid phone and country code
    url = f"{BACKEND_URL}/api/auth/send-code"
    payload = {
        "phone": valid_phone,
        "country_code": valid_country_code
    }
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "session_id" in data, "Expected session_id in response"
    assert data["session_id"] is not None, "Expected session_id to not be None"
    
    # Return session_id for use in other tests
    return data["session_id"]

def test_verify_code_endpoint(session_id):
    """Test the /api/auth/verify-code endpoint"""
    print("\n=== Testing POST /api/auth/verify-code ===")
    url = f"{BACKEND_URL}/api/auth/verify-code"
    
    # Test with invalid code format (too short)
    print("\nTesting with invalid code (too short):")
    payload = {
        "phone": valid_phone,
        "country_code": valid_country_code,
        "code": invalid_code_short
    }
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert data["success"] == False, "Expected success to be False for invalid code format"
    
    # Test with invalid code format (contains letters)
    print("\nTesting with invalid code (contains letters):")
    payload["code"] = invalid_code_letters
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert data["success"] == False, "Expected success to be False for invalid code format"
    
    # Test with valid code format
    print("\nTesting with valid code format:")
    payload["code"] = valid_code
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for valid code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert data["success"] == True, "Expected success to be True for valid code format"
    assert "session_id" in data, "Expected session_id in response"
    
    # Return verified session_id
    return data["session_id"]

def test_check_session_endpoint(session_id):
    """Test the /api/auth/check-session/{session_id} endpoint"""
    print("\n=== Testing GET /api/auth/check-session/{session_id} ===")
    
    # Test with valid session_id
    print("\nTesting with valid session_id:")
    url = f"{BACKEND_URL}/api/auth/check-session/{session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for valid session
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert data["valid"] == True, "Expected valid to be True for valid session"
    assert "phone" in data, "Expected phone in response"
    assert "country_code" in data, "Expected country_code in response"
    
    # Test with invalid session_id
    print("\nTesting with invalid session_id:")
    invalid_session_id = "invalid-session-id"
    url = f"{BACKEND_URL}/api/auth/check-session/{invalid_session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid session
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert data["valid"] == False, "Expected valid to be False for invalid session"

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

def test_profile_create_endpoint(session_id):
    """Test the /api/profile/create endpoint"""
    print("\n=== Testing POST /api/profile/create ===")
    
    # Test with valid session_id and profile data
    print("\nTesting with valid session_id and profile data:")
    url = f"{BACKEND_URL}/api/profile/create?session_id={session_id}"
    
    print(f"Sending request to {url} with payload: {valid_profile_data}")
    response = requests.post(url, json=valid_profile_data)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    profile_created = data["success"]
    
    if profile_created:
        # Profile was created successfully
        assert "profile" in data, "Expected profile in response"
        assert data["profile"] is not None, "Expected profile to not be None"
        assert data["profile"]["first_name"] == valid_profile_data["first_name"], "First name doesn't match"
        assert data["profile"]["last_name"] == valid_profile_data["last_name"], "Last name doesn't match"
        print("Profile created successfully")
    else:
        # Profile already exists or other error
        print(f"Profile not created: {data['message']}")
        if "Un profil existe déjà" in data["message"]:
            print("This is expected if the profile already exists")
    
    # Test with invalid session_id
    print("\nTesting with invalid session_id:")
    invalid_session_id = "invalid-session-id"
    url = f"{BACKEND_URL}/api/profile/create?session_id={invalid_session_id}"
    
    print(f"Sending request to {url} with payload: {valid_profile_data}")
    response = requests.post(url, json=valid_profile_data)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid session
    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    
    # Test with missing required fields
    print("\nTesting with missing required fields:")
    url = f"{BACKEND_URL}/api/profile/create?session_id={session_id}"
    invalid_profile_data = {
        # Missing first_name and last_name
        "city": "Paris",
        "country": "France"
    }
    
    print(f"Sending request to {url} with payload: {invalid_profile_data}")
    response = requests.post(url, json=invalid_profile_data)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for missing required fields
    assert response.status_code == 422, f"Expected status code 422, got {response.status_code}"
    
    return profile_created

def test_profile_get_endpoint(session_id):
    """Test the /api/profile/{session_id} GET endpoint"""
    print("\n=== Testing GET /api/profile/{session_id} ===")
    
    # Test with valid session_id
    print("\nTesting with valid session_id:")
    url = f"{BACKEND_URL}/api/profile/{session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "profile" in data, "Expected profile in response"
    assert data["profile"] is not None, "Expected profile to not be None"
    assert data["profile"]["first_name"] == valid_profile_data["first_name"], "First name doesn't match"
    assert data["profile"]["last_name"] == valid_profile_data["last_name"], "Last name doesn't match"
    
    # Test with invalid session_id
    print("\nTesting with invalid session_id:")
    invalid_session_id = "invalid-session-id"
    url = f"{BACKEND_URL}/api/profile/{invalid_session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid session
    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    
    # Test with non-existent profile (create a new session without profile)
    print("\nTesting with session that has no profile:")
    # Create a new session
    new_phone = "6505557777"
    new_session_id = create_and_verify_session(new_phone, valid_country_code)
    
    url = f"{BACKEND_URL}/api/profile/{new_session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for non-existent profile
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert data["success"] == False, "Expected success to be False for non-existent profile"
    assert "Profil non trouvé" in data["message"], "Expected profile not found message"
    
    return True

def test_profile_update_endpoint(session_id):
    """Test the /api/profile/{session_id} PUT endpoint"""
    print("\n=== Testing PUT /api/profile/{session_id} ===")
    
    # Test with valid session_id and update data
    print("\nTesting with valid session_id and update data:")
    url = f"{BACKEND_URL}/api/profile/{session_id}"
    
    print(f"Sending request to {url} with payload: {update_profile_data}")
    response = requests.put(url, json=update_profile_data)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "profile" in data, "Expected profile in response"
    assert data["profile"] is not None, "Expected profile to not be None"
    assert data["profile"]["first_name"] == update_profile_data["first_name"], "Updated first name doesn't match"
    assert data["profile"]["city"] == update_profile_data["city"], "Updated city doesn't match"
    assert data["profile"]["occupation"] == update_profile_data["occupation"], "Updated occupation doesn't match"
    # Fields not in update_profile_data should remain unchanged
    assert data["profile"]["last_name"] == valid_profile_data["last_name"], "Last name should remain unchanged"
    
    # Test with invalid session_id
    print("\nTesting with invalid session_id:")
    invalid_session_id = "invalid-session-id"
    url = f"{BACKEND_URL}/api/profile/{invalid_session_id}"
    
    print(f"Sending request to {url} with payload: {update_profile_data}")
    response = requests.put(url, json=update_profile_data)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid session
    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    
    # Test with non-existent profile (create a new session without profile)
    print("\nTesting with session that has no profile:")
    # Create a new session
    new_phone = "6505558888"
    new_session_id = create_and_verify_session(new_phone, valid_country_code)
    
    url = f"{BACKEND_URL}/api/profile/{new_session_id}"
    
    print(f"Sending request to {url} with payload: {update_profile_data}")
    response = requests.put(url, json=update_profile_data)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for non-existent profile
    assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"
    
    return True

def test_network_endpoint(session_id):
    """Test the /api/network/{session_id} endpoint"""
    print("\n=== Testing GET /api/network/{session_id} ===")
    
    # Test with valid session_id
    print("\nTesting with valid session_id:")
    url = f"{BACKEND_URL}/api/network/{session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "members" in data, "Expected members in response"
    assert isinstance(data["members"], list), "Expected members to be a list"
    
    # Validate member structure if there are members
    if len(data["members"]) > 0:
        member = data["members"][0]
        assert "id" in member, "Expected id in member"
        assert "full_name" in member, "Expected full_name in member"
        assert "initials" in member, "Expected initials in member"
        assert "trust_link" in member, "Expected trust_link in member"
        assert "common_tontines" in member, "Expected common_tontines in member"
        assert isinstance(member["common_tontines"], list), "Expected common_tontines to be a list"
    
    # Test with invalid session_id
    print("\nTesting with invalid session_id:")
    invalid_session_id = "invalid-session-id"
    url = f"{BACKEND_URL}/api/network/{invalid_session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid session
    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    
    return True

def test_chat_token_endpoint(session_id):
    """Test the /api/chat/token endpoint"""
    print("\n=== Testing POST /api/chat/token ===")
    
    # Test with valid session_id
    print("\nTesting with valid session_id:")
    url = f"{BACKEND_URL}/api/chat/token"
    payload = {
        "session_id": session_id
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload, headers=headers)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "token" in data, "Expected token in response"
    assert data["token"] is not None, "Expected token to not be None"
    assert "user_id" in data, "Expected user_id in response"
    assert "username" in data, "Expected username in response"
    assert "stream_api_key" in data, "Expected stream_api_key in response"
    
    # Test with invalid session_id
    print("\nTesting with invalid session_id:")
    invalid_session_id = "invalid-session-id"
    payload = {
        "session_id": invalid_session_id
    }
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload, headers=headers)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid session
    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    
    return True

def test_chat_channel_creation(session_id):
    """Test the /api/chat/channel endpoint"""
    print("\n=== Testing POST /api/chat/channel ===")
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Test creating a tontine channel
    print("\nTesting tontine channel creation:")
    url = f"{BACKEND_URL}/api/chat/channel"
    tontine_payload = {
        "session_id": session_id,
        "channel_type": "team",
        "channel_name": "Test Tontine Chat",
        "tontine_id": "tontine_123",
        "members": []  # Empty for now, would include other user IDs in real scenario
    }
    
    print(f"Sending request to {url} with payload: {tontine_payload}")
    response = requests.post(url, json=tontine_payload, headers=headers)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "channel_id" in data, "Expected channel_id in response"
    assert data["channel_id"] is not None, "Expected channel_id to not be None"
    assert "channel_cid" in data, "Expected channel_cid in response"
    assert data["channel_cid"].startswith("team:"), "Expected channel_cid to start with 'team:'"
    
    # Test creating a direct message channel
    print("\nTesting direct message channel creation:")
    dm_payload = {
        "session_id": session_id,
        "channel_type": "messaging",
        "channel_name": "Direct Message Test",
        "members": []  # Empty for now, would include other user IDs in real scenario
    }
    
    print(f"Sending request to {url} with payload: {dm_payload}")
    response = requests.post(url, json=dm_payload, headers=headers)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "channel_id" in data, "Expected channel_id in response"
    assert data["channel_id"] is not None, "Expected channel_id to not be None"
    assert "channel_cid" in data, "Expected channel_cid in response"
    assert data["channel_cid"].startswith("messaging:"), "Expected channel_cid to start with 'messaging:'"
    
    # Test with invalid session_id
    print("\nTesting with invalid session_id:")
    invalid_session_id = "invalid-session-id"
    invalid_payload = {
        "session_id": invalid_session_id,
        "channel_type": "team",
        "channel_name": "Invalid Session Test"
    }
    
    print(f"Sending request to {url} with payload: {invalid_payload}")
    response = requests.post(url, json=invalid_payload, headers=headers)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid session
    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    
    return True

def test_chat_channels_retrieval(session_id):
    """Test the /api/chat/channels/{session_id} endpoint"""
    print("\n=== Testing GET /api/chat/channels/{session_id} ===")
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Test with valid session_id
    print("\nTesting with valid session_id:")
    url = f"{BACKEND_URL}/api/chat/channels/{session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url, headers=headers)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "channels" in data, "Expected channels in response"
    assert isinstance(data["channels"], list), "Expected channels to be a list"
    
    # Validate channel structure if there are channels
    if len(data["channels"]) > 0:
        channel = data["channels"][0]
        assert "id" in channel, "Expected id in channel"
        assert "channel_id" in channel, "Expected channel_id in channel"
        assert "channel_type" in channel, "Expected channel_type in channel"
        assert "channel_cid" in channel, "Expected channel_cid in channel"
        assert "members" in channel, "Expected members in channel"
        assert isinstance(channel["members"], list), "Expected members to be a list"
    
    # Test with invalid session_id
    print("\nTesting with invalid session_id:")
    invalid_session_id = "invalid-session-id"
    url = f"{BACKEND_URL}/api/chat/channels/{invalid_session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url, headers=headers)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid session
    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    
    return True

def test_chat_message_sending(session_id):
    """Test sending messages to a GetStream channel"""
    print("\n=== Testing GetStream Message Sending ===")
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Step 1: Get a Stream token
    print("\nStep 1: Getting Stream token")
    token_url = f"{BACKEND_URL}/api/chat/token"
    token_payload = {
        "session_id": session_id
    }
    
    token_response = requests.post(token_url, json=token_payload, headers=headers)
    assert token_response.status_code == 200, f"Expected status code 200, got {token_response.status_code}"
    
    token_data = token_response.json()
    assert token_data["success"] == True, "Failed to get Stream token"
    
    stream_token = token_data["token"]
    user_id = token_data["user_id"]
    stream_api_key = token_data["stream_api_key"]
    
    print(f"Got Stream token for user {user_id}")
    
    # Step 2: Create a test channel
    print("\nStep 2: Creating a test channel")
    channel_url = f"{BACKEND_URL}/api/chat/channel"
    channel_payload = {
        "session_id": session_id,
        "channel_type": "team",
        "channel_name": f"Test Message Channel {uuid.uuid4()}",
        "members": []
    }
    
    channel_response = requests.post(channel_url, json=channel_payload, headers=headers)
    assert channel_response.status_code == 200, f"Expected status code 200, got {channel_response.status_code}"
    
    channel_data = channel_response.json()
    assert channel_data["success"] == True, "Failed to create channel"
    
    channel_id = channel_data["channel_id"]
    channel_cid = channel_data["channel_cid"]
    
    print(f"Created channel with ID: {channel_id} and CID: {channel_cid}")
    
    # Step 3: Send a message to the channel using the Stream API directly
    print("\nStep 3: Sending a message to the channel using Stream API")
    
    # Import the Stream Chat SDK
    from stream_chat import StreamChat
    
    # Get Stream API key and secret from environment variables
    import os
    from dotenv import load_dotenv
    load_dotenv("/app/backend/.env")
    STREAM_API_KEY = os.environ.get("STREAM_API_KEY")
    STREAM_API_SECRET = os.environ.get("STREAM_API_SECRET")
    
    # Initialize the Stream client with the API key and secret
    client = StreamChat(api_key=STREAM_API_KEY, api_secret=STREAM_API_SECRET)
    
    # Get the channel
    channel = client.channel("team", channel_id)
    
    # Send a message
    message_text = f"Test message sent at {datetime.now().isoformat()}"
    try:
        # Create message data - simplify to just text
        message = {
            "text": message_text
        }
        
        # Send the message using the server client
        message_response = channel.send_message(message, user_id)
        print(f"Message response: {message_response}")
        
        # Verify the message was sent successfully
        assert "message" in message_response, "No message in response"
        assert message_response["message"]["text"] == message_text, "Message text doesn't match"
        
        print("✅ Message sent successfully!")
        
        # Step 4: Retrieve the channel messages to verify
        print("\nStep 4: Retrieving channel messages")
        
        # Get the channel messages
        response = channel.query(messages={"limit": 10})
        
        print(f"Channel query response: {response}")
        
        # Verify the message is in the channel
        assert "messages" in response, "No messages in response"
        assert len(response["messages"]) > 0, "No messages in channel"
        
        # Find our message
        found_message = False
        for msg in response["messages"]:
            if msg["text"] == message_text:
                found_message = True
                break
        
        assert found_message, "Couldn't find our message in the channel"
        
        print("✅ Message successfully verified in channel!")
        return True
        
    except Exception as e:
        print(f"❌ Error sending message: {str(e)}")
        raise
        
def test_user_search_endpoint():
    """Test the /api/users/search endpoint"""
    print("\n=== Testing POST /api/users/search ===")
    
    # First, create a user profile to search for
    test_phone = f"650555{int(time.time()) % 10000}"
    test_country_code = "+1"
    
    # Create and verify a session
    session_id = create_and_verify_session(test_phone, test_country_code)
    
    # Create a profile for this user
    profile_data = {
        "first_name": "Test",
        "last_name": "User",
        "city": "Paris",
        "country": "France"
    }
    
    profile_response = requests.post(
        f"{BACKEND_URL}/api/profile/create?session_id={session_id}", 
        json=profile_data
    )
    
    assert profile_response.status_code == 200, f"Failed to create test profile: {profile_response.text}"
    
    # Now test searching for this user
    print("\nTesting search for existing user:")
    url = f"{BACKEND_URL}/api/users/search"
    payload = {
        "phone": test_phone,
        "country_code": test_country_code
    }
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert data["user_found"] == True, "Expected user_found to be True"
    assert "user_data" in data, "Expected user_data in response"
    assert data["user_data"] is not None, "Expected user_data to not be None"
    assert data["user_data"]["first_name"] == "Test", "First name doesn't match"
    assert data["user_data"]["last_name"] == "User", "Last name doesn't match"
    assert data["user_data"]["phone"] == test_phone, "Phone doesn't match"
    assert data["user_data"]["country_code"] == test_country_code, "Country code doesn't match"
    
    # Test searching for non-existent user
    print("\nTesting search for non-existent user:")
    non_existent_phone = "6505559999999"  # Very unlikely to exist
    payload = {
        "phone": non_existent_phone,
        "country_code": test_country_code
    }
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert data["user_found"] == False, "Expected user_found to be False"
    assert "user_data" not in data or data["user_data"] is None, "Expected no user_data for non-existent user"
    
    return session_id, test_phone, test_country_code

def test_add_contact_endpoint(session_id, contact_phone, contact_country_code):
    """Test the /api/users/add-contact endpoint"""
    print("\n=== Testing POST /api/users/add-contact ===")
    
    # Test adding a contact
    print("\nTesting adding a contact:")
    url = f"{BACKEND_URL}/api/users/add-contact"
    payload = {
        "session_id": session_id,
        "contact_phone": contact_phone,
        "contact_country_code": contact_country_code
    }
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "contact_id" in data, "Expected contact_id in response"
    assert data["contact_id"] is not None, "Expected contact_id to not be None"
    
    # Store the contact_id for later tests
    contact_id = data["contact_id"]
    
    # Test adding the same contact again (should return success but indicate it's already added)
    print("\nTesting adding the same contact again:")
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "Contact déjà ajouté" in data["message"], "Expected message to indicate contact already added"
    assert data["contact_id"] == contact_id, "Contact ID should match the previously added contact"
    
    # Test with invalid session_id
    print("\nTesting with invalid session_id:")
    invalid_session_id = "invalid-session-id"
    payload = {
        "session_id": invalid_session_id,
        "contact_phone": contact_phone,
        "contact_country_code": contact_country_code
    }
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid session
    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    
    # Test with non-existent contact
    print("\nTesting with non-existent contact:")
    payload = {
        "session_id": session_id,
        "contact_phone": "6505559999999",  # Very unlikely to exist
        "contact_country_code": contact_country_code
    }
    
    print(f"Sending request to {url} with payload: {payload}")
    response = requests.post(url, json=payload)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for non-existent contact
    assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"
    
    return contact_id

def test_get_contacts_endpoint(session_id):
    """Test the /api/users/contacts/{session_id} endpoint"""
    print("\n=== Testing GET /api/users/contacts/{session_id} ===")
    
    # Test with valid session_id
    print("\nTesting with valid session_id:")
    url = f"{BACKEND_URL}/api/users/contacts/{session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["success"] == True, "Expected success to be True"
    assert "contacts" in data, "Expected contacts in response"
    assert isinstance(data["contacts"], list), "Expected contacts to be a list"
    
    # Validate contact structure if there are contacts
    if len(data["contacts"]) > 0:
        contact = data["contacts"][0]
        assert "id" in contact, "Expected id in contact"
        assert "user_id" in contact, "Expected user_id in contact"
        assert "name" in contact, "Expected name in contact"
        assert "phone" in contact, "Expected phone in contact"
        assert "country_code" in contact, "Expected country_code in contact"
    
    # Test with invalid session_id
    print("\nTesting with invalid session_id:")
    invalid_session_id = "invalid-session-id"
    url = f"{BACKEND_URL}/api/users/contacts/{invalid_session_id}"
    
    print(f"Sending request to {url}")
    response = requests.get(url)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response body: {response.text}")
    
    # Validate response for invalid session
    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    
    return True

def test_user_search_and_add_contact_integration():
    """Test the integration of user search and add contact endpoints"""
    print("\n=== Testing User Search and Add Contact Integration ===")
    
    # Create two users for this test
    user1_phone = f"650555{int(time.time()) % 10000}"
    user2_phone = f"650555{(int(time.time()) + 1) % 10000}"
    test_country_code = "+1"
    
    # Create and verify sessions for both users
    user1_session_id = create_and_verify_session(user1_phone, test_country_code)
    user2_session_id = create_and_verify_session(user2_phone, test_country_code)
    
    # Create profiles for both users
    profile1_data = {
        "first_name": "User",
        "last_name": "One",
        "city": "Paris",
        "country": "France"
    }
    
    profile2_data = {
        "first_name": "User",
        "last_name": "Two",
        "city": "Lyon",
        "country": "France"
    }
    
    requests.post(
        f"{BACKEND_URL}/api/profile/create?session_id={user1_session_id}", 
        json=profile1_data
    )
    
    requests.post(
        f"{BACKEND_URL}/api/profile/create?session_id={user2_session_id}", 
        json=profile2_data
    )
    
    # Step 1: User1 searches for User2
    print("\nStep 1: User1 searches for User2")
    search_url = f"{BACKEND_URL}/api/users/search"
    search_payload = {
        "phone": user2_phone,
        "country_code": test_country_code
    }
    
    search_response = requests.post(search_url, json=search_payload)
    assert search_response.status_code == 200, f"Search failed: {search_response.text}"
    
    search_data = search_response.json()
    assert search_data["user_found"] == True, "User2 should be found"
    assert search_data["user_data"]["first_name"] == "User", "First name doesn't match"
    assert search_data["user_data"]["last_name"] == "Two", "Last name doesn't match"
    
    user2_id = search_data["user_data"]["id"]
    print(f"Found User2 with ID: {user2_id}")
    
    # Step 2: User1 adds User2 as a contact
    print("\nStep 2: User1 adds User2 as a contact")
    add_contact_url = f"{BACKEND_URL}/api/users/add-contact"
    add_contact_payload = {
        "session_id": user1_session_id,
        "contact_phone": user2_phone,
        "contact_country_code": test_country_code
    }
    
    add_contact_response = requests.post(add_contact_url, json=add_contact_payload)
    assert add_contact_response.status_code == 200, f"Add contact failed: {add_contact_response.text}"
    
    add_contact_data = add_contact_response.json()
    assert add_contact_data["success"] == True, "Adding contact should succeed"
    assert add_contact_data["contact_id"] == user2_id, "Contact ID should match User2's ID"
    
    # Step 3: Verify User2 is in User1's contacts
    print("\nStep 3: Verify User2 is in User1's contacts")
    contacts_url = f"{BACKEND_URL}/api/users/contacts/{user1_session_id}"
    
    contacts_response = requests.get(contacts_url)
    assert contacts_response.status_code == 200, f"Get contacts failed: {contacts_response.text}"
    
    contacts_data = contacts_response.json()
    assert contacts_data["success"] == True, "Getting contacts should succeed"
    
    # Find User2 in the contacts list
    user2_found = False
    for contact in contacts_data["contacts"]:
        if contact["id"] == user2_id:
            user2_found = True
            assert contact["first_name"] == "User", "First name doesn't match"
            assert contact["last_name"] == "Two", "Last name doesn't match"
            assert contact["phone"] == user2_phone, "Phone doesn't match"
            assert contact["country_code"] == test_country_code, "Country code doesn't match"
            break
    
    assert user2_found, "User2 should be in User1's contacts"
    
    print("✅ User search and add contact integration test passed!")
    return True

def run_all_tests():
    """Run all tests in sequence"""
    try:
        print(f"Starting backend API tests at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test MongoDB connectivity
        test_mongodb_connectivity()
        
        # Test authentication endpoints
        print("\n=== Testing Authentication Endpoints ===")
        # Test send code endpoint
        session_id = test_send_code_endpoint()
        print(f"Generated session_id: {session_id}")
        
        # Test verify code endpoint
        verified_session_id = test_verify_code_endpoint(session_id)
        print(f"Verified session_id: {verified_session_id}")
        
        # Test check session endpoint
        test_check_session_endpoint(verified_session_id)
        
        # Test profile endpoints
        print("\n=== Testing Profile Endpoints ===")
        
        # Create a new session with a unique phone number for profile tests
        unique_phone = f"650555{int(time.time()) % 10000}"
        print(f"\nCreating a new session with unique phone: {unique_phone}")
        
        new_session_id = create_and_verify_session(unique_phone, valid_country_code)
        print(f"New session ID for profile tests: {new_session_id}")
        
        # Test profile creation with the new session
        profile_created = test_profile_create_endpoint(new_session_id)
        
        # If profile creation failed, we'll use the original session for remaining tests
        test_session_id = new_session_id if profile_created else verified_session_id
        
        # Test profile retrieval
        test_profile_get_endpoint(test_session_id)
        
        # Test profile update
        test_profile_update_endpoint(test_session_id)
        
        # Test network endpoint
        print("\n=== Testing Network Endpoint ===")
        test_network_endpoint(test_session_id)
        
        # Test GetStream Chat endpoints
        print("\n=== Testing GetStream Chat Endpoints ===")
        test_chat_token_endpoint(test_session_id)
        test_chat_channel_creation(test_session_id)
        test_chat_channels_retrieval(test_session_id)
        
        # Test GetStream message sending
        test_chat_message_sending(test_session_id)
        
        # Test user search and contact management endpoints
        print("\n=== Testing User Search and Contact Management Endpoints ===")
        search_session_id, found_phone, found_country_code = test_user_search_endpoint()
        test_add_contact_endpoint(test_session_id, found_phone, found_country_code)
        test_get_contacts_endpoint(test_session_id)
        
        # Test integration of user search and add contact
        test_user_search_and_add_contact_integration()
        
        # Run performance tests
        print("\n=== Running Performance Tests ===")
        performance_test_results = run_performance_tests()
        
        print("\n=== All tests completed successfully! ===")
        return True
    except AssertionError as e:
        print(f"\n❌ Test failed: {str(e)}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return False

def test_mongodb_connectivity():
    """Test MongoDB connectivity by checking if sessions are stored properly"""
    print("\n=== Testing MongoDB Connectivity ===")
    
    # First, create a new session
    url = f"{BACKEND_URL}/api/auth/send-code"
    payload = {
        "phone": "6505559999",
        "country_code": "+1"
    }
    
    print(f"Creating a new session via {url}")
    response = requests.post(url, json=payload)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    session_id = data["session_id"]
    
    # Verify the session by checking it exists
    url = f"{BACKEND_URL}/api/auth/check-session/{session_id}"
    print(f"Verifying session exists in MongoDB via {url}")
    
    # Wait a moment to ensure data is stored
    time.sleep(0.5)
    
    response = requests.get(url)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # The session should exist but not be verified yet
    data = response.json()
    assert "valid" in data, "Expected 'valid' field in response"
    assert data["valid"] == False, "Expected session to be invalid (not verified yet)"
    
    # Now verify the session
    url = f"{BACKEND_URL}/api/auth/verify-code"
    payload = {
        "phone": "6505559999",
        "country_code": "+1",
        "code": "123456"
    }
    
    print(f"Verifying the session via {url}")
    response = requests.post(url, json=payload)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    # Check that the session is now verified
    url = f"{BACKEND_URL}/api/auth/check-session/{session_id}"
    print(f"Checking that session is now verified via {url}")
    
    response = requests.get(url)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    data = response.json()
    assert data["valid"] == True, "Expected session to be valid (verified)"
    
    print("MongoDB connectivity test passed - sessions are being stored and updated correctly")

def run_performance_tests(num_iterations=5):
    """Run performance tests on all endpoints"""
    send_code_times = []
    verify_code_times = []
    check_session_times = []
    profile_create_times = []
    profile_get_times = []
    profile_update_times = []
    network_get_times = []
    chat_token_times = []
    chat_channel_times = []
    chat_channels_get_times = []
    
    for i in range(num_iterations):
        print(f"\nPerformance test iteration {i+1}/{num_iterations}")
        
        # Test send-code performance
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/api/auth/send-code", 
            json={"phone": f"650555{i}234", "country_code": "+1"}
        )
        end_time = time.time()
        send_code_times.append((end_time - start_time) * 1000)  # Convert to ms
        
        session_id = response.json()["session_id"]
        
        # Test verify-code performance
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/api/auth/verify-code", 
            json={"phone": f"650555{i}234", "country_code": "+1", "code": "123456"}
        )
        end_time = time.time()
        verify_code_times.append((end_time - start_time) * 1000)  # Convert to ms
        
        # Test check-session performance
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/api/auth/check-session/{session_id}")
        end_time = time.time()
        check_session_times.append((end_time - start_time) * 1000)  # Convert to ms
        
        # Test profile-create performance
        start_time = time.time()
        profile_data = {
            "first_name": f"User{i}",
            "last_name": f"Test{i}",
            "date_of_birth": "1990-01-01",
            "gender": "male",
            "city": "Paris",
            "country": "France"
        }
        response = requests.post(f"{BACKEND_URL}/api/profile/create?session_id={session_id}", json=profile_data)
        end_time = time.time()
        profile_create_times.append((end_time - start_time) * 1000)  # Convert to ms
        
        # Test profile-get performance
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/api/profile/{session_id}")
        end_time = time.time()
        profile_get_times.append((end_time - start_time) * 1000)  # Convert to ms
        
        # Test profile-update performance
        start_time = time.time()
        update_data = {
            "city": f"NewCity{i}",
            "occupation": f"Occupation{i}"
        }
        response = requests.put(f"{BACKEND_URL}/api/profile/{session_id}", json=update_data)
        end_time = time.time()
        profile_update_times.append((end_time - start_time) * 1000)  # Convert to ms
        
        # Test network-get performance
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/api/network/{session_id}")
        end_time = time.time()
        network_get_times.append((end_time - start_time) * 1000)  # Convert to ms
        
        # Test chat-token performance
        start_time = time.time()
        response = requests.post(
            f"{BACKEND_URL}/api/chat/token",
            json={"session_id": session_id}
        )
        end_time = time.time()
        chat_token_times.append((end_time - start_time) * 1000)  # Convert to ms
        
        # Test chat-channel creation performance
        start_time = time.time()
        channel_data = {
            "session_id": session_id,
            "channel_type": "team",
            "channel_name": f"Test Channel {i}",
            "tontine_id": f"tontine_{i}"
        }
        response = requests.post(f"{BACKEND_URL}/api/chat/channel", json=channel_data)
        end_time = time.time()
        chat_channel_times.append((end_time - start_time) * 1000)  # Convert to ms
        
        # Test chat-channels retrieval performance
        start_time = time.time()
        response = requests.get(f"{BACKEND_URL}/api/chat/channels/{session_id}")
        end_time = time.time()
        chat_channels_get_times.append((end_time - start_time) * 1000)  # Convert to ms
    
    # Calculate and print statistics
    print("\nPerformance Test Results (in milliseconds):")
    print(f"  send-code:      avg={statistics.mean(send_code_times):.2f}ms, min={min(send_code_times):.2f}ms, max={max(send_code_times):.2f}ms")
    print(f"  verify-code:    avg={statistics.mean(verify_code_times):.2f}ms, min={min(verify_code_times):.2f}ms, max={max(verify_code_times):.2f}ms")
    print(f"  check-session:  avg={statistics.mean(check_session_times):.2f}ms, min={min(check_session_times):.2f}ms, max={max(check_session_times):.2f}ms")
    print(f"  profile-create: avg={statistics.mean(profile_create_times):.2f}ms, min={min(profile_create_times):.2f}ms, max={max(profile_create_times):.2f}ms")
    print(f"  profile-get:    avg={statistics.mean(profile_get_times):.2f}ms, min={min(profile_get_times):.2f}ms, max={max(profile_get_times):.2f}ms")
    print(f"  profile-update: avg={statistics.mean(profile_update_times):.2f}ms, min={min(profile_update_times):.2f}ms, max={max(profile_update_times):.2f}ms")
    print(f"  network-get:    avg={statistics.mean(network_get_times):.2f}ms, min={min(network_get_times):.2f}ms, max={max(network_get_times):.2f}ms")
    print(f"  chat-token:     avg={statistics.mean(chat_token_times):.2f}ms, min={min(chat_token_times):.2f}ms, max={max(chat_token_times):.2f}ms")
    print(f"  chat-channel:   avg={statistics.mean(chat_channel_times):.2f}ms, min={min(chat_channel_times):.2f}ms, max={max(chat_channel_times):.2f}ms")
    print(f"  chat-channels:  avg={statistics.mean(chat_channels_get_times):.2f}ms, min={min(chat_channels_get_times):.2f}ms, max={max(chat_channels_get_times):.2f}ms")
    
    return {
        "send_code": {
            "avg": statistics.mean(send_code_times),
            "min": min(send_code_times),
            "max": max(send_code_times)
        },
        "verify_code": {
            "avg": statistics.mean(verify_code_times),
            "min": min(verify_code_times),
            "max": max(verify_code_times)
        },
        "check_session": {
            "avg": statistics.mean(check_session_times),
            "min": min(check_session_times),
            "max": max(check_session_times)
        },
        "profile_create": {
            "avg": statistics.mean(profile_create_times),
            "min": min(profile_create_times),
            "max": max(profile_create_times)
        },
        "profile_get": {
            "avg": statistics.mean(profile_get_times),
            "min": min(profile_get_times),
            "max": max(profile_get_times)
        },
        "profile_update": {
            "avg": statistics.mean(profile_update_times),
            "min": min(profile_update_times),
            "max": max(profile_update_times)
        },
        "network_get": {
            "avg": statistics.mean(network_get_times),
            "min": min(network_get_times),
            "max": max(network_get_times)
        },
        "chat_token": {
            "avg": statistics.mean(chat_token_times),
            "min": min(chat_token_times),
            "max": max(chat_token_times)
        },
        "chat_channel": {
            "avg": statistics.mean(chat_channel_times),
            "min": min(chat_channel_times),
            "max": max(chat_channel_times)
        },
        "chat_channels_get": {
            "avg": statistics.mean(chat_channels_get_times),
            "min": min(chat_channels_get_times),
            "max": max(chat_channels_get_times)
        }
    }

def test_phone_number_normalization():
    """Test the phone number normalization functionality in user search"""
    print("\n=== Testing Phone Number Normalization in User Search ===")
    
    # Create a user with a specific phone number format
    base_phone = f"12345678"  # Simple 8-digit number
    test_country_code = "+33"
    
    # Create and verify a session
    session_id = create_and_verify_session(base_phone, test_country_code)
    
    # Create a profile for this user
    profile_data = {
        "first_name": "Test",
        "last_name": "Normalization",
        "city": "Paris",
        "country": "France"
    }
    
    profile_response = requests.post(
        f"{BACKEND_URL}/api/profile/create?session_id={session_id}", 
        json=profile_data
    )
    
    assert profile_response.status_code == 200, f"Failed to create test profile: {profile_response.text}"
    print(f"Created user with phone number: {base_phone}")
    
    # Test different phone number formats
    test_formats = [
        {"format": base_phone, "description": "Original format", "should_work": True},
        {"format": "1 2 3 4 5 6 7 8", "description": "With spaces", "should_work": True},
        {"format": "1-2-3-4-5-6-7-8", "description": "With hyphens", "should_work": True},
        {"format": "123456780", "description": "With extra digit at end", "should_work": False},
        {"format": "012345678", "description": "With extra digit at beginning", "should_work": False}
    ]
    
    search_url = f"{BACKEND_URL}/api/users/search"
    
    results = []
    
    for test_case in test_formats:
        print(f"\nTesting search with {test_case['description']}: '{test_case['format']}'")
        payload = {
            "phone": test_case["format"],
            "country_code": test_country_code
        }
        
        response = requests.post(search_url, json=payload)
        assert response.status_code == 200, f"Search request failed: {response.text}"
        
        data = response.json()
        found = data.get("user_found", False)
        
        result = {
            "format": test_case["format"],
            "description": test_case["description"],
            "found": found,
            "expected": test_case["should_work"],
            "passed": found == test_case["should_work"]
        }
        
        results.append(result)
        
        print(f"  Search result: {'Found' if found else 'Not found'}")
        print(f"  Expected: {'Should find' if test_case['should_work'] else 'Should not find'}")
        print(f"  Test {'PASSED' if result['passed'] else 'FAILED'}")
    
    # Print summary
    print("\nPhone Number Normalization Test Summary:")
    all_passed = True
    for result in results:
        status = "PASSED" if result["passed"] else "FAILED"
        print(f"  {result['description']}: {status}")
        if not result["passed"]:
            all_passed = False
    
    if all_passed:
        print("\n✅ All phone number normalization tests passed!")
    else:
        print("\n❌ Some phone number normalization tests failed!")
        print("The normalize_phone() function may not be working correctly for all formats.")
        print("Check the implementation in server.py.")
    
    return all_passed

def run_phone_normalization_test():
    """Run only the phone number normalization test"""
    try:
        print(f"Starting phone number normalization test at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        result = test_phone_number_normalization()
        print(f"\nPhone normalization test {'passed' if result else 'failed'}!")
        return result
    except Exception as e:
        print(f"\n❌ Unexpected error in phone normalization test: {str(e)}")
        return False

if __name__ == "__main__":
    # Uncomment the test you want to run
    # run_all_tests()
    run_phone_normalization_test()