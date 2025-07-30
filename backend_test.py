import requests
import sys
from datetime import datetime, timedelta
import json

class SpaceManagementAPITester:
    def __init__(self, base_url="https://2faade16-7786-4166-afbe-d8bacd841605.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.member_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.tenant_subdomain = "demo"
        
        # Test data storage
        self.created_resource_id = None
        self.created_booking_id = None
        self.created_event_id = None

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

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            f"auth/login?tenant_subdomain={self.tenant_subdomain}",
            200,
            data={"email": "admin@demo.com", "password": "password123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   Admin user: {response.get('user', {}).get('first_name')} {response.get('user', {}).get('last_name')}")
            return True
        return False

    def test_member_login(self):
        """Test member login"""
        success, response = self.run_test(
            "Member Login",
            "POST",
            f"auth/login?tenant_subdomain={self.tenant_subdomain}",
            200,
            data={"email": "john@demo.com", "password": "password123"}
        )
        if success and 'access_token' in response:
            self.member_token = response['access_token']
            print(f"   Member user: {response.get('user', {}).get('first_name')} {response.get('user', {}).get('last_name')}")
            return True
        return False

    def test_get_current_user(self, token, user_type):
        """Test getting current user info"""
        success, response = self.run_test(
            f"Get Current User ({user_type})",
            "GET",
            "users/me",
            200,
            token=token
        )
        if success:
            print(f"   User role: {response.get('role')}")
            print(f"   Membership tier: {response.get('membership_tier')}")
        return success

    def test_get_users_admin(self):
        """Test getting all users (admin only)"""
        success, response = self.run_test(
            "Get All Users (Admin)",
            "GET",
            "users",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Found {len(response)} users")
        return success

    def test_get_users_member_forbidden(self):
        """Test that members cannot access all users"""
        success, response = self.run_test(
            "Get All Users (Member - Should Fail)",
            "GET",
            "users",
            403,  # Should be forbidden
            token=self.member_token
        )
        return success

    def test_create_resource(self):
        """Test creating a resource (admin only)"""
        resource_data = {
            "name": "Test Conference Room",
            "type": "room",
            "capacity": 10,
            "amenities": ["projector", "whiteboard"],
            "hourly_rate": 25.0,
            "member_discount": 10.0,
            "premium_member_discount": 20.0,
            "is_bookable": True,
            "min_booking_duration": 60,
            "max_booking_duration": 480
        }
        
        success, response = self.run_test(
            "Create Resource",
            "POST",
            "resources",
            200,
            data=resource_data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.created_resource_id = response['id']
            print(f"   Created resource ID: {self.created_resource_id}")
        return success

    def test_get_resources(self, token, user_type):
        """Test getting resources"""
        success, response = self.run_test(
            f"Get Resources ({user_type})",
            "GET",
            "resources",
            200,
            token=token
        )
        if success:
            print(f"   Found {len(response)} resources")
        return success

    def test_create_booking(self):
        """Test creating a booking"""
        if not self.created_resource_id:
            print("❌ Cannot test booking - no resource created")
            return False
            
        # Book for tomorrow
        tomorrow = datetime.now() + timedelta(days=1)
        start_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(hours=2)
        
        booking_data = {
            "resource_id": self.created_resource_id,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "attendees": 5,
            "notes": "Test booking for team meeting"
        }
        
        success, response = self.run_test(
            "Create Booking",
            "POST",
            "bookings",
            200,
            data=booking_data,
            token=self.member_token
        )
        if success and 'id' in response:
            self.created_booking_id = response['id']
            print(f"   Created booking ID: {self.created_booking_id}")
            print(f"   Total cost: ${response.get('total_cost', 0)}")
        return success

    def test_get_bookings(self, token, user_type):
        """Test getting bookings"""
        success, response = self.run_test(
            f"Get Bookings ({user_type})",
            "GET",
            "bookings",
            200,
            token=token
        )
        if success:
            print(f"   Found {len(response)} bookings")
        return success

    def test_check_availability(self):
        """Test checking resource availability"""
        if not self.created_resource_id:
            print("❌ Cannot test availability - no resource created")
            return False
            
        tomorrow = datetime.now() + timedelta(days=1)
        date_str = tomorrow.strftime('%Y-%m-%d')
        
        success, response = self.run_test(
            "Check Resource Availability",
            "GET",
            f"bookings/availability/{self.created_resource_id}?start_date={date_str}",
            200,
            token=self.member_token
        )
        if success:
            print(f"   Availability for {date_str}: {len(response.get('bookings', []))} existing bookings")
        return success

    def test_check_in(self):
        """Test checking in"""
        checkin_data = {
            "resource_id": self.created_resource_id
        }
        
        success, response = self.run_test(
            "Check In",
            "POST",
            "checkin",
            200,
            data=checkin_data,
            token=self.member_token
        )
        if success:
            print(f"   Checked in at: {response.get('check_in_time')}")
        return success

    def test_get_current_checkin(self):
        """Test getting current check-in status"""
        success, response = self.run_test(
            "Get Current Check-in",
            "GET",
            "checkin/current",
            200,
            token=self.member_token
        )
        if success:
            print(f"   Checked in: {response.get('checked_in')}")
            if response.get('checked_in'):
                print(f"   Duration: {response.get('duration_minutes')} minutes")
        return success

    def test_check_out(self):
        """Test checking out"""
        success, response = self.run_test(
            "Check Out",
            "POST",
            "checkout",
            200,
            token=self.member_token
        )
        if success:
            print(f"   Duration: {response.get('duration_minutes')} minutes")
        return success

    def test_create_event(self):
        """Test creating an event"""
        tomorrow = datetime.now() + timedelta(days=2)
        start_time = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(hours=1)
        
        event_data = {
            "title": "Test Networking Event",
            "description": "A test networking event for the community",
            "event_type": "networking",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "location": "Main Hall",
            "max_attendees": 50,
            "is_public": True,
            "cost": 0,
            "tags": ["networking", "community"]
        }
        
        success, response = self.run_test(
            "Create Event",
            "POST",
            "events",
            200,
            data=event_data,
            token=self.member_token
        )
        if success and 'id' in response:
            self.created_event_id = response['id']
            print(f"   Created event ID: {self.created_event_id}")
        return success

    def test_get_events(self):
        """Test getting events"""
        success, response = self.run_test(
            "Get Events",
            "GET",
            "events",
            200,
            token=self.member_token
        )
        if success:
            print(f"   Found {len(response)} events")
        return success

    def test_join_event(self):
        """Test joining an event"""
        if not self.created_event_id:
            print("❌ Cannot test join event - no event created")
            return False
            
        success, response = self.run_test(
            "Join Event",
            "POST",
            f"events/{self.created_event_id}/join",
            200,
            token=self.admin_token  # Use admin token to join as different user
        )
        if success:
            print(f"   Join result: {response.get('message')}")
        return success

    def test_member_directory(self):
        """Test getting member directory"""
        success, response = self.run_test(
            "Get Member Directory",
            "GET",
            "users/directory",
            200,
            token=self.member_token
        )
        if success:
            print(f"   Found {len(response)} members in directory")
        return success

    def test_update_profile(self):
        """Test updating user profile"""
        profile_data = {
            "profile": {
                "bio": "Test bio for automated testing",
                "company": "Test Company",
                "job_title": "Software Tester",
                "skills": ["Python", "API Testing", "Automation"],
                "interests": ["Technology", "Networking"],
                "looking_for": "collaboration",
                "open_to_connect": True
            }
        }
        
        success, response = self.run_test(
            "Update Profile",
            "PUT",
            "users/me/profile",
            200,
            data=profile_data,
            token=self.member_token
        )
        if success:
            print(f"   Updated profile for: {response.get('first_name')} {response.get('last_name')}")
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics (admin only)"""
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Total members: {response.get('total_members')}")
            print(f"   Active members: {response.get('active_members')}")
            print(f"   Total resources: {response.get('total_resources')}")
            print(f"   Today's bookings: {response.get('today_bookings')}")
            print(f"   Current check-ins: {response.get('current_checkins')}")
            print(f"   Monthly revenue: ${response.get('monthly_revenue')}")
        return success

    def test_dashboard_analytics(self):
        """Test dashboard analytics (admin only)"""
        success, response = self.run_test(
            "Get Dashboard Analytics",
            "GET",
            "dashboard/analytics",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Resource usage data points: {len(response.get('resource_usage', []))}")
            print(f"   Member activity data points: {len(response.get('member_activity', []))}")
        return success

def main():
    print("🚀 Starting Space Management Platform API Tests")
    print("=" * 60)
    
    tester = SpaceManagementAPITester()
    
    # Authentication Tests
    print("\n📋 AUTHENTICATION TESTS")
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1
        
    if not tester.test_member_login():
        print("❌ Member login failed, stopping tests")
        return 1
    
    # User Management Tests
    print("\n👥 USER MANAGEMENT TESTS")
    tester.test_get_current_user(tester.admin_token, "Admin")
    tester.test_get_current_user(tester.member_token, "Member")
    tester.test_get_users_admin()
    tester.test_get_users_member_forbidden()
    tester.test_update_profile()
    tester.test_member_directory()
    
    # Resource Management Tests
    print("\n🏢 RESOURCE MANAGEMENT TESTS")
    tester.test_create_resource()
    tester.test_get_resources(tester.admin_token, "Admin")
    tester.test_get_resources(tester.member_token, "Member")
    
    # Booking Tests
    print("\n📅 BOOKING TESTS")
    tester.test_create_booking()
    tester.test_get_bookings(tester.admin_token, "Admin")
    tester.test_get_bookings(tester.member_token, "Member")
    tester.test_check_availability()
    
    # Check-in/Check-out Tests
    print("\n🚪 CHECK-IN/OUT TESTS")
    tester.test_check_in()
    tester.test_get_current_checkin()
    tester.test_check_out()
    
    # Event Tests
    print("\n🎉 EVENT TESTS")
    tester.test_create_event()
    tester.test_get_events()
    tester.test_join_event()
    
    # Dashboard Tests
    print("\n📊 DASHBOARD TESTS")
    tester.test_dashboard_stats()
    tester.test_dashboard_analytics()
    
    # Print final results
    print("\n" + "=" * 60)
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