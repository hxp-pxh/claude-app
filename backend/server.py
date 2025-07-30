from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-this-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Space Management Platform", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    PLATFORM_ADMIN = "platform_admin"
    TENANT_ADMIN = "tenant_admin" 
    STAFF = "staff"
    MEMBER = "member"

class MembershipTier(str, Enum):
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class ResourceType(str, Enum):
    BUILDING = "building"
    FLOOR = "floor"
    ROOM = "room"
    DESK = "desk"
    EQUIPMENT = "equipment"

class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    PENDING = "pending" 
    CANCELLED = "cancelled"

class EventType(str, Enum):
    WORKSHOP = "workshop"
    NETWORKING = "networking"
    SOCIAL = "social"
    PRESENTATION = "presentation"
    MEETING = "meeting"

class CheckInStatus(str, Enum):
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"

# Enhanced Models
class MemberProfile(BaseModel):
    bio: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    linkedin: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    looking_for: Optional[str] = None  # collaboration, networking, etc.
    open_to_connect: bool = True

class Tenant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subdomain: str
    custom_domain: Optional[str] = None
    plan: str = "basic"
    is_active: bool = True
    settings: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TenantCreate(BaseModel):
    name: str
    subdomain: str
    admin_email: EmailStr
    admin_password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool = True
    membership_tier: Optional[MembershipTier] = None
    profile: Optional[MemberProfile] = Field(default_factory=MemberProfile)
    membership_start_date: Optional[datetime] = None
    membership_end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: UserRole = UserRole.MEMBER
    membership_tier: Optional[MembershipTier] = MembershipTier.BASIC

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    profile: MemberProfile

class Resource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    type: ResourceType
    parent_id: Optional[str] = None  # For hierarchy
    capacity: Optional[int] = None
    amenities: List[str] = Field(default_factory=list)
    hourly_rate: Optional[float] = None
    daily_rate: Optional[float] = None
    member_discount: Optional[float] = None  # Percentage discount for members
    premium_member_discount: Optional[float] = None
    is_bookable: bool = True
    is_active: bool = True
    min_booking_duration: Optional[int] = None  # minutes
    max_booking_duration: Optional[int] = None  # minutes
    advance_booking_days: Optional[int] = 30  # how far ahead can be booked
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ResourceCreate(BaseModel):
    name: str
    type: ResourceType
    parent_id: Optional[str] = None
    capacity: Optional[int] = None
    amenities: List[str] = Field(default_factory=list)
    hourly_rate: Optional[float] = None
    daily_rate: Optional[float] = None
    member_discount: Optional[float] = None
    premium_member_discount: Optional[float] = None
    is_bookable: bool = True
    min_booking_duration: Optional[int] = None
    max_booking_duration: Optional[int] = None
    advance_booking_days: Optional[int] = 30

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    user_id: str
    resource_id: str
    start_time: datetime
    end_time: datetime
    status: BookingStatus = BookingStatus.CONFIRMED
    attendees: int = 1
    notes: Optional[str] = None
    total_cost: Optional[float] = None
    is_recurring: bool = False
    recurring_pattern: Optional[Dict[str, Any]] = None  # daily, weekly, monthly
    parent_booking_id: Optional[str] = None  # for recurring bookings
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookingCreate(BaseModel):
    resource_id: str
    start_time: datetime
    end_time: datetime
    attendees: int = 1
    notes: Optional[str] = None
    is_recurring: bool = False
    recurring_pattern: Optional[Dict[str, Any]] = None

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    host_user_id: str
    title: str
    description: str
    event_type: EventType
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    resource_id: Optional[str] = None
    max_attendees: Optional[int] = None
    is_public: bool = True
    requires_approval: bool = False
    cost: Optional[float] = None
    attendees: List[str] = Field(default_factory=list)  # user IDs
    waitlist: List[str] = Field(default_factory=list)  # user IDs
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EventCreate(BaseModel):
    title: str
    description: str
    event_type: EventType
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    resource_id: Optional[str] = None
    max_attendees: Optional[int] = None
    is_public: bool = True
    requires_approval: bool = False
    cost: Optional[float] = None
    tags: List[str] = Field(default_factory=list)

