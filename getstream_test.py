#!/usr/bin/env python3
import requests
import json
import time
import uuid
from datetime import datetime
from stream_chat import StreamChat

# Use the external backend URL for testing
import os
from dotenv import load_dotenv

# Load environment variables from frontend .env file
load_dotenv("/app/frontend/.env")

# Get the backend URL from environment
BACKEND_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")
if not BACKEND_URL.endswith("/api"):
    BACKEND_URL = f"{BACKEND_URL}/api"

print(f"Using backend URL: {BACKEND_URL}")

# Test data
valid_phone = "6505551234"
valid_country_code = "+1"
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

def create_and_verify_session(phone, country_code):
    """Helper function to create and verify a session"""
    # Create session
    response = requests.post(
        f"{BACKEND_URL}/auth/send-code", 
        json={"phone": phone, "country_code": country_code}
    )
    print(f"Send code response: {response.text}")
    data = response.json()
    if not data.get("success"):
        raise Exception(f"Failed to create session: {data.get('message')}")
    
    session_id = data["session_id"]
    
    # Verify session
    verify_response = requests.post(
        f"{BACKEND_URL}/auth/verify-code", 
        json={"phone": phone, "country_code": country_code, "code": "123456"}
    )
    print(f"Verify code response: {verify_response.text}")
    verify_data = verify_response.json()
    if not verify_data.get("success"):
        raise Exception(f"Failed to verify session: {verify_data.get('message')}")
    
    return session_id

def create_user_profile(session_id):
    """Create a user profile if it doesn't exist"""
    # Check if profile exists
    response = requests.get(f"{BACKEND_URL}/profile/{session_id}")
    print(f"Profile check response: {response.text}")
    data = response.json()
    
    if not data["success"]:
        # Create profile
        response = requests.post(
            f"{BACKEND_URL}/profile/create?session_id={session_id}", 
            json=valid_profile_data
        )
        print(f"Profile creation response: {response.text}")
        return response.json()["success"]
    
    return True

def get_stream_token(session_id):
    """Get a Stream token for the user"""
    response = requests.post(
        f"{BACKEND_URL}/chat/token",
        json={"session_id": session_id}
    )
    
    print(f"Stream token response: {response.text}")
    return response.json()

def create_test_channel(session_id, channel_name=None):
    """Create a test channel"""
    if not channel_name:
        channel_name = f"Test Channel {uuid.uuid4()}"
        
    response = requests.post(
        f"{BACKEND_URL}/chat/channel",
        json={
            "session_id": session_id,
            "channel_type": "team",
            "channel_name": channel_name,
            "tontine_id": f"test_tontine_{uuid.uuid4()}"
        }
    )
    
    print(f"Channel creation response: {response.text}")
    return response.json()

def get_user_channels(session_id):
    """Get all channels for a user"""
    response = requests.get(f"{BACKEND_URL}/chat/channels/{session_id}")
    print(f"Get channels response: {response.text}")
    return response.json()

def test_send_message_with_stream_sdk(token_data, channel_data):
    """Test sending a message using the Stream SDK directly"""
    print("\n=== Testing message sending with Stream SDK ===")
    
    try:
        # Initialize Stream client with the token
        api_key = token_data.get("stream_api_key")
        token = token_data.get("token")
        user_id = token_data.get("user_id")
        
        print(f"Initializing Stream client with:")
        print(f"  API Key: {api_key}")
        print(f"  Token: {token}")
        print(f"  User ID: {user_id}")
        
        # Initialize the client
        stream_client = StreamChat(api_key=api_key, token=token)
        
        # Get the channel
        channel_id = channel_data["channel_id"]
        channel_type = "team"  # This should match what was used in channel creation
        
        # Get the channel
        channel = stream_client.channel(channel_type, channel_id)
        
        # Try to query the channel to verify it exists and we have access
        try:
            channel_state = channel.query()
            print(f"Channel query successful: {json.dumps(channel_state, indent=2)}")
        except Exception as e:
            print(f"❌ Error querying channel: {str(e)}")
            return False
        
        # Try to send a message
        try:
            message = {
                "text": f"Test message sent at {datetime.now().isoformat()}",
                "user_id": user_id
            }
            
            response = channel.send_message(message)
            print(f"Message send response: {json.dumps(response, indent=2)}")
            
            if "message" in response:
                print("✅ Message sent successfully!")
                return True
            else:
                print("❌ Message not sent, but no error was raised")
                return False
                
        except Exception as e:
            print(f"❌ Error sending message: {str(e)}")
            return False
            
    except Exception as e:
        print(f"❌ Error initializing Stream client: {str(e)}")
        return False

