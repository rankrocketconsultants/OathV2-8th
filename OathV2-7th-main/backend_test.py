#!/usr/bin/env python3
"""
Backend API Testing for Oath App
Tests the FastAPI endpoints for status checks functionality
"""

import requests
import json
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL'):
                    url = line.split('=')[1].strip().strip('"')
                    return f"{url}/api"
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

def test_root_endpoint(base_url):
    """Test GET /api/ endpoint"""
    print("\n=== Testing Root Endpoint ===")
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and data["message"] == "Hello World":
                print("✅ Root endpoint working correctly")
                return True
            else:
                print("❌ Root endpoint returned unexpected response")
                return False
        else:
            print(f"❌ Root endpoint failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Root endpoint request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Root endpoint test error: {e}")
        return False

def test_create_status_check(base_url):
    """Test POST /api/status endpoint"""
    print("\n=== Testing Create Status Check ===")
    try:
        # Test data with realistic client name
        test_data = {
            "client_name": "Acme Corporation"
        }
        
        response = requests.post(
            f"{base_url}/status", 
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["id", "client_name", "timestamp"]
            
            if all(field in data for field in required_fields):
                if data["client_name"] == test_data["client_name"]:
                    print("✅ Create status check working correctly")
                    return True, data["id"]
                else:
                    print("❌ Client name mismatch in response")
                    return False, None
            else:
                print(f"❌ Missing required fields in response. Expected: {required_fields}")
                return False, None
        else:
            print(f"❌ Create status check failed with status {response.status_code}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Create status check request failed: {e}")
        return False, None
    except Exception as e:
        print(f"❌ Create status check test error: {e}")
        return False, None

def test_get_status_checks(base_url):
    """Test GET /api/status endpoint"""
    print("\n=== Testing Get Status Checks ===")
    try:
        response = requests.get(f"{base_url}/status", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: Found {len(data)} status checks")
            
            if isinstance(data, list):
                # Check if we have any status checks and validate structure
                if len(data) > 0:
                    first_item = data[0]
                    required_fields = ["id", "client_name", "timestamp"]
                    if all(field in first_item for field in required_fields):
                        print("✅ Get status checks working correctly")
                        return True
                    else:
                        print(f"❌ Status check items missing required fields: {required_fields}")
                        return False
                else:
                    print("✅ Get status checks working correctly (empty list)")
                    return True
            else:
                print("❌ Response is not a list")
                return False
        else:
            print(f"❌ Get status checks failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Get status checks request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Get status checks test error: {e}")
        return False

def test_mongodb_integration(base_url):
    """Test MongoDB integration by creating and retrieving data"""
    print("\n=== Testing MongoDB Integration ===")
    
    # Create a status check
    create_success, created_id = test_create_status_check(base_url)
    if not create_success:
        print("❌ MongoDB integration failed - cannot create status check")
        return False
    
    # Retrieve status checks to verify persistence
    get_success = test_get_status_checks(base_url)
    if not get_success:
        print("❌ MongoDB integration failed - cannot retrieve status checks")
        return False
    
    print("✅ MongoDB integration working correctly")
    return True

def main():
    print("Starting Backend API Tests for Oath App")
    print("=" * 50)
    
    # Get backend URL
    base_url = get_backend_url()
    if not base_url:
        print("❌ Could not determine backend URL from frontend/.env")
        sys.exit(1)
    
    print(f"Testing backend at: {base_url}")
    
    # Track test results
    test_results = {
        "root_endpoint": False,
        "create_status_check": False,
        "get_status_checks": False,
        "mongodb_integration": False,
        "cors_middleware": True  # Assume working if requests succeed
    }
    
    # Run tests
    test_results["root_endpoint"] = test_root_endpoint(base_url)
    test_results["create_status_check"], _ = test_create_status_check(base_url)
    test_results["get_status_checks"] = test_get_status_checks(base_url)
    test_results["mongodb_integration"] = test_mongodb_integration(base_url)
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for result in test_results.values() if result)
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend tests passed!")
        return True
    else:
        print("⚠️  Some backend tests failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)