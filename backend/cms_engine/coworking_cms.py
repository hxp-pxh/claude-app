"""
Enhanced CMS System for Coworking Module
Provides industry-specific content blocks and page building capabilities
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from kernels.base_kernel import BaseKernel


class CoworkingCMSEngine(BaseKernel):
    """Enhanced CMS engine specifically for coworking spaces"""
    
    async def _initialize_kernel(self):
        """Initialize coworking CMS engine"""
        # Ensure indexes exist
        await self.db.cms_blocks.create_index([("tenant_id", 1), ("block_type", 1)])
        await self.db.cms_templates.create_index([("industry_module", 1), ("is_active", 1)])
        await self.db.cms_themes.create_index([("industry_module", 1)])
        await self.db.page_builder_data.create_index([("tenant_id", 1), ("page_id", 1)])
    
    async def validate_tenant_access(self, tenant_id: str, user_id: str) -> bool:
        """Validate user belongs to tenant"""
        user = await self.db.users.find_one({"id": user_id, "tenant_id": tenant_id})
        return user is not None
    
    # Coworking-Specific Content Blocks
    def get_coworking_content_blocks(self) -> List[Dict[str, Any]]:
        """Get available content blocks for coworking spaces"""
        return [
            {
                "id": "coworking_hero",
                "name": "Community Hero Section",
                "category": "headers",
                "description": "Welcoming hero section highlighting community and collaboration",
                "customizable_fields": [
                    {"field": "title", "type": "text", "default": "Where Innovation Meets Community"},
                    {"field": "subtitle", "type": "text", "default": "Join our vibrant coworking community"},
                    {"field": "cta_text", "type": "text", "default": "Tour Our Space"},
                    {"field": "background_image", "type": "image", "default": "/images/coworking-hero.jpg"},
                    {"field": "video_url", "type": "url", "optional": True}
                ],
                "layout_options": ["centered", "left_aligned", "full_width"],
                "styling_options": {
                    "overlay_opacity": [0.3, 0.5, 0.7],
                    "text_color": ["white", "dark", "brand"],
                    "button_style": ["primary", "secondary", "outline"]
                }
            },
            {
                "id": "membership_pricing",
                "name": "Membership Plans",
                "category": "pricing",
                "description": "Professional pricing tables for different membership tiers",
                "customizable_fields": [
                    {"field": "title", "type": "text", "default": "Choose Your Membership"},
                    {"field": "subtitle", "type": "text", "default": "Flexible plans for every type of professional"},
                    {"field": "plans", "type": "repeater", "fields": [
                        {"field": "name", "type": "text", "default": "Hot Desk"},
                        {"field": "price", "type": "number", "default": 25},
                        {"field": "billing", "type": "select", "options": ["per day", "per month", "per year"]},
                        {"field": "features", "type": "list", "default": ["Access to all spaces", "Community events", "Fast WiFi"]},
                        {"field": "is_popular", "type": "boolean", "default": False}
                    ]}
                ],
                "layout_options": ["grid_3", "grid_2", "list_vertical"],
                "styling_options": {
                    "card_style": ["modern", "classic", "minimal"],
                    "highlight_popular": True,
                    "show_features": True
                }
            },
            {
                "id": "member_testimonials",
                "name": "Member Success Stories",
                "category": "social_proof",
                "description": "Showcase member testimonials and success stories",
                "customizable_fields": [
                    {"field": "title", "type": "text", "default": "What Our Members Say"},
                    {"field": "testimonials", "type": "repeater", "fields": [
                        {"field": "quote", "type": "textarea", "required": True},
                        {"field": "author_name", "type": "text", "required": True},
                        {"field": "author_title", "type": "text", "required": True},
                        {"field": "author_company", "type": "text", "optional": True},
                        {"field": "author_photo", "type": "image", "optional": True},
                        {"field": "rating", "type": "number", "min": 1, "max": 5, "default": 5}
                    ]}
                ],
                "layout_options": ["carousel", "grid", "single_featured"],
                "styling_options": {
                    "show_ratings": True,
                    "show_photos": True,
                    "auto_rotate": True
                }
            },
            {
                "id": "space_gallery",
                "name": "Space Showcase",
                "category": "galleries",
                "description": "Beautiful gallery of coworking spaces and amenities",
                "customizable_fields": [
                    {"field": "title", "type": "text", "default": "Explore Our Spaces"},
                    {"field": "spaces", "type": "repeater", "fields": [
                        {"field": "name", "type": "text", "required": True},
                        {"field": "description", "type": "textarea", "required": True},
                        {"field": "image", "type": "image", "required": True},
                        {"field": "capacity", "type": "number", "optional": True},
                        {"field": "amenities", "type": "list", "optional": True},
                        {"field": "booking_link", "type": "url", "optional": True}
                    ]}
                ],
                "layout_options": ["masonry", "grid", "slider"],
                "styling_options": {
                    "show_capacity": True,
                    "show_amenities": True,
                    "enable_lightbox": True,
                    "show_booking_button": True
                }
            },
            {
                "id": "community_events",
                "name": "Community Events",
                "category": "content",
                "description": "Display upcoming community events and workshops",
                "customizable_fields": [
                    {"field": "title", "type": "text", "default": "Upcoming Events"},
                    {"field": "view_type", "type": "select", "options": ["calendar", "list", "featured"], "default": "list"},
                    {"field": "show_past_events", "type": "boolean", "default": False},
                    {"field": "events_count", "type": "number", "default": 6, "max": 12}
                ],
                "layout_options": ["calendar_view", "event_cards", "timeline"],
                "styling_options": {
                    "show_rsvp_count": True,
                    "show_event_tags": True,
                    "highlight_today": True
                }
            },
            {
                "id": "amenities_grid",
                "name": "Amenities & Perks",
                "category": "features",
                "description": "Highlight coworking space amenities and member perks",
                "customizable_fields": [
                    {"field": "title", "type": "text", "default": "Member Amenities"},
                    {"field": "amenities", "type": "repeater", "fields": [
                        {"field": "name", "type": "text", "required": True},
                        {"field": "description", "type": "textarea", "required": True},
                        {"field": "icon", "type": "icon_picker", "required": True},
                        {"field": "is_premium", "type": "boolean", "default": False}
                    ]}
                ],
                "layout_options": ["grid_4", "grid_3", "grid_2"],
                "styling_options": {
                    "icon_style": ["outline", "filled", "colored"],
                    "show_premium_badge": True,
                    "card_hover_effect": True
                }
            },
            {
                "id": "community_stats",
                "name": "Community Highlights",
                "category": "metrics",
                "description": "Display community statistics and achievements",
                "customizable_fields": [
                    {"field": "title", "type": "text", "default": "Our Growing Community"},
                    {"field": "stats", "type": "repeater", "fields": [
                        {"field": "number", "type": "text", "required": True},
                        {"field": "label", "type": "text", "required": True},
                        {"field": "icon", "type": "icon_picker", "optional": True}
                    ]}
                ],
                "layout_options": ["horizontal", "grid", "vertical"],
                "styling_options": {
                    "animate_numbers": True,
                    "show_icons": True,
                    "background_style": ["transparent", "colored", "bordered"]
                }
            },
            {
                "id": "cta_membership",
                "name": "Membership Call-to-Action",
                "category": "conversion",
                "description": "Compelling CTA section to drive membership signups",
                "customizable_fields": [
                    {"field": "title", "type": "text", "default": "Ready to Join Our Community?"},
                    {"field": "subtitle", "type": "text", "default": "Start your journey with a free day pass"},
                    {"field": "primary_cta", "type": "text", "default": "Get Day Pass"},
                    {"field": "secondary_cta", "type": "text", "default": "Schedule Tour"},
                    {"field": "background_image", "type": "image", "optional": True}
                ],
                "layout_options": ["centered", "split", "full_width"],
                "styling_options": {
                    "style": ["gradient", "solid", "image_overlay"],
                    "button_size": ["small", "medium", "large"],
                    "text_alignment": ["center", "left"]
                }
            }
        ]
    
    # Theme System for Coworking
    def get_coworking_themes(self) -> List[Dict[str, Any]]:
        """Get available themes for coworking spaces"""
        return [
            {
                "id": "modern_collaborative",
                "name": "Modern Collaborative",
                "description": "Clean, modern design emphasizing teamwork and innovation",
                "preview_image": "/images/themes/modern-collaborative.jpg",
                "color_schemes": [
                    {
                        "name": "Tech Blue",
                        "primary": "#3B82F6",
                        "secondary": "#1E40AF",
                        "accent": "#F59E0B",
                        "background": "#F9FAFB",
                        "text": "#111827"
                    },
                    {
                        "name": "Creative Orange",
                        "primary": "#EA580C",
                        "secondary": "#DC2626",
                        "accent": "#059669",
                        "background": "#FFFBEB",
                        "text": "#111827"
                    },
                    {
                        "name": "Professional Purple",
                        "primary": "#7C3AED",
                        "secondary": "#5B21B6",
                        "accent": "#EC4899",
                        "background": "#FAFBFF",
                        "text": "#111827"
                    }
                ],
                "typography": {
                    "heading_font": "Inter",
                    "body_font": "Inter",
                    "font_weights": ["400", "500", "600", "700"]
                },
                "layout_settings": {
                    "header_style": "modern_nav",
                    "footer_style": "detailed",
                    "button_style": "rounded",
                    "card_style": "shadow"
                }
            },
            {
                "id": "creative_studio",
                "name": "Creative Studio",
                "description": "Artistic and inspiring design for creative professionals",
                "preview_image": "/images/themes/creative-studio.jpg",
                "color_schemes": [
                    {
                        "name": "Warm Creative",
                        "primary": "#F59E0B",
                        "secondary": "#D97706",
                        "accent": "#EF4444",
                        "background": "#FFFBEB",
                        "text": "#111827"
                    },
                    {
                        "name": "Cool Creative",
                        "primary": "#06B6D4",
                        "secondary": "#0891B2",
                        "accent": "#8B5CF6",
                        "background": "#F0FDFF",
                        "text": "#111827"
                    }
                ],
                "typography": {
                    "heading_font": "Poppins",
                    "body_font": "Open Sans",
                    "font_weights": ["400", "500", "600", "700"]
                },
                "layout_settings": {
                    "header_style": "creative_nav",
                    "footer_style": "minimal",
                    "button_style": "creative",
                    "card_style": "artistic"
                }
            },
            {
                "id": "professional_corporate",
                "name": "Professional Corporate",
                "description": "Sophisticated design for business-focused coworking",
                "preview_image": "/images/themes/professional-corporate.jpg",
                "color_schemes": [
                    {
                        "name": "Corporate Blue",
                        "primary": "#1E40AF",
                        "secondary": "#1E3A8A",
                        "accent": "#059669",
                        "background": "#F8FAFC",
                        "text": "#0F172A"
                    },
                    {
                        "name": "Executive Gray",
                        "primary": "#374151",
                        "secondary": "#111827",
                        "accent": "#DC2626",
                        "background": "#F9FAFB",
                        "text": "#111827"
                    }
                ],
                "typography": {
                    "heading_font": "Source Serif Pro",
                    "body_font": "Source Sans Pro",
                    "font_weights": ["400", "500", "600", "700"]
                },
                "layout_settings": {
                    "header_style": "corporate_nav",
                    "footer_style": "corporate",
                    "button_style": "professional",
                    "card_style": "corporate"
                }
            }
        ]
    
    # Page Templates for Coworking
    def get_coworking_page_templates(self) -> List[Dict[str, Any]]:
        """Get page templates specifically designed for coworking spaces"""
        return [
            {
                "id": "coworking_homepage",
                "name": "Coworking Homepage",
                "description": "Complete homepage showcasing community and memberships",
                "blocks": [
                    {"type": "coworking_hero", "order": 1},
                    {"type": "community_stats", "order": 2},
                    {"type": "membership_pricing", "order": 3},
                    {"type": "space_gallery", "order": 4},
                    {"type": "member_testimonials", "order": 5},
                    {"type": "community_events", "order": 6},
                    {"type": "cta_membership", "order": 7}
                ]
            },
            {
                "id": "membership_page",
                "name": "Membership Plans",
                "description": "Detailed membership options and benefits",
                "blocks": [
                    {"type": "page_header", "order": 1, "config": {"title": "Membership Plans"}},
                    {"type": "membership_pricing", "order": 2},
                    {"type": "amenities_grid", "order": 3},
                    {"type": "member_testimonials", "order": 4},
                    {"type": "cta_membership", "order": 5}
                ]
            },
            {
                "id": "community_page",
                "name": "Our Community",
                "description": "Showcase the vibrant coworking community",
                "blocks": [
                    {"type": "page_header", "order": 1, "config": {"title": "Our Community"}},
                    {"type": "community_stats", "order": 2},
                    {"type": "member_testimonials", "order": 3},
                    {"type": "community_events", "order": 4},
                    {"type": "cta_membership", "order": 5}
                ]
            },
            {
                "id": "spaces_page",
                "name": "Our Spaces",
                "description": "Detailed view of all available spaces",
                "blocks": [
                    {"type": "page_header", "order": 1, "config": {"title": "Our Spaces"}},
                    {"type": "space_gallery", "order": 2},
                    {"type": "amenities_grid", "order": 3},
                    {"type": "cta_membership", "order": 4}
                ]
            }
        ]
    
    # Content Block Rendering
    async def render_content_block(self, tenant_id: str, block_type: str, block_config: Dict[str, Any], 
                                 theme_config: Dict[str, Any]) -> Dict[str, Any]:
        """Render a content block with tenant-specific data and theme"""
        # Get block definition
        blocks = self.get_coworking_content_blocks()
        block_def = next((b for b in blocks if b["id"] == block_type), None)
        
        if not block_def:
            raise ValueError(f"Unknown block type: {block_type}")
        
        # Merge default config with custom config
        rendered_config = {}
        for field in block_def["customizable_fields"]:
            field_name = field["field"]
            rendered_config[field_name] = block_config.get(field_name, field.get("default"))
        
        # Apply theme styling
        theme_overrides = {}
        if theme_config and "color_scheme" in theme_config:
            colors = theme_config["color_scheme"]
            theme_overrides["colors"] = colors
        
        # For dynamic blocks, fetch real data
        if block_type == "community_events":
            events = await self.db.events.find({
                "tenant_id": tenant_id,
                "start_date": {"$gte": datetime.utcnow()}
            }).sort("start_date", 1).limit(rendered_config.get("events_count", 6)).to_list(None)
            rendered_config["events_data"] = events
        
        elif block_type == "community_stats":
            # Fetch real community statistics
            member_count = await self.db.users.count_documents({"tenant_id": tenant_id, "role": "member"})
            event_count = await self.db.events.count_documents({"tenant_id": tenant_id})
            rendered_config["stats_data"] = {
                "members": member_count,
                "events": event_count,
                "spaces": await self.db.resources.count_documents({"tenant_id": tenant_id})
            }
        
        return {
            "block_type": block_type,
            "config": rendered_config,
            "theme": theme_overrides,
            "html": await self._generate_block_html(block_type, rendered_config, theme_overrides)
        }
    
    async def _generate_block_html(self, block_type: str, config: Dict[str, Any], 
                                 theme: Dict[str, Any]) -> str:
        """Generate HTML for a content block"""
        # This would typically use a template engine like Jinja2
        # For now, return a placeholder that shows the structure
        colors = theme.get("colors", {})
        primary_color = colors.get("primary", "#3B82F6")
        
        if block_type == "coworking_hero":
            return f"""
            <section class="hero-section" style="background-color: {primary_color}">
                <div class="hero-content">
                    <h1>{config.get('title', 'Welcome')}</h1>
                    <p>{config.get('subtitle', 'Join our community')}</p>
                    <button class="cta-button">{config.get('cta_text', 'Get Started')}</button>
                </div>
            </section>
            """
        
        elif block_type == "membership_pricing":
            plans_html = ""
            for plan in config.get("plans", []):
                plans_html += f"""
                <div class="pricing-card">
                    <h3>{plan['name']}</h3>
                    <div class="price">${plan['price']}</div>
                    <div class="billing">{plan['billing']}</div>
                    <ul class="features">
                        {''.join(f'<li>{feature}</li>' for feature in plan.get('features', []))}
                    </ul>
                </div>
                """
            
            return f"""
            <section class="pricing-section">
                <h2>{config.get('title', 'Pricing')}</h2>
                <p>{config.get('subtitle', '')}</p>
                <div class="pricing-grid">
                    {plans_html}
                </div>
            </section>
            """
        
        # Add more block types as needed
        return f'<div class="content-block {block_type}">Block: {block_type}</div>'
    
    # Page Builder Integration
    async def save_page_builder_data(self, tenant_id: str, page_id: str, 
                                   blocks_data: List[Dict[str, Any]]) -> bool:
        """Save page builder configuration"""
        page_builder_doc = {
            "tenant_id": tenant_id,
            "page_id": page_id,
            "blocks": blocks_data,
            "updated_at": datetime.utcnow()
        }
        
        await self.db.page_builder_data.replace_one(
            {"tenant_id": tenant_id, "page_id": page_id},
            page_builder_doc,
            upsert=True
        )
        
        return True
    
    async def get_page_builder_data(self, tenant_id: str, page_id: str) -> Optional[Dict[str, Any]]:
        """Get page builder configuration for a page"""
        return await self.db.page_builder_data.find_one({
            "tenant_id": tenant_id, 
            "page_id": page_id
        })
    
    # Site Configuration Management
    async def get_site_config(self, tenant_id: str) -> Dict[str, Any]:
        """Get site-wide configuration (navigation, footer, etc.)"""
        config = await self.db.site_config.find_one(
            {"tenant_id": tenant_id},
            {"_id": 0}  # Exclude ObjectId to prevent serialization issues
        )
        
        if not config:
            # Return default configuration
            return self.get_default_site_config()
        
        return config
    
    async def save_site_config(self, tenant_id: str, config_data: Dict[str, Any]) -> bool:
        """Save site-wide configuration"""
        config_doc = {
            "tenant_id": tenant_id,
            "navigation": config_data.get("navigation", {}),
            "footer": config_data.get("footer", {}),
            "header": config_data.get("header", {}),
            "branding": config_data.get("branding", {}),
            "updated_at": datetime.utcnow()
        }
        
        await self.db.site_config.replace_one(
            {"tenant_id": tenant_id},
            config_doc,
            upsert=True
        )
        
        return True
    
    def get_default_site_config(self) -> Dict[str, Any]:
        """Get default site configuration for coworking spaces"""
        return {
            "navigation": {
                "show_navigation": True,
                "style": "horizontal",
                "position": "top",
                "menu_items": [
                    {"label": "Home", "url": "/", "type": "page"},
                    {"label": "Membership", "url": "/membership", "type": "page"},
                    {"label": "Our Spaces", "url": "/spaces", "type": "page"},
                    {"label": "Community", "url": "/community", "type": "page"},
                    {"label": "Events", "url": "/events", "type": "page"},
                    {"label": "Contact", "url": "/contact", "type": "page"}
                ]
            },
            "header": {
                "show_header": True,
                "show_login_button": True,
                "show_cta_button": True,
                "cta_text": "Join Today",
                "cta_url": "/membership",
                "style": "modern"
            },
            "footer": {
                "show_footer": True,
                "style": "detailed",
                "sections": [
                    {
                        "title": "Quick Links",
                        "links": [
                            {"label": "Membership Plans", "url": "/membership"},
                            {"label": "Tour Our Space", "url": "/tour"},
                            {"label": "Community Events", "url": "/events"},
                            {"label": "Member Directory", "url": "/directory"}
                        ]
                    },
                    {
                        "title": "Support",
                        "links": [
                            {"label": "Help Center", "url": "/help"},
                            {"label": "Contact Us", "url": "/contact"},
                            {"label": "Community Guidelines", "url": "/guidelines"},
                            {"label": "Terms of Service", "url": "/terms"}
                        ]
                    },
                    {
                        "title": "Connect",
                        "links": [
                            {"label": "Newsletter", "url": "/newsletter"},
                            {"label": "LinkedIn", "url": "#", "external": True},
                            {"label": "Twitter", "url": "#", "external": True},
                            {"label": "Instagram", "url": "#", "external": True}
                        ]
                    }
                ],
                "bottom_text": "© 2025 Downtown Coworking Hub. All rights reserved.",
                "show_social_links": True
            },
            "branding": {
                "logo_url": "/images/logos/coworking-logo.svg",
                "logo_alt": "Coworking Community",
                "favicon_url": "/images/favicon.ico"
            }
        }
    
    # Default Homepage Generator
    async def create_default_homepage(self, tenant_id: str) -> str:
        """Create a default homepage with premade template"""
        # Check if homepage already exists
        existing_homepage = await self.db.pages.find_one({
            "tenant_id": tenant_id,
            "is_homepage": True
        })
        
        if existing_homepage:
            return existing_homepage["id"]
        
        # Create default homepage
        page_id = str(datetime.utcnow().timestamp()).replace('.', '')
        homepage = {
            "id": page_id,
            "tenant_id": tenant_id,
            "title": "Welcome to Our Community",
            "slug": "home",
            "meta_title": "Coworking Space - Where Innovation Meets Community",
            "meta_description": "Join our vibrant coworking community with flexible memberships, premium amenities, and networking opportunities.",
            "status": "published",
            "is_homepage": True,
            "layout_settings": {
                "show_header": True,
                "show_navigation": True,
                "show_footer": True,
                "container_width": "full",
                "sidebar": None
            },
            "seo_settings": {
                "index": True,
                "follow": True,
                "sitemap": True
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await self.db.pages.insert_one(homepage)
        
        # Create default page builder data with coworking homepage template
        default_blocks = [
            {
                "id": f"block_{datetime.utcnow().timestamp()}_1",
                "type": "coworking_hero",
                "order": 1,
                "config": {
                    "title": "Where Innovation Meets Community",
                    "subtitle": "Join our vibrant coworking space and connect with like-minded professionals",
                    "cta_text": "Start Your Journey",
                    "cta_link": "/membership",
                    "background_image": "/images/coworking-hero.jpg"
                }
            },
            {
                "id": f"block_{datetime.utcnow().timestamp()}_2",
                "type": "community_stats",
                "order": 2,
                "config": {
                    "title": "Join Our Growing Community",
                    "stats": [
                        {"number": "500+", "label": "Active Members"},
                        {"number": "50+", "label": "Events Monthly"},
                        {"number": "24/7", "label": "Access"},
                        {"number": "99%", "label": "Satisfaction"}
                    ]
                }
            },
            {
                "id": f"block_{datetime.utcnow().timestamp()}_3",
                "type": "membership_pricing",
                "order": 3,
                "config": {
                    "title": "Flexible Membership Plans",
                    "subtitle": "Choose the plan that works best for your needs",
                    "plans": [
                        {
                            "name": "Day Pass",
                            "price": 25,
                            "billing": "per day",
                            "features": ["Access to open workspace", "High-speed WiFi", "Coffee & tea", "Community events"],
                            "is_popular": False
                        },
                        {
                            "name": "Hot Desk",
                            "price": 200,
                            "billing": "per month",
                            "features": ["Flexible seating", "24/7 access", "Meeting room credits", "Networking events", "Mail handling"],
                            "is_popular": True
                        },
                        {
                            "name": "Dedicated Desk",
                            "price": 350,
                            "billing": "per month",
                            "features": ["Your own desk", "Storage locker", "Priority booking", "Phone booth access", "Guest passes"],
                            "is_popular": False
                        }
                    ]
                }
            },
            {
                "id": f"block_{datetime.utcnow().timestamp()}_4",
                "type": "space_gallery",
                "order": 4,
                "config": {
                    "title": "Explore Our Spaces",
                    "spaces": [
                        {"name": "Open Workspace", "description": "Collaborative area perfect for networking and creativity", "capacity": 50},
                        {"name": "Private Offices", "description": "Quiet dedicated spaces for focused work", "capacity": 4},
                        {"name": "Meeting Rooms", "description": "Professional spaces equipped for presentations", "capacity": 12}
                    ]
                }
            },
            {
                "id": f"block_{datetime.utcnow().timestamp()}_5",
                "type": "member_testimonials",
                "order": 5,
                "config": {
                    "title": "What Our Members Say",
                    "testimonials": [
                        {
                            "quote": "This community has completely transformed how I work. The energy and collaboration opportunities are incredible!",
                            "author_name": "Sarah Johnson",
                            "author_title": "Freelance Designer",
                            "author_company": "Creative Studios",
                            "rating": 5
                        },
                        {
                            "quote": "Best decision I made for my startup. The networking alone has been worth every penny, plus the amenities are top-notch.",
                            "author_name": "Michael Chen",
                            "author_title": "Tech Entrepreneur",
                            "author_company": "InnovateTech",
                            "rating": 5
                        }
                    ]
                }
            },
            {
                "id": f"block_{datetime.utcnow().timestamp()}_6",
                "type": "cta_membership",
                "order": 6,
                "config": {
                    "title": "Ready to Join Our Community?",
                    "subtitle": "Start with a free day pass and experience what we're all about",
                    "primary_cta": "Get Free Day Pass",
                    "secondary_cta": "Schedule Tour"
                }
            }
        ]
        
        await self.save_page_builder_data(tenant_id, page_id, default_blocks)
        
        return page_id