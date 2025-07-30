"""
Industry-specific modules for Claude Platform
These modules orchestrate kernel functionality for specific industries
"""
from base_module import BaseModule
from coworking_module import CoworkingModule
from government_module import GovernmentModule
from hotel_module import HotelModule

__all__ = [
    'BaseModule',
    'CoworkingModule',
    'GovernmentModule',
    'HotelModule'
]