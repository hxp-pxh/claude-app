import requests
import sys
from datetime import datetime, timedelta
import json

class ClaudePlatformTester:
    def __init__(self, base_url="https://97977e23-90a3-4486-9cbe-8b5f397a2e68.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        
        # Multi-tenant test data
        self.tenant_tokens = {}  # subdomain -> token
        self.tenant_users = {}   # subdomain -> user data
        
        # Test tenants with different modules
        self.test_tenants = {
            "downtown-hub": {
                "module": "coworking",
                "admin_email": "admin@downtownhub.com",
                "admin_password": "password123"
            },
            "city-hall": {
                "module": "government", 
                "admin_email": "facilities@cityhall.gov",
                "admin_password": "password123"
            },
            "grand-hotel": {
                "module": "hotel",
                "admin_email": "events@grandhotel.com", 
                "admin_password": "password123"
            }
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=data)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error details: {error_detail}")
                except:
                    print(f"   Response text: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_platform_health(self):
        """Test platform health endpoint"""
        success, response = self.run_test(
            "Platform Health Check",
            "GET",
            "platform/health",
            200
        )
        if success:
            print(f"   Platform status: {response.get('platform_status')}")
            print(f"   Active modules: {response.get('active_modules')}")
            print(f"   Total tenants: {response.get('total_tenants')}")
            
            kernels = response.get('kernels', {})
            for kernel_name, kernel_health in kernels.items():
                status = kernel_health.get('status', 'unknown')
                print(f"   {kernel_name} kernel: {status}")
        return success

    def test_tenant_login(self, subdomain, email, password):
        """Test login for a specific tenant"""
        success, response = self.run_test(
            f"Login for {subdomain}",
            "POST",
            f"auth/login?tenant_subdomain={subdomain}",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.tenant_tokens[subdomain] = response['access_token']
            self.tenant_users[subdomain] = response.get('user', {})
            user = response.get('user', {})
            print(f"   User: {user.get('first_name')} {user.get('last_name')}")
            print(f"   Role: {user.get('role')}")
            print(f"   Tenant: {user.get('tenant_id')}")
            return True
        return False

    def test_tenant_experience(self, subdomain):
        """Test tenant experience configuration"""
        token = self.tenant_tokens.get(subdomain)
        if not token:
            print(f"❌ No token for {subdomain}")
            return False
            
        success, response = self.run_test(
            f"Tenant Experience for {subdomain}",
            "GET",
            "platform/experience",
            200,
            token=token
        )
        if success:
            module_info = response.get('module_info', {})
            print(f"   Module: {module_info.get('name')}")
            print(f"   Industry: {module_info.get('industry')}")
            print(f"   Version: {module_info.get('version')}")
            
            terminology = response.get('terminology', {})
            print(f"   Terminology overrides: {len(terminology)} terms")
            
            features = response.get('features', [])
            print(f"   Enabled features: {len(features)}")
            
            navigation = response.get('navigation', [])
            print(f"   Navigation items: {len(navigation)}")
            
            # Show some example terminology translations
            if terminology:
                print("   Sample terminology:")
                for i, (core_term, translated_term) in enumerate(terminology.items()):
                    if i < 3:  # Show first 3
                        print(f"     '{core_term}' -> '{translated_term}'")
        return success

    def test_enhanced_dashboard(self, subdomain):
        """Test enhanced dashboard with module-specific data"""
        token = self.tenant_tokens.get(subdomain)
        if not token:
            print(f"❌ No token for {subdomain}")
            return False
            
        success, response = self.run_test(
            f"Enhanced Dashboard for {subdomain}",
            "GET",
            "dashboard/enhanced",
            200,
            token=token
        )
        if success:
            user = response.get('user', {})
            tenant = response.get('tenant', {})
            metrics = response.get('metrics', {})
            dashboard_config = response.get('dashboard_config', {})
            
            print(f"   User role: {user.get('role')}")
            print(f"   Tenant name: {tenant.get('name')}")
            print(f"   Metrics available: {len(metrics)}")
            
            widgets = dashboard_config.get('widgets', [])
            quick_actions = dashboard_config.get('quick_actions', [])
            print(f"   Dashboard widgets: {len(widgets)}")
            print(f"   Quick actions: {len(quick_actions)}")
            
            # Show some metrics
            if metrics:
                print("   Sample metrics:")
                for i, (metric_name, metric_value) in enumerate(metrics.items()):
                    if i < 3:  # Show first 3
                        print(f"     {metric_name}: {metric_value}")
        return success

    def test_terminology_translation(self, subdomain):
        """Test that responses are properly translated using module terminology"""
        token = self.tenant_tokens.get(subdomain)
        if not token:
            print(f"❌ No token for {subdomain}")
            return False
            
        # Test dashboard stats which should have translated terms
        success, response = self.run_test(
            f"Dashboard Stats Translation for {subdomain}",
            "GET",
            "dashboard/stats",
            200,
            token=token
        )
        if success:
            print(f"   Response keys (should be translated): {list(response.keys())}")
            
            # Check for industry-specific terminology
            if subdomain == "downtown-hub":  # Coworking
                # Should use "members" instead of "users"
                has_members = any("member" in key.lower() for key in response.keys())
                print(f"   Uses coworking terminology (members): {has_members}")
            elif subdomain == "city-hall":  # Government
                # Should use "citizens" or "residents" instead of "users"
                has_citizens = any("citizen" in key.lower() or "resident" in key.lower() for key in response.keys())
                print(f"   Uses government terminology (citizens): {has_citizens}")
            elif subdomain == "grand-hotel":  # Hotel
                # Should use "guests" or "clients" instead of "users"
                has_guests = any("guest" in key.lower() or "client" in key.lower() for key in response.keys())
                print(f"   Uses hotel terminology (guests): {has_guests}")
        return success

    def test_module_reload(self, subdomain):
        """Test module reload functionality"""
        token = self.tenant_tokens.get(subdomain)
        if not token:
            print(f"❌ No token for {subdomain}")
            return False
            
        success, response = self.run_test(
            f"Module Reload for {subdomain}",
            "POST",
            "platform/reload-module",
            200,
            token=token
        )
        if success:
            print(f"   Reload result: {response.get('message')}")
        return success

    def test_cms_pages(self, subdomain):
        """Test CMS pages functionality"""
        token = self.tenant_tokens.get(subdomain)
        if not token:
            print(f"❌ No token for {subdomain}")
            return False
            
        success, response = self.run_test(
            f"CMS Pages for {subdomain}",
            "GET",
            "cms/pages",
            200,
            token=token
        )
        if success:
            print(f"   Pages found: {len(response)}")
            if response:
                page = response[0]
                print(f"   Sample page: {page.get('title')}")
                print(f"   Page status: {page.get('status')}")
        return success

    def test_leads_management(self, subdomain):
        """Test leads management functionality"""
        token = self.tenant_tokens.get(subdomain)
        if not token:
            print(f"❌ No token for {subdomain}")
            return False
            
        success, response = self.run_test(
            f"Leads Management for {subdomain}",
            "GET",
            "leads",
            200,
            token=token
        )
        if success:
            print(f"   Leads found: {len(response)}")
            if response:
                lead = response[0]
                print(f"   Sample lead: {lead.get('first_name')} {lead.get('last_name')}")
                print(f"   Lead status: {lead.get('status')}")
                print(f"   Lead source: {lead.get('source')}")
        return success

    def test_forms_management(self, subdomain):
        """Test forms management functionality"""
        token = self.tenant_tokens.get(subdomain)
        if not token:
            print(f"❌ No token for {subdomain}")
            return False
            
        success, response = self.run_test(
            f"Forms Management for {subdomain}",
            "GET",
            "forms",
            200,
            token=token
        )
        if success:
            print(f"   Forms found: {len(response)}")
            if response:
                form = response[0]
                print(f"   Sample form: {form.get('name')}")
                print(f"   Form fields: {len(form.get('fields', []))}")
        return success

def main():
    print("🚀 Starting Claude Platform Core-Module Architecture Tests")
    print("=" * 70)
    
    tester = ClaudePlatformTester()
    
    # Platform Health Test
    print("\n🏥 PLATFORM HEALTH TESTS")
    tester.test_platform_health()
    
    # Multi-tenant Authentication Tests
    print("\n🔐 MULTI-TENANT AUTHENTICATION TESTS")
    login_success = True
    for subdomain, tenant_info in tester.test_tenants.items():
        success = tester.test_tenant_login(
            subdomain, 
            tenant_info["admin_email"], 
            tenant_info["admin_password"]
        )
        if not success:
            print(f"❌ Login failed for {subdomain}")
            login_success = False
    
    if not login_success:
        print("❌ Some tenant logins failed, continuing with available tenants...")
    
    # Module Experience Tests
    print("\n🎭 MODULE EXPERIENCE TRANSFORMATION TESTS")
    for subdomain in tester.tenant_tokens.keys():
        print(f"\n--- Testing {subdomain} ({tester.test_tenants[subdomain]['module']}) ---")
        tester.test_tenant_experience(subdomain)
        tester.test_enhanced_dashboard(subdomain)
        tester.test_terminology_translation(subdomain)
    
    # Core Functionality Tests
    print("\n⚙️ CORE FUNCTIONALITY TESTS")
    for subdomain in tester.tenant_tokens.keys():
        print(f"\n--- Testing {subdomain} Core Features ---")
        tester.test_cms_pages(subdomain)
        tester.test_leads_management(subdomain)
        tester.test_forms_management(subdomain)
    
    # Module Management Tests
    print("\n🔄 MODULE MANAGEMENT TESTS")
    for subdomain in tester.tenant_tokens.keys():
        tester.test_module_reload(subdomain)
    
    # Print final results
    print("\n" + "=" * 70)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed_tests} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())