def test_direct_stream_api_access(token_data):
    """Test direct access to Stream API using the token"""
    print("\n=== Testing direct Stream API access ===")
    
    try:
        # Initialize Stream client with the API key and secret from the backend
        api_key = token_data.get("stream_api_key")
        token = token_data.get("token")
        user_id = token_data.get("user_id")
        
        print(f"Initializing Stream client with:")
        print(f"  API Key: {api_key}")
        print(f"  Token: {token}")
        print(f"  User ID: {user_id}")
        
        # Initialize the client
        stream_client = StreamChat(api_key=api_key, token=token)
        
        # Try to get the user
        try:
            user = stream_client.get_user(user_id)
            print(f"User data: {json.dumps(user, indent=2)}")
            print("✅ Successfully retrieved user data from Stream API")
        except Exception as e:
            print(f"❌ Error getting user data: {str(e)}")
            return False
            
        # Try to list channels
        try:
            filter_criteria = {"members": {"$in": [user_id]}}
            channels = stream_client.query_channels(filter_criteria, sort=[{"last_message_at": -1}])
            print(f"Channels: {json.dumps(channels, indent=2)}")
            print(f"✅ Successfully retrieved {len(channels['channels'])} channels from Stream API")
        except Exception as e:
            print(f"❌ Error listing channels: {str(e)}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Error initializing Stream client: {str(e)}")
        return False

def test_channel_permissions(token_data, channel_data):
    """Test channel permissions"""
    print("\n=== Testing channel permissions ===")
    
    try:
        # Initialize Stream client with the token
        api_key = token_data.get("stream_api_key")
        token = token_data.get("token")
        user_id = token_data.get("user_id")
        
        print(f"Initializing Stream client with:")
        print(f"  API Key: {api_key}")
        print(f"  Token: {token}")
        print(f"  User ID: {user_id}")
        
        # Initialize the client
        stream_client = StreamChat(api_key=api_key, token=token)
        
        # Get the channel
        channel_id = channel_data["channel_id"]
        channel_type = "team"
        
        channel = stream_client.channel(channel_type, channel_id)
        
        # Check if the user is a member of the channel
        try:
            channel_state = channel.query()
            members = channel_state.get("members", [])
            
            is_member = any(member.get("user_id") == user_id for member in members)
            print(f"User {user_id} is a member of the channel: {is_member}")
            
            if not is_member:
                print("❌ User is not a member of the channel, which may prevent sending messages")
                return False
                
            # Check channel permissions
            print(f"Channel type: {channel_state.get('channel', {}).get('type')}")
            print(f"Channel created by: {channel_state.get('channel', {}).get('created_by', {}).get('id')}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error checking channel permissions: {str(e)}")
            return False
            
    except Exception as e:
        print(f"❌ Error initializing Stream client: {str(e)}")
        return False

def run_getstream_tests():
    """Run all GetStream tests"""
    try:
        print(f"Starting GetStream integration tests at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Create a unique phone number for this test
        unique_phone = f"650555{int(time.time()) % 10000}"
        print(f"Creating a new session with unique phone: {unique_phone}")
        
        # Create and verify a session
        session_id = create_and_verify_session(unique_phone, valid_country_code)
        print(f"Created and verified session: {session_id}")
        
        # Create a user profile
        profile_created = create_user_profile(session_id)
        if not profile_created:
            print("❌ Failed to create user profile")
            return False
        
        # Get a Stream token
        token_data = get_stream_token(session_id)
        if not token_data["success"]:
            print("❌ Failed to get Stream token")
            return False
        
        # Test direct Stream API access
        api_access = test_direct_stream_api_access(token_data)
        if not api_access:
            print("❌ Failed to access Stream API directly")
            return False
        
        # Create a test channel
        channel_data = create_test_channel(session_id)
        if not channel_data["success"]:
            print("❌ Failed to create test channel")
            return False
        
        # Get user channels to verify the channel was created
        channels_data = get_user_channels(session_id)
        if not channels_data["success"]:
            print("❌ Failed to get user channels")
            return False
        
        # Test channel permissions
        permissions_ok = test_channel_permissions(token_data, channel_data)
        if not permissions_ok:
            print("❌ Channel permissions issue detected")
            return False
        
        # Test sending a message
        message_sent = test_send_message_with_stream_sdk(token_data, channel_data)
        if not message_sent:
            print("❌ Failed to send message with Stream SDK")
            return False
        
        print("\n✅ All GetStream tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Unexpected error in GetStream tests: {str(e)}")
        return False

if __name__ == "__main__":
    run_getstream_tests()