class CheckIn(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    user_id: str
    resource_id: Optional[str] = None
    check_in_time: datetime = Field(default_factory=datetime.utcnow)
    check_out_time: Optional[datetime] = None
    status: CheckInStatus = CheckInStatus.CHECKED_IN
    duration_minutes: Optional[int] = None

class CheckInCreate(BaseModel):
    resource_id: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Utility functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user)

def require_role(required_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

def calculate_booking_cost(resource: dict, start_time: datetime, end_time: datetime, user_tier: Optional[str] = None) -> float:
    """Calculate booking cost with member discounts"""
    duration_hours = (end_time - start_time).total_seconds() / 3600
    base_cost = 0
    
    if resource.get("hourly_rate"):
        base_cost = resource["hourly_rate"] * duration_hours
    elif resource.get("daily_rate") and duration_hours >= 8:
        base_cost = resource["daily_rate"] * (duration_hours / 24)
    
    # Apply member discounts
    if user_tier == "premium" and resource.get("premium_member_discount"):
        discount = resource["premium_member_discount"] / 100
        base_cost *= (1 - discount)
    elif user_tier in ["basic", "premium"] and resource.get("member_discount"):
        discount = resource["member_discount"] / 100
        base_cost *= (1 - discount)
    
    return round(base_cost, 2)

# Authentication routes
@api_router.post("/auth/register", response_model=Token)
async def register_user(user_data: UserCreate, tenant_subdomain: str):
    # Find tenant by subdomain
    tenant = await db.tenants.find_one({"subdomain": tenant_subdomain})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email, "tenant_id": tenant["id"]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    user_dict.pop("password")
    user_dict["tenant_id"] = tenant["id"]
    
    # Set membership dates for members
    if user_dict["role"] == UserRole.MEMBER:
        user_dict["membership_start_date"] = datetime.utcnow()
        user_dict["membership_end_date"] = datetime.utcnow() + timedelta(days=365)
    
    user = User(**user_dict)
    await db.users.insert_one(user.dict())
    await db.user_passwords.insert_one({"user_id": user.id, "hashed_password": hashed_password})
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, user=user)

@api_router.post("/auth/login", response_model=Token)
async def login_user(user_data: UserLogin, tenant_subdomain: str):
    # Find tenant
    tenant = await db.tenants.find_one({"subdomain": tenant_subdomain})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Find user
    user = await db.users.find_one({"email": user_data.email, "tenant_id": tenant["id"]})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    password_doc = await db.user_passwords.find_one({"user_id": user["id"]})
    if not password_doc or not verify_password(user_data.password, password_doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_login": datetime.utcnow()}})
    
    user_obj = User(**user)
    access_token = create_access_token(data={"sub": user_obj.id})
    return Token(access_token=access_token, user=user_obj)

# Tenant management routes
@api_router.post("/tenants", response_model=Tenant)
async def create_tenant(tenant_data: TenantCreate):
    # Check if subdomain is available
    existing_tenant = await db.tenants.find_one({"subdomain": tenant_data.subdomain})
    if existing_tenant:
        raise HTTPException(status_code=400, detail="Subdomain already taken")
    
    # Create tenant
    tenant = Tenant(
        name=tenant_data.name,
        subdomain=tenant_data.subdomain
    )
    await db.tenants.insert_one(tenant.dict())
    
    # Create admin user
    hashed_password = get_password_hash(tenant_data.admin_password)
    admin_user = User(
        tenant_id=tenant.id,
        email=tenant_data.admin_email,
        first_name="Admin",
        last_name="User", 
        role=UserRole.TENANT_ADMIN
    )
    await db.users.insert_one(admin_user.dict())
    await db.user_passwords.insert_one({"user_id": admin_user.id, "hashed_password": hashed_password})
    
    return tenant

# Enhanced User/Profile management routes
@api_router.get("/users", response_model=List[User])
async def get_users(
    current_user: User = Depends(require_role([UserRole.TENANT_ADMIN, UserRole.STAFF]))
):
    users = await db.users.find({"tenant_id": current_user.tenant_id}).to_list(1000)
    return [User(**user) for user in users]

@api_router.get("/users/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/users/me/profile", response_model=User)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"profile": profile_data.profile.dict()}}
    )
    
    updated_user = await db.users.find_one({"id": current_user.id})
    return User(**updated_user)

