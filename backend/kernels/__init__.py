"""
Universal Kernels for Claude Platform
These kernels provide industry-agnostic core functionality
"""
from identity_kernel import IdentityKernel
from booking_kernel import BookingKernel  
from financial_kernel import FinancialKernel
from cms_kernel import CMSKernel
from communication_kernel import CommunicationKernel

__all__ = [
    'IdentityKernel',
    'BookingKernel', 
    'FinancialKernel',
    'CMSKernel',
    'CommunicationKernel'
]