#!/usr/bin/env python3
"""
Authentication Credentials Testing Script
Tests different credential combinations to identify working login information
"""

import requests
import sys
from datetime import datetime
import json

class AuthCredentialTester:
    def __init__(self, base_url="https://f34678c8-0dd8-48eb-b632-746c0874d7b6.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.working_credentials = []
        
        # Test credential combinations from the review request
        self.credential_combinations = [
            {
                "name": "Downtown Hub Coworking (from seeding)",
                "subdomain": "downtown-hub",
                "email": "admin@downtownhub.com",
                "password": "password123"
            },
            {
                "name": "Demo Credentials (from frontend)",
                "subdomain": "demo",
                "email": "admin@demo.com", 
                "password": "password123"
            },
            {
                "name": "City Hall Government",
                "subdomain": "city-hall",
                "email": "facilities@cityhall.gov",
                "password": "password123"
            },
            {
                "name": "Grand Hotel",
                "subdomain": "grand-hotel",
                "email": "events@grandhotel.com",
                "password": "password123"
            },
            # Additional variations to test
            {
                "name": "Downtown Hub with demo email",
                "subdomain": "downtown-hub",
                "email": "admin@demo.com",
                "password": "password123"
            },
            {
                "name": "Demo with downtown hub email",
                "subdomain": "demo",
                "email": "admin@downtownhub.com",
                "password": "password123"
            }
        ]

    def test_platform_health(self):
        """Test platform health to ensure backend is running"""
        print("🏥 Testing Platform Health...")
        try:
            response = requests.get(f"{self.base_url}/platform/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Platform is healthy - Status: {data.get('platform_status')}")
                print(f"   Total tenants: {data.get('total_tenants')}")
                print(f"   Active modules: {data.get('active_modules')}")
                return True
            else:
                print(f"❌ Platform health check failed - Status: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Platform health check error: {str(e)}")
            return False

    def test_credential_combination(self, cred):
        """Test a specific credential combination"""
        self.tests_run += 1
        print(f"\n🔍 Testing: {cred['name']}")
        print(f"   Subdomain: {cred['subdomain']}")
        print(f"   Email: {cred['email']}")
        print(f"   Password: {cred['password']}")
        
        try:
            url = f"{self.base_url}/auth/login"
            params = {"tenant_subdomain": cred['subdomain']}
            data = {
                "email": cred['email'],
                "password": cred['password']
            }
            headers = {'Content-Type': 'application/json'}
            
            response = requests.post(url, json=data, params=params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                self.tests_passed += 1
                response_data = response.json()
                user = response_data.get('user', {})
                
                print(f"✅ LOGIN SUCCESSFUL!")
                print(f"   User: {user.get('first_name')} {user.get('last_name')}")
                print(f"   Role: {user.get('role')}")
                print(f"   Tenant ID: {user.get('tenant_id')}")
                print(f"   User ID: {user.get('id')}")
                
                # Store working credentials
                working_cred = {
                    "name": cred['name'],
                    "subdomain": cred['subdomain'],
                    "email": cred['email'],
                    "password": cred['password'],
                    "user_info": user,
                    "access_token": response_data.get('access_token')
                }
                self.working_credentials.append(working_cred)
                
                return True, response_data
            else:
                print(f"❌ LOGIN FAILED - Status: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('detail', 'Unknown error')}")
                except:
                    print(f"   Response: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"❌ LOGIN ERROR: {str(e)}")
            return False, None

    def test_tenant_experience(self, working_cred):
        """Test tenant experience for working credentials"""
        print(f"\n🎭 Testing Tenant Experience for {working_cred['name']}")
        
        try:
            headers = {
                'Authorization': f"Bearer {working_cred['access_token']}",
                'Content-Type': 'application/json'
            }
            
            response = requests.get(f"{self.base_url}/platform/experience", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                module_info = data.get('module_info', {})
                terminology = data.get('terminology', {})
                features = data.get('features', [])
                navigation = data.get('navigation', [])
                
                print(f"✅ Experience loaded successfully")
                print(f"   Module: {module_info.get('name')}")
                print(f"   Industry: {module_info.get('industry')}")
                print(f"   Terminology translations: {len(terminology)}")
                print(f"   Features: {len(features)}")
                print(f"   Navigation items: {len(navigation)}")
                
                # Show key terminology translations
                if terminology:
                    print("   Key terminology:")
                    for key, value in list(terminology.items())[:5]:
                        print(f"     '{key}' -> '{value}'")
                
                return True
            else:
                print(f"❌ Experience test failed - Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Experience test error: {str(e)}")
            return False

    def test_dashboard_access(self, working_cred):
        """Test dashboard access for working credentials"""
        print(f"\n📊 Testing Dashboard Access for {working_cred['name']}")
        
        try:
            headers = {
                'Authorization': f"Bearer {working_cred['access_token']}",
                'Content-Type': 'application/json'
            }
            
            # Test enhanced dashboard
            response = requests.get(f"{self.base_url}/dashboard/enhanced", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Enhanced dashboard accessible")
                print(f"   User role: {data.get('user', {}).get('role')}")
                print(f"   Tenant: {data.get('tenant', {}).get('name')}")
                print(f"   Metrics available: {len(data.get('metrics', {}))}")
                return True
            else:
                print(f"❌ Dashboard test failed - Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Dashboard test error: {str(e)}")
            return False

    def run_comprehensive_test(self):
        """Run comprehensive authentication testing"""
        print("🚀 AUTHENTICATION CREDENTIALS TESTING")
        print("=" * 60)
        
        # Test platform health first
        if not self.test_platform_health():
            print("❌ Platform is not healthy - cannot proceed with authentication tests")
            return False
        
        print(f"\n🔐 TESTING {len(self.credential_combinations)} CREDENTIAL COMBINATIONS")
        print("=" * 60)
        
        # Test all credential combinations
        for cred in self.credential_combinations:
            success, response = self.test_credential_combination(cred)
            
        print(f"\n📋 AUTHENTICATION TEST RESULTS")
        print("=" * 60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Successful logins: {self.tests_passed}")
        print(f"Failed logins: {self.tests_run - self.tests_passed}")
        
        if self.working_credentials:
            print(f"\n✅ WORKING CREDENTIALS FOUND: {len(self.working_credentials)}")
            print("=" * 60)
            
            for i, cred in enumerate(self.working_credentials, 1):
                print(f"\n{i}. {cred['name']}")
                print(f"   Subdomain: {cred['subdomain']}")
                print(f"   Email: {cred['email']}")
                print(f"   Password: {cred['password']}")
                print(f"   User: {cred['user_info'].get('first_name')} {cred['user_info'].get('last_name')}")
                print(f"   Role: {cred['user_info'].get('role')}")
                
                # Test additional functionality for working credentials
                self.test_tenant_experience(cred)
                self.test_dashboard_access(cred)
            
            print(f"\n🎯 RECOMMENDED CREDENTIALS FOR USER:")
            print("=" * 60)
            # Recommend the first working credential
            recommended = self.working_credentials[0]
            print(f"Organization: {recommended['subdomain']}")
            print(f"Email: {recommended['email']}")
            print(f"Password: {recommended['password']}")
            print(f"User Role: {recommended['user_info'].get('role')}")
            
            return True
        else:
            print(f"\n❌ NO WORKING CREDENTIALS FOUND")
            print("=" * 60)
            print("POSSIBLE ISSUES:")
            print("1. Database not seeded properly")
            print("2. Incorrect tenant subdomains")
            print("3. Password hashing issues")
            print("4. Backend authentication system problems")
            
            return False

def main():
    """Main function to run authentication credential tests"""
    tester = AuthCredentialTester()
    
    success = tester.run_comprehensive_test()
    
    if success:
        print(f"\n🎉 AUTHENTICATION TESTING COMPLETE - WORKING CREDENTIALS IDENTIFIED")
        return 0
    else:
        print(f"\n⚠️ AUTHENTICATION TESTING FAILED - NO WORKING CREDENTIALS FOUND")
        return 1

if __name__ == "__main__":
    sys.exit(main())