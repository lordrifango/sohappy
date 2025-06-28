#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import sys
from pathlib import Path

# Load environment variables
ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME')

if not mongo_url or not db_name:
    print("Error: MONGO_URL or DB_NAME environment variables not found")
    sys.exit(1)

print(f"Connecting to MongoDB at {mongo_url}, database: {db_name}")

async def check_mongodb_connection():
    """Check MongoDB connection and list collections"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Check connection
        await client.admin.command('ping')
        print("MongoDB connection successful!")
        
        # List collections
        collections = await db.list_collection_names()
        print(f"Collections in {db_name} database: {collections}")
        
        # Count user sessions
        session_count = await db.user_sessions.count_documents({})
        print(f"Number of user sessions: {session_count}")
        
        # Get a sample of user sessions
        if session_count > 0:
            print("\nSample user sessions:")
            async for session in db.user_sessions.find().limit(5):
                # Remove verification code for security
                if 'verification_code' in session:
                    session['verification_code'] = '******'
                print(f"  - {session}")
        
        # Check for verified sessions
        verified_count = await db.user_sessions.count_documents({"is_verified": True})
        print(f"Number of verified sessions: {verified_count}")
        
        # Close connection
        client.close()
        
    except Exception as e:
        print(f"Error connecting to MongoDB: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    result = asyncio.run(check_mongodb_connection())
    if result:
        print("\nMongoDB connectivity test passed!")
    else:
        print("\nMongoDB connectivity test failed!")
        sys.exit(1)