@api_router.get("/users/directory")
async def get_member_directory(
    current_user: User = Depends(get_current_user)
):
    """Get public member directory for networking"""
    users = await db.users.find({
        "tenant_id": current_user.tenant_id,
        "role": UserRole.MEMBER,
        "is_active": True,
        "profile.open_to_connect": True
    }).to_list(1000)
    
    # Create filtered user objects without sensitive information
    filtered_users = []
    for user in users:
        # Create a copy and remove sensitive fields
        user_data = dict(user)
        user_data.pop("email", None)  # Remove email for privacy
        
        # Create a simplified user dict
        filtered_user = {
            "id": user_data.get("id"),
            "first_name": user_data.get("first_name"),
            "last_name": user_data.get("last_name"),
            "role": user_data.get("role"),
            "membership_tier": user_data.get("membership_tier"),
            "profile": user_data.get("profile", {}),
            "created_at": user_data.get("created_at")
        }
        filtered_users.append(filtered_user)
    
    return filtered_users

# Resource management routes
@api_router.post("/resources", response_model=Resource)
async def create_resource(
    resource_data: ResourceCreate,
    current_user: User = Depends(require_role([UserRole.TENANT_ADMIN, UserRole.STAFF]))
):
    resource = Resource(**resource_data.dict(), tenant_id=current_user.tenant_id)
    await db.resources.insert_one(resource.dict())
    return resource

@api_router.get("/resources", response_model=List[Resource])
async def get_resources(
    resource_type: Optional[ResourceType] = None,
    current_user: User = Depends(get_current_user)
):
    query = {"tenant_id": current_user.tenant_id, "is_active": True}
    if resource_type:
        query["type"] = resource_type
    
    resources = await db.resources.find(query).to_list(1000)
    return [Resource(**resource) for resource in resources]

@api_router.get("/resources/{resource_id}", response_model=Resource)
async def get_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user)
):
    resource = await db.resources.find_one({
        "id": resource_id, 
        "tenant_id": current_user.tenant_id
    })
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return Resource(**resource)

# Enhanced Booking routes with member pricing
@api_router.post("/bookings", response_model=Booking)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user)
):
    # Validate resource exists and belongs to tenant
    resource = await db.resources.find_one({
        "id": booking_data.resource_id,
        "tenant_id": current_user.tenant_id,
        "is_bookable": True,
        "is_active": True
    })
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found or not bookable")
    
    # Check booking duration limits
    duration_minutes = (booking_data.end_time - booking_data.start_time).total_seconds() / 60
    
    if resource.get("min_booking_duration") and duration_minutes < resource["min_booking_duration"]:
        raise HTTPException(status_code=400, detail=f"Minimum booking duration is {resource['min_booking_duration']} minutes")
    
    if resource.get("max_booking_duration") and duration_minutes > resource["max_booking_duration"]:
        raise HTTPException(status_code=400, detail=f"Maximum booking duration is {resource['max_booking_duration']} minutes")
    
    # Check advance booking limit
    if resource.get("advance_booking_days"):
        max_advance = datetime.utcnow() + timedelta(days=resource["advance_booking_days"])
        if booking_data.start_time > max_advance:
            raise HTTPException(status_code=400, detail=f"Cannot book more than {resource['advance_booking_days']} days in advance")
    
    # Check for conflicts
    existing_bookings = await db.bookings.find({
        "resource_id": booking_data.resource_id,
        "status": {"$in": [BookingStatus.CONFIRMED, BookingStatus.PENDING]},
        "$or": [
            {
                "start_time": {"$lte": booking_data.end_time},
                "end_time": {"$gte": booking_data.start_time}
            }
        ]
    }).to_list(100)
    
    if existing_bookings:
        raise HTTPException(status_code=400, detail="Time slot not available")
    
    # Calculate cost with member discounts
    total_cost = calculate_booking_cost(resource, booking_data.start_time, booking_data.end_time, current_user.membership_tier)
    
    booking = Booking(
        **booking_data.dict(),
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        total_cost=total_cost
    )
    await db.bookings.insert_one(booking.dict())
    
    # Handle recurring bookings
    if booking_data.is_recurring and booking_data.recurring_pattern:
        await create_recurring_bookings(booking, booking_data.recurring_pattern)
    
    return booking

async def create_recurring_bookings(parent_booking: Booking, pattern: Dict[str, Any]):
    """Create recurring booking instances"""
    recurring_bookings = []
    pattern_type = pattern.get("type", "weekly")
    occurrences = pattern.get("occurrences", 10)
    
    for i in range(1, occurrences + 1):
        if pattern_type == "daily":
            delta = timedelta(days=i)
        elif pattern_type == "weekly":
            delta = timedelta(weeks=i)
        elif pattern_type == "monthly":
            delta = timedelta(days=i * 30)  # Simplified monthly
        else:
            continue
        
        new_start = parent_booking.start_time + delta
        new_end = parent_booking.end_time + delta
        
        # Check for conflicts
        existing_bookings = await db.bookings.find({
            "resource_id": parent_booking.resource_id,
            "status": {"$in": [BookingStatus.CONFIRMED, BookingStatus.PENDING]},
            "$or": [
                {
                    "start_time": {"$lte": new_end},
                    "end_time": {"$gte": new_start}
                }
            ]
        }).to_list(100)
        
        if not existing_bookings:
            recurring_booking = Booking(
                tenant_id=parent_booking.tenant_id,
                user_id=parent_booking.user_id,
                resource_id=parent_booking.resource_id,
                start_time=new_start,
                end_time=new_end,
                status=parent_booking.status,
                attendees=parent_booking.attendees,
                notes=parent_booking.notes,
                total_cost=parent_booking.total_cost,
                is_recurring=True,
                parent_booking_id=parent_booking.id
            )
            recurring_bookings.append(recurring_booking.dict())
    
    if recurring_bookings:
        await db.bookings.insert_many(recurring_bookings)

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(
    current_user: User = Depends(get_current_user)
):
    query = {"tenant_id": current_user.tenant_id}
    if current_user.role == UserRole.MEMBER:
        query["user_id"] = current_user.id
    
    bookings = await db.bookings.find(query).sort("start_time", 1).to_list(1000)
    return [Booking(**booking) for booking in bookings]

@api_router.get("/bookings/availability/{resource_id}")
async def check_availability(
    resource_id: str,
    start_date: str,  # YYYY-MM-DD
    current_user: User = Depends(get_current_user)
):
    try:
        check_date = datetime.fromisoformat(start_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    # Get bookings for the day
    start_of_day = check_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)
    
    bookings = await db.bookings.find({
        "resource_id": resource_id,
        "tenant_id": current_user.tenant_id,
        "status": {"$in": [BookingStatus.CONFIRMED, BookingStatus.PENDING]},
        "start_time": {"$gte": start_of_day, "$lt": end_of_day}
    }).to_list(100)
    
    return {
        "date": start_date,
        "resource_id": resource_id,
        "bookings": [
            {
                "start_time": booking["start_time"].isoformat(),
                "end_time": booking["end_time"].isoformat(),
                "user_id": booking["user_id"]
            }
            for booking in bookings
        ]
    }

