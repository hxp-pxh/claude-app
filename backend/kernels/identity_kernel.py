"""
Identity & Authentication Kernel
Manages users, roles, permissions, and authentication across all tenants
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from kernels.base_kernel import BaseKernel


class IdentityKernel(BaseKernel):
    """Universal identity and authentication management"""
    
    def __init__(self, db, secret_key: str, algorithm: str = "HS256"):
        super().__init__(db)
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    async def _initialize_kernel(self):
        """Initialize identity kernel"""
        # Ensure indexes exist
        await self.db.users.create_index([("email", 1), ("tenant_id", 1)], unique=True)
        await self.db.user_passwords.create_index("user_id", unique=True)
        await self.db.tenants.create_index("subdomain", unique=True)
    
    async def validate_tenant_access(self, tenant_id: str, user_id: str) -> bool:
        """Validate user belongs to tenant"""
        user = await self.db.users.find_one({"id": user_id, "tenant_id": tenant_id})
        return user is not None
    
    # User Management
    async def create_user(self, tenant_id: str, user_data: Dict[str, Any], password: str) -> Dict[str, Any]:
        """Create a new user in the system"""
        # Hash password
        hashed_password = self.pwd_context.hash(password)
        
        # Create user document
        user_doc = {
            **user_data,
            "tenant_id": tenant_id,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "last_login": None
        }
        
        # Insert user and password
        await self.db.users.insert_one(user_doc)
        await self.db.user_passwords.insert_one({
            "user_id": user_doc["id"],
            "hashed_password": hashed_password
        })
        
        return user_doc
    
    async def authenticate_user(self, tenant_subdomain: str, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user and return user data if valid"""
        # Find tenant
        tenant = await self.db.tenants.find_one({"subdomain": tenant_subdomain})
        if not tenant:
            return None
        
        # Find user
        user = await self.db.users.find_one({
            "email": email,
            "tenant_id": tenant["id"],
            "is_active": True
        })
        if not user:
            return None
        
        # Verify password
        password_doc = await self.db.user_passwords.find_one({"user_id": user["id"]})
        if not password_doc or not self.pwd_context.verify(password, password_doc["hashed_password"]):
            return None
        
        # Update last login
        await self.db.users.update_one(
            {"id": user["id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        return {**user, "tenant": tenant}
    
    async def create_access_token(self, user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = {"sub": user_id}
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=30)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    async def verify_token(self, token: str) -> Optional[str]:
        """Verify JWT token and return user_id"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload.get("sub")
        except jwt.PyJWTError:
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        return await self.db.users.find_one({"id": user_id, "is_active": True})
    
    async def get_user_permissions(self, user_id: str) -> List[str]:
        """Get user permissions based on role"""
        user = await self.get_user_by_id(user_id)
        if not user:
            return []
        
        # Define role-based permissions
        role_permissions = {
            "platform_admin": ["*"],  # All permissions
            "account_owner": [
                "tenant.manage", "users.manage", "pages.manage", 
                "forms.manage", "leads.manage", "tours.manage", "settings.manage",
                "role.account_owner"  # Add role-based permission
            ],
            "administrator": [
                "users.manage", "pages.manage", "forms.manage", 
                "leads.manage", "tours.manage", "role.administrator"
            ],
            "property_manager": [
                "pages.manage", "forms.manage", "leads.manage", "tours.manage",
                "role.property_manager"
            ],
            "front_desk": [
                "leads.view", "leads.update", "tours.view", "tours.manage",
                "role.front_desk"
            ],
            "member": ["dashboard.view", "role.member"],
            "company_admin": ["dashboard.view", "role.company_admin"],
            "company_user": ["dashboard.view", "role.company_user"],
            "maintenance": ["spaces.view", "spaces.update", "role.maintenance"],
            "security": ["access.manage", "role.security"]
        }
        
        return role_permissions.get(user["role"], [])
    
    async def check_permission(self, user_id: str, permission: str) -> bool:
        """Check if user has specific permission"""
        permissions = await self.get_user_permissions(user_id)
        return "*" in permissions or permission in permissions
    
    # Tenant Management
    async def create_tenant(self, tenant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new tenant"""
        tenant_doc = {
            **tenant_data,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        await self.db.tenants.insert_one(tenant_doc)
        return tenant_doc
    
    async def get_tenant_by_subdomain(self, subdomain: str) -> Optional[Dict[str, Any]]:
        """Get tenant by subdomain"""
        return await self.db.tenants.find_one({"subdomain": subdomain, "is_active": True})
    
    async def get_tenant_by_id(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Get tenant by ID"""
        return await self.db.tenants.find_one({"id": tenant_id, "is_active": True})