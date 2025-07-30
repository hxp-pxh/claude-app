#!/usr/bin/env python3

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from claude_platform_core import get_platform_core

async def debug_permissions():
    # Connect to database
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'test_database')]
    
    # Get platform core
    core = await get_platform_core(db)
    identity_kernel = core.get_kernel('identity')
    
    # Find a test user (account owner from downtown-hub)
    user = await db.users.find_one({
        "email": "admin@downtownhub.com",
        "role": "account_owner"
    })
    
    if user:
        print(f"Found user: {user['email']} with role: {user['role']}")
        print(f"User ID: {user['id']}")
        
        # Check permissions
        permissions = await identity_kernel.get_user_permissions(user['id'])
        print(f"User permissions: {permissions}")
        
        # Test specific permission checks
        test_permissions = [
            "role.account_owner",
            "pages.manage",
            "leads.manage",
            "forms.manage"
        ]
        
        for perm in test_permissions:
            has_perm = await identity_kernel.check_permission(user['id'], perm)
            print(f"Permission '{perm}': {has_perm}")
        
        # Test platform core permission check
        has_platform_perm = await core.check_user_permission(
            user['tenant_id'], 
            user['id'], 
            "role.account_owner"
        )
        print(f"Platform core permission check for 'role.account_owner': {has_platform_perm}")
        
    else:
        print("No test user found")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_permissions())