# Check-in/Check-out routes
@api_router.post("/checkin", response_model=CheckIn)
async def check_in(
    checkin_data: CheckInCreate,
    current_user: User = Depends(get_current_user)
):
    # Check if user is already checked in
    existing_checkin = await db.checkins.find_one({
        "user_id": current_user.id,
        "tenant_id": current_user.tenant_id,
        "status": CheckInStatus.CHECKED_IN
    })
    
    if existing_checkin:
        raise HTTPException(status_code=400, detail="Already checked in")
    
    checkin = CheckIn(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        resource_id=checkin_data.resource_id
    )
    
    await db.checkins.insert_one(checkin.dict())
    return checkin

@api_router.post("/checkout")
async def check_out(current_user: User = Depends(get_current_user)):
    # Find active check-in
    checkin = await db.checkins.find_one({
        "user_id": current_user.id,
        "tenant_id": current_user.tenant_id,
        "status": CheckInStatus.CHECKED_IN
    })
    
    if not checkin:
        raise HTTPException(status_code=404, detail="No active check-in found")
    
    checkout_time = datetime.utcnow()
    duration_minutes = int((checkout_time - checkin["check_in_time"]).total_seconds() / 60)
    
    await db.checkins.update_one(
        {"id": checkin["id"]},
        {
            "$set": {
                "check_out_time": checkout_time,
                "status": CheckInStatus.CHECKED_OUT,
                "duration_minutes": duration_minutes
            }
        }
    )
    
    return {"message": "Checked out successfully", "duration_minutes": duration_minutes}

@api_router.get("/checkin/current")
async def get_current_checkin(current_user: User = Depends(get_current_user)):
    checkin = await db.checkins.find_one({
        "user_id": current_user.id,
        "tenant_id": current_user.tenant_id,
        "status": CheckInStatus.CHECKED_IN
    })
    
    if not checkin:
        return {"checked_in": False}
    
    return {
        "checked_in": True,
        "checkin": CheckIn(**checkin),
        "duration_minutes": int((datetime.utcnow() - checkin["check_in_time"]).total_seconds() / 60)
    }

# Event management routes
@api_router.post("/events", response_model=Event)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user)
):
    event = Event(**event_data.dict(), tenant_id=current_user.tenant_id, host_user_id=current_user.id)
    await db.events.insert_one(event.dict())
    return event

@api_router.get("/events", response_model=List[Event])
async def get_events(
    upcoming_only: bool = True,
    current_user: User = Depends(get_current_user)
):
    query = {"tenant_id": current_user.tenant_id, "is_public": True}
    
    if upcoming_only:
        query["start_time"] = {"$gte": datetime.utcnow()}
    
    events = await db.events.find(query).sort("start_time", 1).to_list(1000)
    return [Event(**event) for event in events]

@api_router.post("/events/{event_id}/join")
async def join_event(
    event_id: str,
    current_user: User = Depends(get_current_user)
):
    event = await db.events.find_one({
        "id": event_id,
        "tenant_id": current_user.tenant_id
    })
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if current_user.id in event.get("attendees", []):
        raise HTTPException(status_code=400, detail="Already joined this event")
    
    # Check capacity
    if event.get("max_attendees") and len(event.get("attendees", [])) >= event["max_attendees"]:
        # Add to waitlist
        await db.events.update_one(
            {"id": event_id},
            {"$addToSet": {"waitlist": current_user.id}}
        )
        return {"message": "Added to waitlist", "waitlisted": True}
    else:
        # Add to attendees
        await db.events.update_one(
            {"id": event_id},
            {"$addToSet": {"attendees": current_user.id}}
        )
        return {"message": "Successfully joined event", "joined": True}

