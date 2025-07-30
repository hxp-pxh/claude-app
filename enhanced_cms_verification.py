#!/usr/bin/env python3
"""
Focused verification of Enhanced Coworking CMS System endpoints
"""
import requests
import json

def test_enhanced_cms_endpoints():
    base_url = "https://f34678c8-0dd8-48eb-b632-746c0874d7b6.preview.emergentagent.com/api"
    
    # Login to get token
    login_response = requests.post(
        f"{base_url}/auth/login?tenant_subdomain=downtown-hub",
        json={"email": "admin@downtownhub.com", "password": "password123"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("🎨 ENHANCED COWORKING CMS SYSTEM VERIFICATION")
    print("=" * 60)
    
    # Test all 6 Enhanced CMS endpoints
    endpoints = [
        ("GET", "cms/coworking/blocks", "Available content blocks for coworking"),
        ("GET", "cms/coworking/themes", "Available themes"),
        ("GET", "cms/coworking/page-templates", "Page templates"),
    ]
    
    all_passed = True
    
    for method, endpoint, description in endpoints:
        print(f"\n🔍 Testing {method} /api/{endpoint}")
        print(f"   Description: {description}")
        
        response = requests.get(f"{base_url}/{endpoint}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ SUCCESS - Status: {response.status_code}")
            
            if endpoint == "cms/coworking/blocks":
                blocks = data.get("blocks", [])
                print(f"   📦 Found {len(blocks)} content blocks")
                if blocks:
                    print(f"   📋 Block types: {[block.get('id') for block in blocks[:3]]}...")
                    
            elif endpoint == "cms/coworking/themes":
                themes = data.get("themes", [])
                print(f"   🎨 Found {len(themes)} themes")
                if themes:
                    print(f"   🎨 Theme names: {[theme.get('name') for theme in themes]}")
                    
            elif endpoint == "cms/coworking/page-templates":
                templates = data.get("templates", [])
                print(f"   📄 Found {len(templates)} page templates")
                if templates:
                    print(f"   📄 Template names: {[template.get('name') for template in templates]}")
        else:
            print(f"   ❌ FAILED - Status: {response.status_code}")
            try:
                error = response.json()
                print(f"   Error: {error}")
            except:
                print(f"   Error: {response.text}")
            all_passed = False
    
    # Test page builder endpoints with real page
    print(f"\n🔍 Getting existing pages for builder tests...")
    pages_response = requests.get(f"{base_url}/cms/pages", headers=headers)
    
    if pages_response.status_code == 200:
        pages = pages_response.json()
        if pages:
            page_id = pages[0]["id"]
            print(f"   📄 Using page: {pages[0]['title']} (ID: {page_id})")
            
            # Test page builder endpoints
            builder_endpoints = [
                ("POST", f"cms/pages/{page_id}/builder", "Save page builder data"),
                ("GET", f"cms/pages/{page_id}/builder", "Get page builder data"),
                ("POST", f"cms/pages/{page_id}/render", "Render page with blocks"),
            ]
            
            for method, endpoint, description in builder_endpoints:
                print(f"\n🔍 Testing {method} /api/{endpoint}")
                print(f"   Description: {description}")
                
                if method == "POST" and "builder" in endpoint and not "render" in endpoint:
                    # Save page builder data
                    data = {
                        "blocks": [
                            {
                                "type": "coworking_hero",
                                "order": 1,
                                "config": {
                                    "title": "Test Hero Block",
                                    "subtitle": "Testing page builder"
                                }
                            }
                        ]
                    }
                    response = requests.post(f"{base_url}/{endpoint}", json=data, headers=headers)
                elif method == "POST" and "render" in endpoint:
                    # Render page
                    data = {"theme_config": {"color_scheme": {"primary": "#3B82F6"}}}
                    response = requests.post(f"{base_url}/{endpoint}", json=data, headers=headers)
                else:
                    # GET request
                    response = requests.get(f"{base_url}/{endpoint}", headers=headers)
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"   ✅ SUCCESS - Status: {response.status_code}")
                    
                    if "builder" in endpoint and method == "GET":
                        blocks = result.get("blocks", [])
                        print(f"   🏗️ Builder blocks: {len(blocks)}")
                    elif "render" in endpoint:
                        rendered = result.get("rendered_blocks", [])
                        print(f"   🎨 Rendered blocks: {len(rendered)}")
                else:
                    print(f"   ❌ FAILED - Status: {response.status_code}")
                    try:
                        error = response.json()
                        print(f"   Error: {error}")
                    except:
                        print(f"   Error: {response.text}")
                    all_passed = False
        else:
            print("   ❌ No pages found for builder testing")
            all_passed = False
    else:
        print(f"   ❌ Failed to get pages: {pages_response.status_code}")
        all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL ENHANCED CMS ENDPOINTS ARE WORKING!")
        print("✅ All 6 Enhanced CMS System endpoints verified successfully")
    else:
        print("❌ Some Enhanced CMS endpoints failed")
    
    return all_passed

if __name__ == "__main__":
    test_enhanced_cms_endpoints()