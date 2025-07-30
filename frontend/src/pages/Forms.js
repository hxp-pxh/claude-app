import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  BarChart3,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

const Forms = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: forms = [], isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: () => api.get('/forms').then(res => res.data)
  });

  const deleteForm = useMutation({
    mutationFn: (formId) => api.delete(`/forms/${formId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['forms']);
    },
  });

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (formId, formName) => {
    if (window.confirm(`Are you sure you want to delete "${formName}"?`)) {
      deleteForm.mutate(formId);
    }
  };

  const copyEmbedCode = (formId) => {
    const embedCode = `<iframe src="${window.location.origin}/embed/form/${formId}" width="100%" height="400" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage lead capture forms
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/forms/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredForms.map((form) => (
          <div key={form.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {form.title}
                    </h3>
                    <p className="text-sm text-gray-500">{form.name}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  form.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {form.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fields:</span>
                  <span className="font-medium">{form.fields?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">
                    {format(new Date(form.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Submissions:</span>
                  <span className="font-medium">0</span>
                </div>
              </div>

              {form.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {form.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyEmbedCode(form.id)}
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Copy embed code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  
                  <Link
                    to={`/forms/${form.id}/analytics`}
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="View analytics"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Link>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/forms/${form.id}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>

                  <Link
                    to={`/forms/${form.id}/edit`}
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(form.id, form.name)}
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm leading-4 font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No forms found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'No forms match your search criteria.'
              : 'Get started by creating your first form.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                to="/forms/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Form Statistics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{forms.length}</div>
            <div className="text-sm text-gray-500">Total Forms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {forms.filter(f => f.is_active).length}
            </div>
            <div className="text-sm text-gray-500">Active Forms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-500">Total Submissions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {forms.reduce((acc, form) => acc + (form.fields?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Total Fields</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forms;