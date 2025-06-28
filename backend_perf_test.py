#!/usr/bin/env python3
import requests
import json
import time
import re
from datetime import datetime
import statistics

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    env_content = f.read()
    backend_url_match = re.search(r'REACT_APP_BACKEND_URL=(.+)', env_content)
    if backend_url_match:
        BACKEND_URL = backend_url_match.group(1).strip()
    else:
        raise ValueError("Could not find REACT_APP_BACKEND_URL in frontend/.env")

print(f"Using backend URL: {BACKEND_URL}")

# Test data
valid_phone = "6505551234"
valid_country_code = "+1"
valid_code = "123456"  # Any 6 digits should work

def measure_response_time(endpoint, method="GET", payload=None, session_id=None):
    """Measure response time for an endpoint"""
    url = f"{BACKEND_URL}{endpoint}"
    if session_id:
        url = url.replace("{session_id}", session_id)
    
    start_time = time.time()
    
    if method == "GET":
        response = requests.get(url)
    elif method == "POST":
        response = requests.post(url, json=payload)
    
    end_time = time.time()
    response_time = (end_time - start_time) * 1000  # Convert to milliseconds
    
    return {
        "endpoint": endpoint,
        "method": method,
        "status_code": response.status_code,
        "response_time_ms": response_time,
        "success": response.status_code == 200
    }

def run_performance_tests(num_iterations=5):
    """Run performance tests on authentication endpoints"""
    print(f"Starting performance tests at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Running {num_iterations} iterations for each endpoint")
    
    # Test results
    send_code_times = []
    verify_code_times = []
    check_session_times = []
    
    for i in range(num_iterations):
        print(f"\nIteration {i+1}/{num_iterations}")
        
        # Test send code endpoint
        send_code_result = measure_response_time(
            endpoint="/api/auth/send-code",
            method="POST",
            payload={
                "phone": valid_phone,
                "country_code": valid_country_code
            }
        )
        send_code_times.append(send_code_result["response_time_ms"])
        print(f"POST /api/auth/send-code: {send_code_result['response_time_ms']:.2f} ms")
        
        # Get session_id from response
        response = requests.post(
            f"{BACKEND_URL}/api/auth/send-code",
            json={
                "phone": valid_phone,
                "country_code": valid_country_code
            }
        )
        session_id = response.json()["session_id"]
        
        # Test verify code endpoint
        verify_code_result = measure_response_time(
            endpoint="/api/auth/verify-code",
            method="POST",
            payload={
                "phone": valid_phone,
                "country_code": valid_country_code,
                "code": valid_code
            }
        )
        verify_code_times.append(verify_code_result["response_time_ms"])
        print(f"POST /api/auth/verify-code: {verify_code_result['response_time_ms']:.2f} ms")
        
        # Test check session endpoint
        check_session_result = measure_response_time(
            endpoint="/api/auth/check-session/{session_id}",
            method="GET",
            session_id=session_id
        )
        check_session_times.append(check_session_result["response_time_ms"])
        print(f"GET /api/auth/check-session/{session_id}: {check_session_result['response_time_ms']:.2f} ms")
    
    # Calculate statistics
    print("\n=== Performance Test Results ===")
    print(f"POST /api/auth/send-code:")
    print(f"  Min: {min(send_code_times):.2f} ms")
    print(f"  Max: {max(send_code_times):.2f} ms")
    print(f"  Avg: {statistics.mean(send_code_times):.2f} ms")
    print(f"  Median: {statistics.median(send_code_times):.2f} ms")
    
    print(f"\nPOST /api/auth/verify-code:")
    print(f"  Min: {min(verify_code_times):.2f} ms")
    print(f"  Max: {max(verify_code_times):.2f} ms")
    print(f"  Avg: {statistics.mean(verify_code_times):.2f} ms")
    print(f"  Median: {statistics.median(verify_code_times):.2f} ms")
    
    print(f"\nGET /api/auth/check-session/{{session_id}}:")
    print(f"  Min: {min(check_session_times):.2f} ms")
    print(f"  Max: {max(check_session_times):.2f} ms")
    print(f"  Avg: {statistics.mean(check_session_times):.2f} ms")
    print(f"  Median: {statistics.median(check_session_times):.2f} ms")
    
    print("\n=== All performance tests completed! ===")

if __name__ == "__main__":
    run_performance_tests()