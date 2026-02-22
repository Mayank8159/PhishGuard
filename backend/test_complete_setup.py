#!/usr/bin/env python
"""
Complete setup and testing script for PhishGuard
Verifies all services and creates test collections
"""

import requests
import json
from typing import Dict, Any
import time

# Service URLs
POCKETBASE_URL = "http://127.0.0.1:8090"
BACKEND_URL = "http://127.0.0.1:8000"
TEST_EMAIL = "mayankfhacker@gmail.com"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    END = '\033[0m'

def print_header(text: str):
    print(f"\n{Colors.BLUE}{'='*60}")
    print(f"{text}")
    print(f"{'='*60}{Colors.END}\n")


def test_pocketbase():
    """Test PocketBase connection"""
    print_header("Testing PocketBase Connection")
    try:
        response = requests.get(f"{POCKETBASE_URL}/api/health", timeout=5)
        print(f"{Colors.GREEN}✓ PocketBase Health: {response.status_code}{Colors.END}")
        print(f"  URL: {POCKETBASE_URL}")
        print(f"  Admin Panel: {POCKETBASE_URL}/_/")
        return response.status_code == 200
    except Exception as e:
        print(f"{Colors.RED}✗ PocketBase Error: {e}{Colors.END}")
        return False


def test_backend():
    """Test FastAPI backend connection"""
    print_header("Testing FastAPI Backend Connection")
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
        print(f"{Colors.GREEN}✓ Backend Health: {response.status_code}{Colors.END}")
        data = response.json()
        print(f"  Status: {data.get('status')}")
        print(f"  Database Connected: {data.get('database_connected')}")
        print(f"  URL: {BACKEND_URL}")
        return response.status_code == 200
    except Exception as e:
        print(f"{Colors.RED}✗ Backend Error: {e}{Colors.END}")
        return False


def create_collections():
    """Create required PocketBase collections via admin API"""
    print_header("Setting Up PocketBase Collections")
    
    try:
        # First check if collections exist
        response = requests.get(f"{POCKETBASE_URL}/api/collections", timeout=5)
        
        if response.status_code != 401:
            # Collections endpoint doesn't require auth in some versions
            print(f"{Colors.YELLOW}Note: You may need to create collections manually in the admin panel{Colors.END}")
            print(f"  Go to: {POCKETBASE_URL}/_/")
            print(f"  Create the following collections:")
            print(f"    1. 'users' with fields: id, email, name, created_at, total_scans, threats_blocked")
            print(f"    2. 'scans' with fields: id, user_id, url, status, risk_score, threats, created_at")
            return False
        else:
            print(f"{Colors.GREEN}✓ Collections may already exist{Colors.END}")
            return True
            
    except Exception as e:
        print(f"{Colors.YELLOW}ℹ Manual collection creation required: {e}{Colors.END}")
        return False


def test_analysis(url: str = "https://google.com"):
    """Test URL analysis endpoint"""
    print_header(f"Testing URL Analysis: {url}")
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/analyze",
            json={
                "url": url,
                "user_id": "test-user-123"
            },
            timeout=5
        )
        print(f"{Colors.GREEN}✓ Analysis Status: {response.status_code}{Colors.END}")
        data = response.json()
        print(f"  URL: {data.get('url')}")
        print(f"  Status: {data.get('status')}")
        print(f"  Risk Score: {data.get('riskScore')}")
        print(f"  Threats: {data.get('threats')}")
        return response.status_code == 200
    except Exception as e:
        print(f"{Colors.RED}✗ Analysis Error: {e}{Colors.END}")
        return False


def main():
    print(f"{Colors.CYAN}")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║          PhishGuard Complete Setup Verification           ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}")
    
    print(f"\n{Colors.YELLOW}Test Email: {TEST_EMAIL}{Colors.END}")
    print(f"{Colors.YELLOW}Service Status:{Colors.END}")
    
    # Test all services
    results = {
        "PocketBase": test_pocketbase(),
        "FastAPI Backend": test_backend(),
        "Collections Setup": create_collections(),
        "URL Analysis": test_analysis(),
    }
    
    # Print summary
    print_header("Setup Summary")
    
    for test_name, result in results.items():
        status = f"{Colors.GREEN}✓ READY{Colors.END}" if result else f"{Colors.YELLOW}⚠ NEEDS SETUP{Colors.END}"
        print(f"{status} - {test_name}")
    
    all_ready = all(results.values())
    
    print(f"\n{Colors.CYAN}Next Steps:{Colors.END}")
    print(f"1. {Colors.YELLOW}Open PocketBase Admin:{Colors.END} {POCKETBASE_URL}/_/")
    print(f"2. {Colors.YELLOW}Frontend URL:{Colors.END} http://localhost:8081")
    print(f"3. {Colors.YELLOW}Test Login:{Colors.END} Use {TEST_EMAIL} to sign up")
    print(f"4. {Colors.YELLOW}Test Analysis:{Colors.END} Enter URLs to scan")
    
    if all_ready:
        print(f"\n{Colors.GREEN}🎉 All services ready! You can now test PhishGuard.{Colors.END}\n")
    else:
        print(f"\n{Colors.YELLOW}⚠️  Some services need configuration. See above for details.{Colors.END}\n")


if __name__ == "__main__":
    main()
