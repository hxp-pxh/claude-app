import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, Building, Calendar, User } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

const LeadDetail = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => api.get(`/leads/${leadId}`).then(res => res.data)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/leads')}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lead.first_name} {lead.last_name}
          </h1>
          <p className="text-sm text-gray-600">Lead Details</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">{lead.email}</p>
            </div>
          </div>

          {lead.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-sm text-gray-600">{lead.phone}</p>
              </div>
            </div>
          )}

          {lead.company && (
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Company</p>
                <p className="text-sm text-gray-600">{lead.company}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Status</p>
              <p className="text-sm text-gray-600 capitalize">{lead.status.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Created</p>
              <p className="text-sm text-gray-600">
                {format(new Date(lead.created_at), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>

          {lead.source && (
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-blue-600 font-medium">S</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Source</p>
                <p className="text-sm text-gray-600">{lead.source}</p>
              </div>
            </div>
          )}
        </div>

        {lead.notes && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{lead.notes}</p>
          </div>
        )}

        {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Additional Information</h3>
            <div className="bg-gray-50 p-3 rounded">
              {Object.entries(lead.custom_fields).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {key.replace('_', ' ')}:
                  </span>
                  <span className="text-sm text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetail;