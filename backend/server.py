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
app = FastAPI(title="Space Management Platform", version="1.0.0")

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

# Models
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

class Resource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    name: str
    type: ResourceType
    parent_id: Optional[str] = None  # For hierarchy
    capacity: Optional[int] = None
    amenities: List[str] = Field(default_factory=list)
    hourly_rate: Optional[float] = None
    is_bookable: bool = True
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ResourceCreate(BaseModel):
    name: str
    type: ResourceType
    parent_id: Optional[str] = None
    capacity: Optional[int] = None
    amenities: List[str] = Field(default_factory=list)
    hourly_rate: Optional[float] = None
    is_bookable: bool = True

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
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookingCreate(BaseModel):
    resource_id: str
    start_time: datetime
    end_time: datetime
    attendees: int = 1
    notes: Optional[str] = None

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

# Booking routes
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
    
    # Calculate cost
    duration_hours = (booking_data.end_time - booking_data.start_time).total_seconds() / 3600
    total_cost = None
    if resource.get("hourly_rate"):
        total_cost = resource["hourly_rate"] * duration_hours
    
    booking = Booking(
        **booking_data.dict(),
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        total_cost=total_cost
    )
    await db.bookings.insert_one(booking.dict())
    return booking

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

# User management routes
@api_router.get("/users", response_model=List[User])
async def get_users(
    current_user: User = Depends(require_role([UserRole.TENANT_ADMIN, UserRole.STAFF]))
):
    users = await db.users.find({"tenant_id": current_user.tenant_id}).to_list(1000)
    return [User(**user) for user in users]

@api_router.get("/users/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Dashboard routes
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(require_role([UserRole.TENANT_ADMIN, UserRole.STAFF]))
):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get counts
    total_members = await db.users.count_documents({
        "tenant_id": current_user.tenant_id,
        "role": UserRole.MEMBER
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
    
    # Get recent bookings
    recent_bookings = await db.bookings.find({
        "tenant_id": current_user.tenant_id
    }).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_members": total_members,
        "total_resources": total_resources,
        "today_bookings": today_bookings,
        "recent_bookings": recent_bookings
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