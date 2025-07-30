import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Plus, 
  Move, 
  Trash2, 
  Settings,
  Type,
  Image,
  Layout
} from 'lucide-react';
import api from '../../services/api';

const PageEditor = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!pageId;

  const [page, setPage] = useState({
    title: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    content_blocks: [],
    status: 'draft',
    is_homepage: false
  });

  const [activeBlock, setActiveBlock] = useState(null);

  // Fetch existing page if editing
  const { data: existingPage, isLoading } = useQuery({
    queryKey: ['cms-page', pageId],
    queryFn: () => api.get(`/cms/pages/${pageId}`).then(res => res.data),
    enabled: isEditing
  });

  useEffect(() => {
    if (existingPage) {
      setPage(existingPage);
    }
  }, [existingPage]);

  const savePage = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return api.put(`/cms/pages/${pageId}`, data);
      } else {
        return api.post('/cms/pages', data);
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(['cms-pages']);
      if (!isEditing) {
        navigate(`/cms/pages/${response.data.id}/edit`);
      }
    },
  });

  const handleSave = () => {
    savePage.mutate(page);
  };

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      config: getDefaultBlockConfig(type)
    };
    
    setPage(prev => ({
      ...prev,
      content_blocks: [...prev.content_blocks, newBlock]
    }));
  };

  const updateBlock = (blockId, config) => {
    setPage(prev => ({
      ...prev,
      content_blocks: prev.content_blocks.map(block =>
        block.id === blockId ? { ...block, config } : block
      )
    }));
  };

  const deleteBlock = (blockId) => {
    setPage(prev => ({
      ...prev,
      content_blocks: prev.content_blocks.filter(block => block.id !== blockId)
    }));
  };

  const moveBlock = (blockId, direction) => {
    const blockIndex = page.content_blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= page.content_blocks.length) return;

    const newBlocks = [...page.content_blocks];
    [newBlocks[blockIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[blockIndex]];

    setPage(prev => ({
      ...prev,
      content_blocks: newBlocks
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/cms/pages')}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Page' : 'Create New Page'}
            </h1>
            <p className="text-sm text-gray-600">
              {page.title || 'Untitled Page'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
          
          <button
            onClick={handleSave}
            disabled={savePage.isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {savePage.isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Page Settings & Block Library */}
        <div className="lg:col-span-1 space-y-6">
          {/* Page Settings */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Page Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => setPage(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter page title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={page.slug}
                  onChange={(e) => setPage(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="page-url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={page.status}
                  onChange={(e) => setPage(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_homepage"
                  checked={page.is_homepage}
                  onChange={(e) => setPage(prev => ({ ...prev, is_homepage: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_homepage" className="ml-2 block text-sm text-gray-900">
                  Set as homepage
                </label>
              </div>
            </div>
          </div>

          {/* Block Library */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Content Block</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => addBlock('hero_banner')}
                className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Layout className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Hero Banner</p>
                  <p className="text-xs text-gray-500">Large banner with title and CTA</p>
                </div>
              </button>

              <button
                onClick={() => addBlock('text_block')}
                className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Type className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Text Block</p>
                  <p className="text-xs text-gray-500">Rich text content</p>
                </div>
              </button>

              <button
                onClick={() => addBlock('image_gallery')}
                className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Image className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Image Gallery</p>
                  <p className="text-xs text-gray-500">Showcase multiple images</p>
                </div>
              </button>

              <button
                onClick={() => addBlock('pricing_cards')}
                className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Layout className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pricing Cards</p>
                  <p className="text-xs text-gray-500">Display pricing plans</p>
                </div>
              </button>

              <button
                onClick={() => addBlock('lead_form')}
                className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Layout className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Contact Form</p>
                  <p className="text-xs text-gray-500">Lead capture form</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg min-h-screen">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Page Content</h2>
              
              {page.content_blocks.length > 0 ? (
                <div className="space-y-4">
                  {page.content_blocks.map((block, index) => (
                    <ContentBlock
                      key={block.id}
                      block={block}
                      isActive={activeBlock === block.id}
                      onSelect={() => setActiveBlock(block.id)}
                      onUpdate={(config) => updateBlock(block.id, config)}
                      onDelete={() => deleteBlock(block.id)}
                      onMoveUp={() => moveBlock(block.id, 'up')}
                      onMoveDown={() => moveBlock(block.id, 'down')}
                      canMoveUp={index > 0}
                      canMoveDown={index < page.content_blocks.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Layout className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No content blocks</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first content block from the sidebar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Block Component
const ContentBlock = ({ 
  block, 
  isActive, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  canMoveUp,
  canMoveDown 
}) => {
  const renderBlockPreview = () => {
    switch (block.type) {
      case 'hero_banner':
        return (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-2">
              {block.config.title || 'Hero Title'}
            </h2>
            <p className="text-xl mb-4">
              {block.config.subtitle || 'Hero subtitle text'}
            </p>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium">
              {block.config.cta_text || 'Call to Action'}
            </button>
          </div>
        );
      
      case 'text_block':
        return (
          <div className="prose prose-sm">
            <div dangerouslySetInnerHTML={{ 
              __html: block.config.content || '<p>Your text content will appear here...</p>' 
            }} />
          </div>
        );
      
      default:
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">
              {block.type.replace('_', ' ').toUpperCase()} Block
            </p>
          </div>
        );
    }
  };

  const renderBlockEditor = () => {
    if (!isActive) return null;

    switch (block.type) {
      case 'hero_banner':
        return (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Hero Banner Settings</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Hero title"
                value={block.config.title || ''}
                onChange={(e) => onUpdate({ ...block.config, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={block.config.subtitle || ''}
                onChange={(e) => onUpdate({ ...block.config, subtitle: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Button text"
                value={block.config.cta_text || ''}
                onChange={(e) => onUpdate({ ...block.config, cta_text: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        );
      
      case 'text_block':
        return (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Text Content</h4>
            <textarea
              placeholder="Enter your content..."
              value={block.config.content || ''}
              onChange={(e) => onUpdate({ ...block.config, content: e.target.value })}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        );
      
      default:
        return (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500">
              Configuration for {block.type} will be available soon.
            </p>
          </div>
        );
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 capitalize">
          {block.type.replace('_', ' ')}
        </h3>
        <div className="flex items-center space-x-1">
          {canMoveUp && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Move className="h-4 w-4 rotate-180" />
            </button>
          )}
          {canMoveDown && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Move className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {renderBlockPreview()}
      {renderBlockEditor()}
    </div>
  );
};

const getDefaultBlockConfig = (type) => {
  switch (type) {
    case 'hero_banner':
      return {
        title: 'Welcome to Our Space',
        subtitle: 'Discover the perfect workspace for your needs',
        cta_text: 'Get Started',
        cta_link: '/contact'
      };
    case 'text_block':
      return {
        content: '<p>Add your content here...</p>'
      };
    case 'pricing_cards':
      return {
        title: 'Choose Your Plan',
        plans: []
      };
    default:
      return {};
  }
};

export default PageEditor;