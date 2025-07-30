import requests
import sys
from datetime import datetime, timedelta
import json

class ClaudePlatformTester:
    def __init__(self, base_url="https://f34678c8-0dd8-48eb-b632-746c0874d7b6.preview.emergentagent.com/api"):
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

    # Enhanced CMS System Tests
    def test_enhanced_cms_endpoints(self, subdomain):
        """Test Enhanced Coworking CMS System endpoints"""
        token = self.tenant_tokens.get(subdomain)
        if not token:
            print(f"❌ No token for {subdomain}")
            return False
        
        print(f"\n🎨 ENHANCED CMS SYSTEM TESTS for {subdomain}")
        
        # Test coworking-specific content blocks endpoint
        success1, response1 = self.run_test(
            f"Coworking Content Blocks for {subdomain}",
            "GET",
            "cms/coworking/blocks",
            200,
            token=token
        )
        if success1:
            print(f"   Available blocks: {len(response1)} content blocks")
            if response1:
                block_types = [block.get('id') for block in response1]
                expected_blocks = ['coworking_hero', 'membership_pricing', 'member_testimonials', 
                                 'space_gallery', 'community_events', 'amenities_grid', 
                                 'community_stats', 'cta_membership']
                found_blocks = [b for b in expected_blocks if b in block_types]
                print(f"   Expected coworking blocks found: {len(found_blocks)}/{len(expected_blocks)}")
        
        # Test coworking themes endpoint
        success2, response2 = self.run_test(
            f"Coworking Themes for {subdomain}",
            "GET", 
            "cms/coworking/themes",
            200,
            token=token
        )
        if success2:
            print(f"   Available themes: {len(response2)} theme options")
            if response2:
                theme_names = [theme.get('name') for theme in response2]
                expected_themes = ['Modern Collaborative', 'Creative Studio', 'Professional Corporate']
                found_themes = [t for t in expected_themes if t in theme_names]
                print(f"   Expected themes found: {len(found_themes)}/{len(expected_themes)}")
        
        # Test page templates endpoint
        success3, response3 = self.run_test(
            f"Coworking Page Templates for {subdomain}",
            "GET",
            "cms/coworking/page-templates", 
            200,
            token=token
        )
        if success3:
            print(f"   Available templates: {len(response3)} page templates")
            if response3:
                template_names = [template.get('name') for template in response3]
                expected_templates = ['Coworking Homepage', 'Membership Plans', 'Our Community', 'Our Spaces']
                found_templates = [t for t in expected_templates if t in template_names]
                print(f"   Expected templates found: {len(found_templates)}/{len(expected_templates)}")
        
        return success1 and success2 and success3
    
    def test_page_builder_integration(self, subdomain):
        """Test page builder save/load functionality"""
        token = self.tenant_tokens.get(subdomain)
        if not token:
            print(f"❌ No token for {subdomain}")
            return False
        
        print(f"\n🏗️ PAGE BUILDER INTEGRATION TESTS for {subdomain}")
        
        # First get a page to work with
        success_pages, pages_response = self.run_test(
            f"Get Pages for Builder Test",
            "GET",
            "cms/pages",
            200,
            token=token
        )
        
        if not success_pages or not pages_response:
            print("❌ No pages available for builder test")
            return False
        
        page_id = pages_response[0]['id']
        
        # Test saving page builder data
        builder_data = {
            "blocks": [
                {
                    "type": "coworking_hero",
                    "order": 1,
                    "config": {
                        "title": "Welcome to Our Community",
                        "subtitle": "Where innovation meets collaboration",
                        "cta_text": "Join Today"
                    }
                },
                {
                    "type": "membership_pricing", 
                    "order": 2,
                    "config": {
                        "title": "Choose Your Plan",
                        "plans": [
                            {"name": "Hot Desk", "price": 25, "billing": "per day"}
                        ]
                    }
                }
            ]
        }
        
        success1, response1 = self.run_test(
            f"Save Page Builder Data for {subdomain}",
            "POST",
            f"cms/pages/{page_id}/builder",
            200,
            data=builder_data,
            token=token
        )
        
        # Test loading page builder data
        success2, response2 = self.run_test(
            f"Get Page Builder Data for {subdomain}",
            "GET",
            f"cms/pages/{page_id}/builder",
            200,
            token=token
        )
        if success2:
            blocks = response2.get('blocks', [])
            print(f"   Loaded builder blocks: {len(blocks)}")
        
        # Test rendering page with content blocks
        success3, response3 = self.run_test(
            f"Render Page with Blocks for {subdomain}",
            "POST",
            f"cms/pages/{page_id}/render",
            200,
            data={"theme_config": {"color_scheme": {"primary": "#3B82F6"}}},
            token=token
        )
        if success3:
            rendered_blocks = response3.get('rendered_blocks', [])
            print(f"   Rendered blocks: {len(rendered_blocks)}")
        
        return success1 and success2 and success3
    
    def test_industry_specific_customization(self, subdomain):
        """Test coworking-specific terminology and context"""
        token = self.tenant_tokens.get(subdomain)
        if not token:
            print(f"❌ No token for {subdomain}")
            return False
        
        print(f"\n🏢 INDUSTRY-SPECIFIC CUSTOMIZATION TESTS for {subdomain}")
        
        # Test that CMS responses use coworking terminology
        success1, response1 = self.run_test(
            f"CMS Content with Coworking Context for {subdomain}",
            "GET",
            "cms/coworking/blocks",
            200,
            token=token
        )
        
        if success1 and response1:
            # Check for coworking-specific terminology in block descriptions
            coworking_terms = ['community', 'member', 'coworking', 'collaboration', 'workspace']
            found_terms = []
            for block in response1:
                description = block.get('description', '').lower()
                for term in coworking_terms:
                    if term in description:
                        found_terms.append(term)
            
            unique_terms = list(set(found_terms))
            print(f"   Coworking terminology found: {len(unique_terms)} terms ({', '.join(unique_terms[:5])})")
        
        # Test module-specific content blocks are available
        success2 = True
        if success1 and response1:
            block_ids = [block.get('id') for block in response1]
            required_coworking_blocks = ['coworking_hero', 'membership_pricing', 'member_testimonials', 'community_events']
            missing_blocks = [block for block in required_coworking_blocks if block not in block_ids]
            if missing_blocks:
                print(f"   ❌ Missing coworking blocks: {missing_blocks}")
                success2 = False
            else:
                print(f"   ✅ All required coworking blocks available")
        
        return success1 and success2