# Enhanced Dashboard routes with coworking analytics
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(require_role([UserRole.TENANT_ADMIN, UserRole.STAFF]))
):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    this_week = today - timedelta(days=today.weekday())
    this_month = today.replace(day=1)
    
    # Get counts
    total_members = await db.users.count_documents({
        "tenant_id": current_user.tenant_id,
        "role": UserRole.MEMBER
    })
    
    active_members = await db.users.count_documents({
        "tenant_id": current_user.tenant_id,
        "role": UserRole.MEMBER,
        "is_active": True,
        "last_login": {"$gte": this_month}
    })
    
    total_resources = await db.resources.count_documents({
        "tenant_id": current_user.tenant_id,
        "is_active": True
    })
    
    today_bookings = await db.bookings.count_documents({
        "tenant_id": current_user.tenant_id,
        "start_time": {"$gte": today, "$lt": today + timedelta(days=1)},
        "status": BookingStatus.CONFIRMED
    })
    
    # Current check-ins
    current_checkins = await db.checkins.count_documents({
        "tenant_id": current_user.tenant_id,
        "status": CheckInStatus.CHECKED_IN
    })
    
    # Upcoming events
    upcoming_events = await db.events.count_documents({
        "tenant_id": current_user.tenant_id,
        "start_time": {"$gte": datetime.utcnow(), "$lt": datetime.utcnow() + timedelta(days=7)}
    })
    
    # Revenue this month (simplified)
    monthly_revenue = await db.bookings.aggregate([
        {
            "$match": {
                "tenant_id": current_user.tenant_id,
                "status": BookingStatus.CONFIRMED,
                "created_at": {"$gte": this_month},
                "total_cost": {"$ne": None}
            }
        },
        {
            "$group": {
                "_id": None,
                "total": {"$sum": "$total_cost"}
            }
        }
    ]).to_list(1)
    
    monthly_revenue_total = monthly_revenue[0]["total"] if monthly_revenue else 0
    
    # Get recent bookings
    recent_bookings_raw = await db.bookings.find({
        "tenant_id": current_user.tenant_id
    }).sort("created_at", -1).limit(5).to_list(5)
    
    # Convert to serializable format
    recent_bookings = []
    for booking in recent_bookings_raw:
        recent_bookings.append({
            "id": booking["id"],
            "resource_id": booking["resource_id"],
            "user_id": booking["user_id"],
            "created_at": booking["created_at"].isoformat(),
            "start_time": booking["start_time"].isoformat(),
            "status": booking["status"],
            "total_cost": booking.get("total_cost")
        })
    
    return {
        "total_members": total_members,
        "active_members": active_members,
        "total_resources": total_resources,
        "today_bookings": today_bookings,
        "current_checkins": current_checkins,
        "upcoming_events": upcoming_events,
        "monthly_revenue": round(monthly_revenue_total, 2),
        "recent_bookings": recent_bookings
    }

@api_router.get("/dashboard/analytics")
async def get_analytics(
    current_user: User = Depends(require_role([UserRole.TENANT_ADMIN, UserRole.STAFF]))
):
    """Get detailed analytics for the dashboard"""
    now = datetime.utcnow()
    last_30_days = now - timedelta(days=30)
    
    # Resource utilization
    resource_usage = await db.bookings.aggregate([
        {
            "$match": {
                "tenant_id": current_user.tenant_id,
                "status": BookingStatus.CONFIRMED,
                "start_time": {"$gte": last_30_days}
            }
        },
        {
            "$group": {
                "_id": "$resource_id",
                "bookings": {"$sum": 1},
                "total_hours": {
                    "$sum": {
                        "$divide": [
                            {"$subtract": ["$end_time", "$start_time"]},
                            3600000  # Convert milliseconds to hours
                        ]
                    }
                }
            }
        },
        {"$sort": {"bookings": -1}}
    ]).to_list(10)
    
    # Member activity
    member_activity = await db.checkins.aggregate([
        {
            "$match": {
                "tenant_id": current_user.tenant_id,
                "check_in_time": {"$gte": last_30_days}
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$check_in_time"
                    }
                },
                "checkins": {"$sum": 1},
                "unique_members": {"$addToSet": "$user_id"}
            }
        },
        {
            "$project": {
                "date": "$_id",
                "checkins": 1,
                "unique_members": {"$size": "$unique_members"}
            }
        },
        {"$sort": {"date": 1}}
    ]).to_list(30)
    
    return {
        "resource_usage": resource_usage,
        "member_activity": member_activity
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()