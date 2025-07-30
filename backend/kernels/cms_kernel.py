"""
Content & CMS Kernel
Universal content management and website building engine
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from kernels.base_kernel import BaseKernel


class CMSKernel(BaseKernel):
    """Universal content management system"""
    
    async def _initialize_kernel(self):
        """Initialize CMS kernel"""
        # Ensure indexes exist
        await self.db.pages.create_index([("tenant_id", 1), ("slug", 1)], unique=True)
        await self.db.templates.create_index("industry_module")
        await self.db.widgets.create_index([("tenant_id", 1), ("type", 1)])
        await self.db.media_library.create_index([("tenant_id", 1), ("file_type", 1)])
    
    async def validate_tenant_access(self, tenant_id: str, user_id: str) -> bool:
        """Validate user belongs to tenant"""
        user = await self.db.users.find_one({"id": user_id, "tenant_id": tenant_id})
        return user is not None
    
    # Page Management
    async def create_page(self, tenant_id: str, page_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new page"""
        # Check slug uniqueness
        existing_page = await self.db.pages.find_one({
            "tenant_id": tenant_id,
            "slug": page_data["slug"]
        })
        if existing_page:
            raise ValueError(f"Page with slug '{page_data['slug']}' already exists")
        
        # Handle homepage setting
        if page_data.get("is_homepage"):
            await self.db.pages.update_many(
                {"tenant_id": tenant_id, "is_homepage": True},
                {"$set": {"is_homepage": False}}
            )
        
        page_doc = {
            **page_data,
            "tenant_id": tenant_id,
            "status": page_data.get("status", "draft"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await self.db.pages.insert_one(page_doc)
        return page_doc
    
    async def get_pages(self, tenant_id: str, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Get pages for tenant"""
        query = {"tenant_id": tenant_id}
        if filters:
            query.update(filters)
        
        pages = await self.db.pages.find(query).sort("created_at", -1).to_list(1000)
        return pages
    
    async def get_page_by_slug(self, tenant_id: str, slug: str) -> Optional[Dict[str, Any]]:
        """Get page by slug"""
        return await self.db.pages.find_one({
            "tenant_id": tenant_id,
            "slug": slug
        })
    
    async def update_page(self, page_id: str, tenant_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update page"""
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.pages.update_one(
            {"id": page_id, "tenant_id": tenant_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise ValueError("Page not found or not updated")
        
        return await self.db.pages.find_one({"id": page_id})
    
    async def delete_page(self, page_id: str, tenant_id: str) -> bool:
        """Delete page"""
        # Check if it's homepage
        page = await self.db.pages.find_one({"id": page_id, "tenant_id": tenant_id})
        if not page:
            return False
        
        if page.get("is_homepage"):
            raise ValueError("Cannot delete homepage")
        
        result = await self.db.pages.delete_one({"id": page_id, "tenant_id": tenant_id})
        return result.deleted_count > 0
    
    # Template Management
    async def get_templates(self, industry_module: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get templates, optionally filtered by industry"""
        query = {"is_active": True}
        if industry_module:
            query["$or"] = [
                {"industry_module": industry_module},
                {"industry_module": None}  # Universal templates
            ]
        
        templates = await self.db.templates.find(query).to_list(1000)
        return templates
    
    async def create_template(self, template_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new template"""
        template_doc = {
            **template_data,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        await self.db.templates.insert_one(template_doc)
        return template_doc
    
    # Widget Management
    async def create_widget(self, tenant_id: str, widget_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new widget"""
        widget_doc = {
            **widget_data,
            "tenant_id": tenant_id,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        await self.db.widgets.insert_one(widget_doc)
        return widget_doc
    
    async def get_widgets(self, tenant_id: str, widget_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get widgets for tenant"""
        query = {"tenant_id": tenant_id, "is_active": True}
        if widget_type:
            query["type"] = widget_type
        
        widgets = await self.db.widgets.find(query).to_list(1000)
        return widgets
    
    # Media Library
    async def upload_media(self, tenant_id: str, media_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add media to library"""
        media_doc = {
            **media_data,
            "tenant_id": tenant_id,
            "uploaded_at": datetime.utcnow()
        }
        await self.db.media_library.insert_one(media_doc)
        return media_doc
    
    async def get_media_library(self, tenant_id: str, file_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get media library items"""
        query = {"tenant_id": tenant_id}
        if file_type:
            query["file_type"] = file_type
        
        media = await self.db.media_library.find(query).sort("uploaded_at", -1).to_list(1000)
        return media
    
    # Public API
    async def get_published_page(self, tenant_id: str, slug: str) -> Optional[Dict[str, Any]]:
        """Get published page for public viewing"""
        return await self.db.pages.find_one({
            "tenant_id": tenant_id,
            "slug": slug,
            "status": "published"
        })
    
    async def get_homepage(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Get homepage for tenant"""
        return await self.db.pages.find_one({
            "tenant_id": tenant_id,
            "is_homepage": True,
            "status": "published"
        })