def main():
    print("🚀 Starting Enhanced Coworking CMS System Tests")
    print("=" * 70)
    
    tester = ClaudePlatformTester()
    
    # Platform Health Test
    print("\n🏥 PLATFORM HEALTH TESTS")
    tester.test_platform_health()
    
    # Multi-tenant Authentication Tests - Focus on Coworking
    print("\n🔐 COWORKING TENANT AUTHENTICATION")
    coworking_subdomain = "downtown-hub"
    coworking_info = tester.test_tenants[coworking_subdomain]
    
    login_success = tester.test_tenant_login(
        coworking_subdomain, 
        coworking_info["admin_email"], 
        coworking_info["admin_password"]
    )
    
    if not login_success:
        print("❌ Coworking tenant login failed - cannot proceed with CMS tests")
        return 1
    
    # Enhanced CMS System Tests (Primary Focus)
    print("\n🎨 ENHANCED COWORKING CMS SYSTEM TESTS")
    print("=" * 50)
    
    cms_success = tester.test_enhanced_cms_endpoints(coworking_subdomain)
    builder_success = tester.test_page_builder_integration(coworking_subdomain)
    customization_success = tester.test_industry_specific_customization(coworking_subdomain)
    
    # Core CMS Functionality Tests
    print("\n⚙️ CORE CMS FUNCTIONALITY TESTS")
    core_cms_success = tester.test_cms_pages(coworking_subdomain)
    
    # Module Experience Tests
    print("\n🎭 MODULE EXPERIENCE TESTS")
    experience_success = tester.test_tenant_experience(coworking_subdomain)
    dashboard_success = tester.test_enhanced_dashboard(coworking_subdomain)
    
    # Print final results
    print("\n" + "=" * 70)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    # Detailed Results Summary
    print("\n🎯 ENHANCED CMS SYSTEM TEST SUMMARY:")
    print(f"   CMS Engine Endpoints: {'✅ PASS' if cms_success else '❌ FAIL'}")
    print(f"   Page Builder Integration: {'✅ PASS' if builder_success else '❌ FAIL'}")
    print(f"   Industry Customization: {'✅ PASS' if customization_success else '❌ FAIL'}")
    print(f"   Core CMS Functionality: {'✅ PASS' if core_cms_success else '❌ FAIL'}")
    print(f"   Module Experience: {'✅ PASS' if experience_success else '❌ FAIL'}")
    print(f"   Enhanced Dashboard: {'✅ PASS' if dashboard_success else '❌ FAIL'}")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 All Enhanced CMS System tests passed!")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"\n⚠️  {failed_tests} tests failed - Enhanced CMS System needs implementation")
        return 1

if __name__ == "__main__":
    sys.exit(main())