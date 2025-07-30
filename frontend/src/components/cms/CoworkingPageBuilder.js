import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTenant } from '../../contexts/TenantContext';
import api from '../../services/api';
import {
  Plus,
  Move,
  Edit,
  Trash2,
  Eye,
  Settings,
  Palette,
  Layout,
  Type,
  Image as ImageIcon,
  Users,
  Calendar,
  Star,
  Target,
  BarChart3,
  Save,
  RefreshCw
} from 'lucide-react';

const CoworkingPageBuilder = ({ pageId, initialBlocks = [] }) => {
  const { getColorScheme, translateTerm } = useTenant();
  const [blocks, setBlocks] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [pageTemplates, setPageTemplates] = useState([]);
  const [editingBlock, setEditingBlock] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colorScheme = getColorScheme();

  // Block icons mapping
  const blockIcons = {
    'coworking_hero': Target,
    'membership_pricing': BarChart3,
    'member_testimonials': Star,
    'space_gallery': ImageIcon,
    'community_events': Calendar,
    'amenities_grid': Layout,
    'community_stats': Users,
    'cta_membership': Target
  };

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, [pageId]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadAvailableBlocks(),
        loadAvailableThemes(),
        loadPageTemplates(),
        loadExistingPageData()
      ]);
    } catch (err) {
      console.error('Failed to load CMS data:', err);
      setError('Failed to load page builder data. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableBlocks = async () => {
    try {
      const response = await api.get('/cms/coworking/blocks');
      const blocks = response.data.blocks || response.data;
      setAvailableBlocks(Array.isArray(blocks) ? blocks : []);
    } catch (error) {
      console.error('Failed to load blocks:', error);
      throw error;
    }
  };

  const loadAvailableThemes = async () => {
    try {
      const response = await api.get('/cms/coworking/themes');
      const themes = response.data.themes || response.data;
      const themesArray = Array.isArray(themes) ? themes : [];
      setAvailableThemes(themesArray);
      
      if (themesArray.length > 0 && !selectedTheme) {
        setSelectedTheme(themesArray[0]);
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
      throw error;
    }
  };

  const loadPageTemplates = async () => {
    try {
      const response = await api.get('/cms/coworking/page-templates');
      const templates = response.data.templates || response.data;
      setPageTemplates(Array.isArray(templates) ? templates : []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      throw error;
    }
  };

  const loadExistingPageData = async () => {
    if (!pageId) return;
    
    try {
      const response = await api.get(`/cms/pages/${pageId}/builder`);
      const pageData = response.data;
      
      if (pageData && pageData.blocks) {
        setBlocks(pageData.blocks);
      }
    } catch (error) {
      // If no builder data exists yet, that's fine - start with empty blocks
      console.log('No existing page builder data found');
    }
  };

  // Drag and drop handlers
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    if (result.source.droppableId === 'available-blocks' && result.destination.droppableId === 'page-blocks') {
      // Adding new block to page
      const blockType = availableBlocks[result.source.index];
      const newBlock = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: blockType.id,
        config: getDefaultBlockConfig(blockType),
        order: result.destination.index
      };
      
      const newBlocks = [...blocks];
      newBlocks.splice(result.destination.index, 0, newBlock);
      setBlocks(newBlocks);
    } else if (result.source.droppableId === 'page-blocks' && result.destination.droppableId === 'page-blocks') {
      // Reordering blocks
      const newBlocks = Array.from(blocks);
      const [reorderedBlock] = newBlocks.splice(result.source.index, 1);
      newBlocks.splice(result.destination.index, 0, reorderedBlock);
      setBlocks(newBlocks);
    }
  };

  const getDefaultBlockConfig = (blockType) => {
    if (!blockType || !blockType.customizable_fields) return {};
    
    const config = {};
    blockType.customizable_fields.forEach(field => {
      config[field.field] = field.default || '';
    });
    return config;
  };

  // Block management
  const removeBlock = (blockId) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
  };

  const editBlock = (block) => {
    setEditingBlock(block);
  };

  const saveBlockConfig = (blockId, newConfig) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, config: newConfig }
        : block
    ));
    setEditingBlock(null);
  };

  // Apply template
  const applyTemplate = (template) => {
    const templateBlocks = template.blocks.map((templateBlock, index) => ({
      id: `block_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      type: templateBlock.type,
      config: templateBlock.config || getDefaultBlockConfig(
        availableBlocks.find(b => b.id === templateBlock.type)
      ),
      order: templateBlock.order || index
    }));
    
    setBlocks(templateBlocks);
  };

  // Save page
  const savePage = async () => {
    setSaving(true);
    try {
      await api.post(`/cms/pages/${pageId}/builder`, {
        blocks: blocks,
        theme: selectedTheme
      });
      
      // Show success message (you could use a toast library here)
      alert('Page saved successfully!');
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: colorScheme.primary }} />
          <p className="text-gray-600">Loading page builder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAllData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="coworking-page-builder min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colorScheme.text }}>
              {translateTerm('Page Builder')}
            </h1>
            <p className="text-gray-600 mt-1">Create beautiful coworking space pages</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={savePage}
              disabled={saving}
              className="flex items-center px-6 py-2 text-white rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: colorScheme.primary }}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {!previewMode && (
          <>
            {/* Sidebar - Available Blocks */}
            <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
              {/* Page Templates */}
              {pageTemplates.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: colorScheme.text }}>
                    Quick Start Templates
                  </h3>
                  <div className="space-y-2">
                    {pageTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300"
                      >
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {template.blocks?.length || 0} blocks
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Blocks */}
              <h3 className="text-lg font-semibold mb-4" style={{ color: colorScheme.text }}>
                Content Blocks
              </h3>
              
              {/* Temporarily disable drag-and-drop to fix React context issue */}
              <div className="space-y-3">
                {availableBlocks.map((block, index) => {
                  const IconComponent = blockIcons[block.id] || Layout;
                  return (
                    <div
                      key={block.id}
                      onClick={() => {
                        // Add block to canvas when clicked
                        const newBlock = {
                          id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                          type: block.id,
                          config: getDefaultBlockConfig(block),
                          order: blocks.length
                        };
                        setBlocks([...blocks, newBlock]);
                      }}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-5 w-5" style={{ color: colorScheme.primary }} />
                        <div>
                          <h4 className="font-medium text-gray-900">{block.name}</h4>
                          <p className="text-sm text-gray-600">{block.description}</p>
                          <p className="text-xs text-blue-600 mt-1">Click to add to page</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Theme Selector */}
              {availableThemes.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: colorScheme.text }}>
                    Theme
                  </h3>
                  <div className="space-y-3">
                    {availableThemes.map((theme) => (
                      <div
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedTheme?.id === theme.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Palette className="h-4 w-4" />
                          <div>
                            <h4 className="font-medium">{theme.name}</h4>
                            <p className="text-sm text-gray-600">{theme.description}</p>
                          </div>
                        </div>
                        {theme.color_schemes && (
                          <div className="flex space-x-2 mt-2">
                            {theme.color_schemes.slice(0, 3).map((colorScheme, idx) => (
                              <div
                                key={idx}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: colorScheme.primary }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Canvas */}
            <div className="flex-1 p-6">
              <Droppable droppableId="page-blocks">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-96 space-y-4"
                  >
                    {blocks.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <Layout className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Start Building Your Page
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Drag content blocks from the sidebar to create your coworking space website
                        </p>
                        {pageTemplates.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Or choose a template to get started quickly
                          </p>
                        )}
                      </div>
                    )}

                    {blocks.map((block, index) => {
                      const blockDef = availableBlocks.find(b => b.id === block.type);
                      const IconComponent = blockIcons[block.type] || Layout;
                      
                      return (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white border border-gray-200 rounded-lg p-6 group relative ${
                                snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                              } transition-shadow`}
                            >
                              {/* Block Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-move p-1 rounded hover:bg-gray-100"
                                  >
                                    <Move className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <IconComponent className="h-5 w-5" style={{ color: colorScheme.primary }} />
                                  <div>
                                    <h4 className="font-medium text-gray-900">{blockDef?.name || block.type}</h4>
                                    <p className="text-sm text-gray-600">{blockDef?.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => editBlock(block)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => removeBlock(block.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Block Preview */}
                              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                <BlockPreview
                                  blockType={block.type}
                                  config={block.config}
                                  theme={selectedTheme}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </>
        )}

        {/* Preview Mode */}
        {previewMode && (
          <div className="flex-1 bg-white">
            <div className="max-w-6xl mx-auto">
              {blocks.map((block) => (
                <BlockPreview
                  key={block.id}
                  blockType={block.type}
                  config={block.config}
                  theme={selectedTheme}
                  fullWidth
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Block Editor Modal */}
      {editingBlock && (
        <BlockEditor
          block={editingBlock}
          blockDefinition={availableBlocks.find(b => b.id === editingBlock.type)}
          onSave={(config) => saveBlockConfig(editingBlock.id, config)}
          onCancel={() => setEditingBlock(null)}
        />
      )}
    </div>
  );
};

// Enhanced Block Preview Component
const BlockPreview = ({ blockType, config, theme, fullWidth = false }) => {
  const getPreviewContent = () => {
    switch (blockType) {
      case 'coworking_hero':
        return (
          <div className={`text-center py-12 ${fullWidth ? 'bg-blue-600 text-white' : 'bg-blue-100'}`}>
            <h1 className="text-3xl font-bold mb-4">{config.title || 'Where Innovation Meets Community'}</h1>
            <p className="text-lg mb-6">{config.subtitle || 'Join our vibrant coworking community'}</p>
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium">
              {config.cta_text || 'Tour Our Space'}
            </button>
          </div>
        );
      
      case 'membership_pricing':
        const plans = config.plans || [
          { name: 'Hot Desk', price: 25, billing: 'per day', features: ['Access to all spaces', 'Community events', 'Fast WiFi'] },
          { name: 'Dedicated Desk', price: 200, billing: 'per month', features: ['Your own desk', 'Storage', '24/7 access'], is_popular: true },
          { name: 'Private Office', price: 500, billing: 'per month', features: ['Private space', 'Meeting room access', 'Phone booth'] }
        ];
        
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold text-center mb-8">{config.title || 'Choose Your Membership'}</h2>
            <p className="text-center text-gray-600 mb-8">{config.subtitle || 'Flexible plans for every type of professional'}</p>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => (
                <div key={idx} className={`border rounded-lg p-6 text-center relative ${
                  plan.is_popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Popular</span>
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-2">${plan.price}</div>
                  <div className="text-gray-600 mb-4">{plan.billing}</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {plan.features?.map((feature, fidx) => (
                      <li key={fidx}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'member_testimonials':
        const testimonials = config.testimonials || [
          { quote: "This community has transformed how I work. The energy is incredible!", author_name: "Sarah Johnson", author_title: "Freelance Designer", rating: 5 },
          { quote: "Best decision for my startup. Met amazing people and grew my network.", author_name: "Mike Chen", author_title: "Tech Entrepreneur", rating: 5 }
        ];
        
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold text-center mb-8">{config.title || 'What Our Members Say'}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-medium">{testimonial.author_name}</p>
                    <p className="text-sm text-gray-500">{testimonial.author_title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'space_gallery':
        const spaces = config.spaces || [
          { name: 'Open Workspace', description: 'Collaborative area perfect for networking', capacity: 50 },
          { name: 'Private Offices', description: 'Quiet spaces for focused work', capacity: 4 },
          { name: 'Meeting Rooms', description: 'Professional spaces for client meetings', capacity: 8 }
        ];
        
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold text-center mb-8">{config.title || 'Explore Our Spaces'}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {spaces.map((space, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{space.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{space.description}</p>
                    {space.capacity && (
                      <p className="text-xs text-gray-500">Capacity: {space.capacity} people</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'community_events':
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold text-center mb-8">{config.title || 'Upcoming Events'}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">15</div>
                      <div className="text-sm text-gray-500">MAR</div>
                    </div>
                    <div>
                      <h3 className="font-medium">Networking Breakfast</h3>
                      <p className="text-sm text-gray-600">Connect with fellow entrepreneurs</p>
                      <p className="text-xs text-gray-500 mt-2">9:00 AM - 10:30 AM</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'amenities_grid':
        const amenities = config.amenities || [
          { name: 'High-Speed WiFi', description: 'Enterprise-grade internet', icon: 'wifi' },
          { name: 'Coffee Bar', description: 'Unlimited premium coffee', icon: 'coffee' },
          { name: 'Meeting Rooms', description: 'Bookable conference spaces', icon: 'users' },
          { name: 'Printing Services', description: 'Color and B&W printing', icon: 'printer' }
        ];
        
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold text-center mb-8">{config.title || 'Member Amenities'}</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {amenities.map((amenity, idx) => (
                <div key={idx} className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Layout className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-2">{amenity.name}</h3>
                  <p className="text-sm text-gray-600">{amenity.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'community_stats':
        const stats = config.stats || [
          { number: '500+', label: 'Active Members' },
          { number: '50+', label: 'Events Monthly' },
          { number: '24/7', label: 'Access' },
          { number: '99%', label: 'Satisfaction' }
        ];
        
        return (
          <div className="py-8 bg-gray-50">
            <h2 className="text-2xl font-bold text-center mb-8">{config.title || 'Our Growing Community'}</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cta_membership':
        return (
          <div className="py-12 bg-blue-600 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">{config.title || 'Ready to Join Our Community?'}</h2>
            <p className="text-xl mb-8">{config.subtitle || 'Start your journey with a free day pass'}</p>
            <div className="space-x-4">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium">
                {config.primary_cta || 'Get Day Pass'}
              </button>
              <button className="px-6 py-3 border border-white text-white rounded-lg font-medium">
                {config.secondary_cta || 'Schedule Tour'}
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="py-8 text-center">
            <h3 className="font-medium text-gray-900 mb-2">{blockType.replace('_', ' ').toUpperCase()}</h3>
            <p className="text-gray-600">Block preview will render here</p>
          </div>
        );
    }
  };

  return <div className={fullWidth ? 'w-full' : ''}>{getPreviewContent()}</div>;
};

// Enhanced Block Editor Modal Component
const BlockEditor = ({ block, blockDefinition, onSave, onCancel }) => {
  const [config, setConfig] = useState(block.config || {});

  const handleFieldChange = (fieldName, value) => {
    setConfig(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleRepeaterChange = (fieldName, items) => {
    setConfig(prev => ({
      ...prev,
      [fieldName]: items
    }));
  };

  const handleSave = () => {
    onSave(config);
  };

  const renderField = (field) => {
    const value = config[field.field] || field.default || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.default}
          />
        );

      case 'textarea':
        return (
          <textarea
            rows={4}
            value={value}
            onChange={(e) => handleFieldChange(field.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.default}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            min={field.min}
            max={field.max}
            onChange={(e) => handleFieldChange(field.field, parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.field, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Enable this option</span>
          </label>
        );

      case 'repeater':
        // Simple repeater implementation for plans, testimonials, etc.
        const items = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = items.filter((_, i) => i !== index);
                      handleFieldChange(field.field, newItems);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {field.fields?.map(subField => (
                  <div key={subField.field} className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {subField.field.replace('_', ' ').toUpperCase()}
                    </label>
                    <input
                      type={subField.type === 'number' ? 'number' : 'text'}
                      value={item[subField.field] || ''}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index] = {
                          ...newItems[index],
                          [subField.field]: subField.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
                        };
                        handleFieldChange(field.field, newItems);
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder={subField.default}
                    />
                  </div>
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newItem = {};
                field.fields?.forEach(subField => {
                  newItem[subField.field] = subField.default || '';
                });
                handleFieldChange(field.field, [...items, newItem]);
              }}
              className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Item
            </button>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Edit {blockDefinition?.name || block.type}</h2>
          <p className="text-gray-600 mt-1">{blockDefinition?.description}</p>
        </div>
        
        <div className="p-6 space-y-6">
          {blockDefinition?.customizable_fields?.map((field) => (
            <div key={field.field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.field.replace('_', ' ').toUpperCase()}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {field.optional && <span className="text-gray-400 ml-1">(optional)</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoworkingPageBuilder;