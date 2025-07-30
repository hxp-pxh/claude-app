import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Globe, Edit, Trash2, Eye, Home, MoreHorizontal } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const Pages = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: () => api.get('/cms/pages').then(res => res.data)
  });

  const deletePage = useMutation({
    mutationFn: (pageId) => api.delete(`/cms/pages/${pageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['cms-pages']);
    },
  });

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (pageId, pageTitle) => {
    if (window.confirm(`Are you sure you want to delete "${pageTitle}"?`)) {
      deletePage.mutate(pageId);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Website Pages</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your website content and pages
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/cms/pages/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Page
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
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Pages List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredPages.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredPages.map((page) => (
              <li key={page.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {page.is_homepage ? (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Home className="h-5 w-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {page.title}
                        </p>
                        {page.is_homepage && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Homepage
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          page.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : page.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {page.status}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-500 space-x-4">
                        <span>/{page.slug}</span>
                        <span>•</span>
                        <span>Updated {format(new Date(page.updated_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/public/demo/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    
                    <Link
                      to={`/cms/pages/${page.id}/edit`}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>

                    {!page.is_homepage && (
                      <button
                        onClick={() => handleDelete(page.id, page.title)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm leading-4 font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'No pages match your search criteria.'
                : 'Get started by creating your first page.'
              }
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  to="/cms/pages/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Page
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Website Statistics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pages.length}</div>
            <div className="text-sm text-gray-500">Total Pages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {pages.filter(p => p.status === 'published').length}
            </div>
            <div className="text-sm text-gray-500">Published</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pages.filter(p => p.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-500">Drafts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {pages.reduce((acc, p) => acc + (p.content_blocks?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Total Blocks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pages;