#!/usr/bin/env python3
import requests
import json
import time
import uuid
from datetime import datetime
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

headers = {
    "Content-Type": "application/json"
}

def create_and_verify_session(phone, country_code):
    """Helper function to create and verify a session"""
    # Create session
    response = requests.post(
        f"{BACKEND_URL}/api/auth/send-code", 
        json={"phone": phone, "country_code": country_code},
        headers=headers
    )
    session_id = response.json()["session_id"]
    
    # Verify session
    requests.post(
        f"{BACKEND_URL}/api/auth/verify-code", 
        json={"phone": phone, "country_code": country_code, "code": "123456"},
        headers=headers
    )
    
    return session_id

def create_profile(session_id):
    """Create a user profile"""
    response = requests.post(
        f"{BACKEND_URL}/api/profile/create?session_id={session_id}",
        json=valid_profile_data,
        headers=headers
    )
    return response.json()

def get_stream_token(session_id):
    """Get a Stream token for the user"""
    response = requests.post(
        f"{BACKEND_URL}/api/chat/token",
        json={"session_id": session_id},
        headers=headers
    )
    return response.json()

def create_channel(session_id):
    """Create a test channel"""
    response = requests.post(
        f"{BACKEND_URL}/api/chat/channel",
        json={
            "session_id": session_id,
            "channel_type": "team",
            "channel_name": f"Test Channel {uuid.uuid4()}",
            "members": []
        },
        headers=headers
    )
    return response.json()

def test_message_sending():
    """Test sending a message to a GetStream channel"""
    try:
        # Step 1: Create and verify a session
        print("\nStep 1: Creating and verifying a session")
        unique_phone = f"650555{int(time.time()) % 10000}"
        session_id = create_and_verify_session(unique_phone, valid_country_code)
        print(f"Created and verified session: {session_id}")
        
        # Step 2: Create a profile
        print("\nStep 2: Creating a profile")
        profile_response = create_profile(session_id)
        if not profile_response.get("success", False):
            print(f"Failed to create profile: {profile_response}")
            return False
        print("Profile created successfully")
        
        # Step 3: Get a Stream token
        print("\nStep 3: Getting a Stream token")
        token_response = get_stream_token(session_id)
        if not token_response.get("success", False):
            print(f"Failed to get Stream token: {token_response}")
            return False
        
        stream_token = token_response["token"]
        user_id = token_response["user_id"]
        stream_api_key = token_response["stream_api_key"]
        print(f"Got Stream token for user {user_id}")
        
        # Step 4: Create a channel
        print("\nStep 4: Creating a channel")
        channel_response = create_channel(session_id)
        if not channel_response.get("success", False):
            print(f"Failed to create channel: {channel_response}")
            return False
        
        channel_id = channel_response["channel_id"]
        channel_cid = channel_response["channel_cid"]
        print(f"Created channel with ID: {channel_id} and CID: {channel_cid}")
        
        # Step 5: Send a message to the channel
        print("\nStep 5: Sending a message to the channel")
        
        # Import the Stream Chat SDK
        from stream_chat import StreamChat
        
        # Initialize the Stream client with the API key and token
        client = StreamChat(api_key=stream_api_key, api_secret=None, timeout=10)
        client.set_user_token(user_id, stream_token)
        
        # Get the channel
        channel = client.channel("team", channel_id)
        
        # Send a message
        message_text = f"Test message sent at {datetime.now().isoformat()}"
        
        # Try different approaches to send a message
        try:
            print("Approach 1: Using send_message with message dict and user_id")
            message = {
                "text": message_text
            }
            message_response = channel.send_message(message, user_id)
            print(f"Message response: {json.dumps(message_response, indent=2)}")
        except Exception as e:
            print(f"Approach 1 failed: {str(e)}")
            
            try:
                print("\nApproach 2: Using send_message with text only")
                message_response = channel.send_message({"text": message_text})
                print(f"Message response: {json.dumps(message_response, indent=2)}")
            except Exception as e:
                print(f"Approach 2 failed: {str(e)}")
                
                try:
                    print("\nApproach 3: Using create_message")
                    message_response = channel.create_message({"text": message_text, "user": {"id": user_id}})
                    print(f"Message response: {json.dumps(message_response, indent=2)}")
                except Exception as e:
                    print(f"Approach 3 failed: {str(e)}")
                    
                    try:
                        print("\nApproach 4: Using direct API call")
                        # Get the Stream API URL
                        api_url = f"https://chat-us-east-1.stream-io-api.com/channels/team/{channel_id}/message"
                        
                        # Prepare headers with authentication
                        api_headers = {
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {stream_token}",
                            "Stream-Auth-Type": "jwt"
                        }
                        
                        # Prepare message payload
                        message_payload = {
                            "message": {
                                "text": message_text,
                                "user_id": user_id
                            }
                        }
                        
                        # Send the request
                        api_response = requests.post(api_url, headers=api_headers, json=message_payload)
                        print(f"API Response: {api_response.status_code}")
                        print(f"API Response Body: {api_response.text}")
                        
                        if api_response.status_code == 200:
                            message_response = api_response.json()
                        else:
                            raise Exception(f"API call failed with status {api_response.status_code}")
                    except Exception as e:
                        print(f"Approach 4 failed: {str(e)}")
                        raise
        
        # Verify the message was sent successfully
        if "message" not in message_response:
            print("No message in response")
            return False
        
        if message_response["message"]["text"] != message_text:
            print(f"Message text doesn't match. Expected: {message_text}, Got: {message_response['message']['text']}")
            return False
        
        print("✅ Message sent successfully!")
        
        # Step 6: Retrieve the channel messages to verify
        print("\nStep 6: Retrieving channel messages")
        
        # Get the channel messages
        response = channel.query({"messages": {"limit": 10}})
        
        print(f"Channel query response: {json.dumps(response, indent=2)}")
        
        # Verify the message is in the channel
        if "messages" not in response:
            print("No messages in response")
            return False
        
        if len(response["messages"]) == 0:
            print("No messages in channel")
            return False
        
        # Find our message
        found_message = False
        for msg in response["messages"]:
            if msg["text"] == message_text:
                found_message = True
                break
        
        if not found_message:
            print("Couldn't find our message in the channel")
            return False
        
        print("✅ Message successfully verified in channel!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_message_sending()
    print(f"\nTest {'succeeded' if success else 'failed'}")