#!/usr/bin/env python
"""
Test script for PhishGuard API
Run this to test all endpoints
"""

import requests
import json
from typing import Dict

BASE_URL = "http://localhost:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'


def print_header(text: str):
    print(f"\n{Colors.BLUE}{'='*60}")
    print(f"{text}")
    print(f"{'='*60}{Colors.END}\n")


def test_health():
    """Test health endpoint"""
    print_header("Testing Health Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"{Colors.GREEN}✓ Status: {response.status_code}{Colors.END}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"{Colors.RED}✗ Error: {e}{Colors.END}")
        return False


def test_analyze_safe():
    """Test analyzing a safe URL"""
    print_header("Testing Safe URL Analysis")
    data = {
        "url": "https://google.com",
        "user_id": "test-user-123"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/analyze", json=data)
        print(f"{Colors.GREEN}✓ Status: {response.status_code}{Colors.END}")
        result = response.json()
        print(json.dumps(result, indent=2))
        return result.get("status") == "safe"
    except Exception as e:
        print(f"{Colors.RED}✗ Error: {e}{Colors.END}")
        return False


def test_analyze_warning():
    """Test analyzing a suspicious URL"""
    print_header("Testing Suspicious URL Analysis")
    data = {
        "url": "http://verify-account.tk",
        "user_id": "test-user-123"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/analyze", json=data)
        print(f"{Colors.GREEN}✓ Status: {response.status_code}{Colors.END}")
        result = response.json()
        print(json.dumps(result, indent=2))
        return result.get("status") in ["warning", "dangerous"]
    except Exception as e:
        print(f"{Colors.RED}✗ Error: {e}{Colors.END}")
        return False


def test_analyze_dangerous():
    """Test analyzing a phishing URL"""
    print_header("Testing Phishing URL Analysis")
    data = {
        "url": "http://phishing-trap.xyz",
        "user_id": "test-user-123"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/analyze", json=data)
        print(f"{Colors.GREEN}✓ Status: {response.status_code}{Colors.END}")
        result = response.json()
        print(json.dumps(result, indent=2))
        return result.get("status") == "dangerous"
    except Exception as e:
        print(f"{Colors.RED}✗ Error: {e}{Colors.END}")
        return False


def test_bulk_analyze():
    """Test bulk URL analysis"""
    print_header("Testing Bulk URL Analysis")
    urls = "google.com,phishing.tk,amazon.com"
    try:
        response = requests.get(f"{BASE_URL}/api/bulk-analyze", params={
            "urls": urls,
            "user_id": "test-user-123"
        })
        print(f"{Colors.GREEN}✓ Status: {response.status_code}{Colors.END}")
        result = response.json()
        print(json.dumps(result, indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"{Colors.RED}✗ Error: {e}{Colors.END}")
        return False


def test_invalid_url():
    """Test with invalid URL"""
    print_header("Testing Invalid URL")
    data = {
        "url": "not-a-valid-url",
        "user_id": "test-user-123"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/analyze", json=data)
        # Should handle gracefully (status may be 200 with normalized URL)
        print(f"{Colors.GREEN}✓ Status: {response.status_code}{Colors.END}")
        print(json.dumps(response.json(), indent=2))
        return True
    except Exception as e:
        print(f"{Colors.RED}✗ Error: {e}{Colors.END}")
        return False


def test_no_url():
    """Test with missing URL"""
    print_header("Testing Missing URL")
    data = {
        "url": ""
    }
    try:
        response = requests.post(f"{BASE_URL}/api/analyze", json=data)
        print(f"{Colors.GREEN}✓ Status: {response.status_code}{Colors.END}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 400
    except Exception as e:
        print(f"{Colors.RED}✗ Error: {e}{Colors.END}")
        return False


def main():
    print(f"{Colors.YELLOW}")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║          PhishGuard API Test Suite                        ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}")
    
    print(f"\n{Colors.YELLOW}Target: {BASE_URL}{Colors.END}")
    print(f"{Colors.YELLOW}Make sure the server is running with: python main.py{Colors.END}")
    
    tests = [
        ("Health Check", test_health),
        ("Safe URL Analysis", test_analyze_safe),
        ("Suspicious URL Analysis", test_analyze_warning),
        ("Phishing URL Analysis", test_analyze_dangerous),
        ("Bulk URL Analysis", test_bulk_analyze),
        ("Invalid URL Handling", test_invalid_url),
        ("Missing URL Error", test_no_url),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"{Colors.RED}Unexpected error in {test_name}: {e}{Colors.END}")
            results.append((test_name, False))
    
    # Print summary
    print_header("Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{Colors.GREEN}✓ PASS{Colors.END}" if result else f"{Colors.RED}✗ FAIL{Colors.END}"
        print(f"{status} - {test_name}")
    
    print(f"\n{Colors.BLUE}Results: {passed}/{total} tests passed{Colors.END}")
    
    if passed == total:
        print(f"{Colors.GREEN}🎉 All tests passed!{Colors.END}\n")
    else:
        print(f"{Colors.YELLOW}⚠️  Some tests failed. Check the errors above.{Colors.END}\n")


if __name__ == "__main__":
    main()
