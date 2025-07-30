import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Globe, Edit, Trash2, Eye, Home, MoreHorizontal, Layers, Palette, Settings, List, Grid, Wand2 } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import api from '../../services/api';
import { format } from 'date-fns';
import SiteConfigurationWidget from '../cms/SiteConfigurationWidget';

const Pages = () => {
  const { translateTerm, getColorScheme, getModuleInfo } = useTenant();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPageBuilder, setShowPageBuilder] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showSiteConfig, setShowSiteConfig] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
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

  const createDefaultHomepage = useMutation({
    mutationFn: () => api.post('/cms/create-default-homepage'),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['cms-pages']);
      alert(`Default homepage created successfully! Page ID: ${response.data.page_id}`);
    },
    onError: (error) => {
      console.error('Failed to create default homepage:', error);
      alert('Failed to create default homepage. Please try again.');
    }
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

  const hasHomepage = pages.some(page => page.is_homepage);

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
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-3">
          {/* Site Configuration Button */}
          <button
            onClick={() => setShowSiteConfig(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            {translateTerm('Site Config')}
          </button>

          {/* Create Default Homepage Button */}
          {!hasHomepage && (
            <button
              onClick={() => createDefaultHomepage.mutate()}
              disabled={createDefaultHomepage.isLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: colorScheme.secondary }}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {createDefaultHomepage.isLoading ? 'Creating...' : 'Create Homepage'}
            </button>
          )}

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

      {/* Search and View Controls */}
      <div className="flex items-center justify-between">
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

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Pages Grid/List View */}
      {viewMode === 'grid' ? (
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
                {page.layout_settings && (
                  <div className="absolute bottom-2 left-2">
                    <div className="flex items-center space-x-1">
                      {page.layout_settings.show_header && (
                        <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-blue-100 text-blue-800">H</span>
                      )}
                      {page.layout_settings.show_navigation && (
                        <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-purple-100 text-purple-800">N</span>
                      )}
                      {page.layout_settings.show_footer && (
                        <span className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-orange-100 text-orange-800">F</span>
                      )}
                    </div>
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
      ) : (
        /* List View */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900">{page.title}</div>
                          {page.is_homepage && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Home className="h-3 w-3 mr-1" />
                              Homepage
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">/{page.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      page.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {translateTerm(page.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {page.layout_settings && (
                      <div className="flex items-center space-x-1">
                        {page.layout_settings.show_header && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">Header</span>
                        )}
                        {page.layout_settings.show_navigation && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">Nav</span>
                        )}
                        {page.layout_settings.show_footer && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">Footer</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.updated_at && format(new Date(page.updated_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {moduleInfo.industry === 'coworking' && (
                        <button
                          onClick={() => openPageBuilder(page)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Layers className="h-4 w-4" />
                        </button>
                      )}
                      <Link to={`/cms/pages/${page.id}/edit`} className="text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id, page.title)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredPages.length === 0 && (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? translateTerm('No pages found') : translateTerm('No pages yet')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? translateTerm('Try adjusting your search terms')
              : translateTerm('Get started by creating your first page or using our homepage template')
            }
          </p>
          {!searchTerm && (
            <div className="mt-6 flex items-center justify-center space-x-4">
              {!hasHomepage && (
                <button
                  onClick={() => createDefaultHomepage.mutate()}
                  disabled={createDefaultHomepage.isLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colorScheme.secondary }}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {createDefaultHomepage.isLoading ? 'Creating...' : 'Create Homepage'}
                </button>
              )}
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

      {/* Site Configuration Widget */}
      <SiteConfigurationWidget 
        isOpen={showSiteConfig}
        onClose={() => setShowSiteConfig(false)}
      />
    </div>
  );
};

// Lazy load the page builder
const CoworkingPageBuilder = React.lazy(() => import('../../components/cms/CoworkingPageBuilder'));

export default Pages;