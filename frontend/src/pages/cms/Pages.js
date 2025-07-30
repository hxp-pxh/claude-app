import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Globe, Edit, Trash2, Eye, Home, MoreHorizontal, Layers, Palette } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import api from '../../services/api';
import { format } from 'date-fns';

const Pages = () => {
  const { translateTerm, getColorScheme, getModuleInfo } = useTenant();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPageBuilder, setShowPageBuilder] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  
  const colorScheme = getColorScheme();
  const moduleInfo = getModuleInfo();
  
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

  const openPageBuilder = (page) => {
    setSelectedPage(page);
    setShowPageBuilder(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colorScheme.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colorScheme.text }}>
            {translateTerm('Website Pages')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {translateTerm('Manage your website content and pages for')} {moduleInfo.name}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/cms/pages/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm hover:opacity-90"
            style={{ backgroundColor: colorScheme.primary }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {translateTerm('New Page')}
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:border-blue-500"
              style={{ focusRingColor: colorScheme.primary, focusBorderColor: colorScheme.primary }}
              placeholder={translateTerm("Search pages...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPages.map((page) => (
          <div key={page.id} className="relative group bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
            {/* Page Preview */}
            <div className="aspect-w-16 aspect-h-10 bg-gray-100 rounded-t-lg overflow-hidden">
              <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Globe className="h-12 w-12 text-gray-400" />
              </div>
              {page.is_homepage && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Home className="h-3 w-3 mr-1" />
                    {translateTerm('Homepage')}
                  </span>
                </div>
              )}
              {page.status && (
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    page.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {translateTerm(page.status)}
                  </span>
                </div>
              )}
            </div>

            {/* Page Info */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {page.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    /{page.slug}
                  </p>
                  {page.updated_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {translateTerm('Updated')} {format(new Date(page.updated_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <div className="ml-2 flex-shrink-0">
                  <div className="relative inline-block text-left">
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Page Builder Button - Only for Coworking module */}
                  {moduleInfo.industry === 'coworking' && (
                    <button
                      onClick={() => openPageBuilder(page)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white hover:opacity-90"
                      style={{ backgroundColor: colorScheme.primary }}
                    >
                      <Layers className="h-3 w-3 mr-1" />
                      {translateTerm('Page Builder')}
                    </button>
                  )}
                  
                  <Link
                    to={`/cms/pages/${page.id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {translateTerm('Edit')}
                  </Link>
                </div>

                <div className="flex items-center space-x-1">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id, page.title)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? translateTerm('No pages found') : translateTerm('No pages yet')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? translateTerm('Try adjusting your search terms')
              : translateTerm('Get started by creating your first page')
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                to="/cms/pages/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm hover:opacity-90"
                style={{ backgroundColor: colorScheme.primary }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {translateTerm('Create Page')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Page Builder Modal */}
      {showPageBuilder && selectedPage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-full mx-4 my-4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-medium" style={{ color: colorScheme.text }}>
                  {translateTerm('Page Builder')} - {selectedPage.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {translateTerm('Drag and drop components to build your page')}
                </p>
              </div>
              <button
                onClick={() => setShowPageBuilder(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">{translateTerm('Close')}</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {/* Lazy load the page builder component */}
              <React.Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colorScheme.primary }}></div>
                </div>
              }>
                <CoworkingPageBuilder pageId={selectedPage.id} />
              </React.Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Lazy load the page builder
const CoworkingPageBuilder = React.lazy(() => import('../../components/cms/CoworkingPageBuilder'));

export default Pages;