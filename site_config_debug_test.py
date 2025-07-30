#!/usr/bin/env python3
"""
Site Configuration API Debug Test
Focused testing for the failing Site Configuration endpoints
"""

import requests
import json
import sys
from datetime import datetime

class SiteConfigDebugTester:
    def __init__(self, base_url="https://f34678c8-0dd8-48eb-b632-746c0874d7b6.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        
        # Coworking tenant credentials as specified
        self.tenant_subdomain = "downtown-hub"
        self.admin_email = "admin@downtownhub.com"
        self.admin_password = "password123"

    def login(self):
        """Login to get authentication token"""
        print("🔐 Logging in to coworking tenant...")
        
        url = f"{self.base_url}/auth/login?tenant_subdomain={self.tenant_subdomain}"
        data = {
            "email": self.admin_email,
            "password": self.admin_password
        }
        
        try:
            response = requests.post(url, json=data)
            print(f"Login response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                self.token = result.get('access_token')
                user = result.get('user', {})
                print(f"✅ Login successful!")
                print(f"   User: {user.get('first_name')} {user.get('last_name')}")
                print(f"   Role: {user.get('role')}")
                print(f"   Tenant ID: {user.get('tenant_id')}")
                return True
            else:
                print(f"❌ Login failed: {response.status_code}")
                try:
                    error = response.json()
                    print(f"   Error: {error}")
                except:
                    print(f"   Response text: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False

    def test_get_site_config(self):
        """Test GET /api/cms/site-config endpoint"""
        print("\n🔍 Testing GET /api/cms/site-config...")
        
        if not self.token:
            print("❌ No authentication token available")
            return False
        
        url = f"{self.base_url}/cms/site-config"
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(url, headers=headers)
            print(f"GET site-config response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ GET site-config successful!")
                print(f"   Response keys: {list(result.keys())}")
                
                config = result.get('config', {})
                if config:
                    print(f"   Config sections: {list(config.keys())}")
                    
                    # Check each expected section
                    for section in ['navigation', 'header', 'footer', 'branding']:
                        if section in config:
                            section_data = config[section]
                            print(f"   {section}: {type(section_data)} with {len(section_data) if isinstance(section_data, (dict, list)) else 'N/A'} items")
                        else:
                            print(f"   {section}: MISSING")
                else:
                    print("   No config data in response")
                
                return True
            else:
                print(f"❌ GET site-config failed: {response.status_code}")
                try:
                    error = response.json()
                    print(f"   Error details: {json.dumps(error, indent=2)}")
                except:
                    print(f"   Response text: {response.text}")
                
                # Additional debugging
                print(f"   Response headers: {dict(response.headers)}")
                return False
                
        except Exception as e:
            print(f"❌ GET site-config exception: {str(e)}")
            return False

    def test_post_site_config(self):
        """Test POST /api/cms/site-config endpoint"""
        print("\n🔍 Testing POST /api/cms/site-config...")
        
        if not self.token:
            print("❌ No authentication token available")
            return False
        
        url = f"{self.base_url}/cms/site-config"
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        # Test configuration data
        test_config = {
            "navigation": {
                "items": [
                    {"label": "Home", "url": "/", "order": 1},
                    {"label": "Membership", "url": "/membership", "order": 2},
                    {"label": "Community", "url": "/community", "order": 3}
                ]
            },
            "header": {
                "logo": {"url": "/logo.png", "alt": "Coworking Space"},
                "cta_button": {"text": "Join Now", "url": "/join", "style": "primary"}
            },
            "footer": {
                "sections": [
                    {
                        "title": "Contact Info",
                        "content": {
                            "address": "123 Innovation St",
                            "phone": "(555) 123-4567",
                            "email": "hello@coworkingspace.com"
                        }
                    }
                ]
            },
            "branding": {
                "primary_color": "#3B82F6",
                "secondary_color": "#10B981"
            }
        }
        
        try:
            print(f"Sending config data: {json.dumps(test_config, indent=2)}")
            response = requests.post(url, json=test_config, headers=headers)
            print(f"POST site-config response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ POST site-config successful!")
                print(f"   Response: {json.dumps(result, indent=2)}")
                return True
            else:
                print(f"❌ POST site-config failed: {response.status_code}")
                try:
                    error = response.json()
                    print(f"   Error details: {json.dumps(error, indent=2)}")
                except:
                    print(f"   Response text: {response.text}")
                
                # Additional debugging
                print(f"   Response headers: {dict(response.headers)}")
                return False
                
        except Exception as e:
            print(f"❌ POST site-config exception: {str(e)}")
            return False

    def test_cms_engine_availability(self):
        """Test if CoworkingCMSEngine methods are accessible"""
        print("\n🔍 Testing CoworkingCMSEngine availability...")
        
        if not self.token:
            print("❌ No authentication token available")
            return False
        
        # Test a working Enhanced CMS endpoint to verify engine is working
        url = f"{self.base_url}/cms/coworking/blocks"
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(url, headers=headers)
            print(f"CMS blocks endpoint status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                blocks = result.get('blocks', [])
                print(f"✅ CoworkingCMSEngine is accessible - {len(blocks)} blocks available")
                return True
            else:
                print(f"❌ CoworkingCMSEngine not accessible: {response.status_code}")
                try:
                    error = response.json()
                    print(f"   Error: {error}")
                except:
                    print(f"   Response text: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ CMS engine test exception: {str(e)}")
            return False

    def test_authentication_permissions(self):
        """Test if authentication and permissions are working for CMS endpoints"""
        print("\n🔍 Testing authentication and permissions...")
        
        if not self.token:
            print("❌ No authentication token available")
            return False
        
        # Test a simple CMS endpoint that should work
        url = f"{self.base_url}/cms/pages"
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(url, headers=headers)
            print(f"CMS pages endpoint status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Authentication and permissions working - {len(result)} pages found")
                return True
            elif response.status_code == 403:
                print("❌ Permission denied - user role may not have access")
                return False
            elif response.status_code == 401:
                print("❌ Authentication failed - token may be invalid")
                return False
            else:
                print(f"❌ Unexpected status: {response.status_code}")
                try:
                    error = response.json()
                    print(f"   Error: {error}")
                except:
                    print(f"   Response text: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Auth test exception: {str(e)}")
            return False

    def run_debug_tests(self):
        """Run all debug tests"""
        print("🚀 Starting Site Configuration API Debug Tests")
        print("=" * 60)
        
        # Step 1: Login
        if not self.login():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Step 2: Test authentication and permissions
        auth_ok = self.test_authentication_permissions()
        
        # Step 3: Test CMS engine availability
        engine_ok = self.test_cms_engine_availability()
        
        # Step 4: Test the failing endpoints
        get_ok = self.test_get_site_config()
        post_ok = self.test_post_site_config()
        
        # Summary
        print("\n" + "=" * 60)
        print("🔍 DEBUG TEST SUMMARY:")
        print(f"   Authentication: {'✅ OK' if auth_ok else '❌ FAIL'}")
        print(f"   CMS Engine: {'✅ OK' if engine_ok else '❌ FAIL'}")
        print(f"   GET site-config: {'✅ OK' if get_ok else '❌ FAIL'}")
        print(f"   POST site-config: {'✅ OK' if post_ok else '❌ FAIL'}")
        
        if get_ok and post_ok:
            print("\n🎉 Site Configuration endpoints are working!")
            return True
        else:
            print("\n❌ Site Configuration endpoints have issues")
            
            # Provide specific guidance
            if not auth_ok:
                print("🔧 ISSUE: Authentication/permissions problem")
            elif not engine_ok:
                print("🔧 ISSUE: CoworkingCMSEngine not accessible")
            elif not get_ok:
                print("🔧 ISSUE: GET /api/cms/site-config endpoint failing")
            elif not post_ok:
                print("🔧 ISSUE: POST /api/cms/site-config endpoint failing")
            
            return False

def main():
    tester = SiteConfigDebugTester()
    success = tester.run_debug_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())