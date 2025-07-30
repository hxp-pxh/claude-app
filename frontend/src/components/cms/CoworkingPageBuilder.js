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
  BarChart3
} from 'lucide-react';

const CoworkingPageBuilder = ({ pageId, initialBlocks = [] }) => {
  const { getColorScheme, translateTerm } = useTenant();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [editingBlock, setEditingBlock] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Load available blocks and themes
  useEffect(() => {
    loadAvailableBlocks();
    loadAvailableThemes();
  }, []);

  const loadAvailableBlocks = async () => {
    try {
      const response = await api.get('/cms/coworking/blocks');
      setAvailableBlocks(response.data);
    } catch (error) {
      console.error('Failed to load blocks:', error);
    }
  };

  const loadAvailableThemes = async () => {
    try {
      const response = await api.get('/cms/coworking/themes');
      setAvailableThemes(response.data);
      if (response.data.length > 0) {
        setSelectedTheme(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
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
    const config = {};
    blockType.customizable_fields?.forEach(field => {
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

  // Save page
  const savePage = async () => {
    setSaving(true);
    try {
      await api.post(`/cms/pages/${pageId}/builder`, {
        blocks: blocks,
        theme: selectedTheme
      });
      // Show success message
    } catch (error) {
      console.error('Failed to save page:', error);
      // Show error message
    } finally {
      setSaving(false);
    }
  };

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
              className="flex items-center px-6 py-2 text-white rounded-lg font-medium"
              style={{ backgroundColor: colorScheme.primary }}
            >
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
              <h3 className="text-lg font-semibold mb-4" style={{ color: colorScheme.text }}>
                Content Blocks
              </h3>
              
              <Droppable droppableId="available-blocks" isDropDisabled>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {availableBlocks.map((block, index) => {
                      const IconComponent = blockIcons[block.id] || Layout;
                      return (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <IconComponent className="h-5 w-5" style={{ color: colorScheme.primary }} />
                                <div>
                                  <h4 className="font-medium text-gray-900">{block.name}</h4>
                                  <p className="text-sm text-gray-600">{block.description}</p>
                                </div>
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

              {/* Theme Selector */}
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
            </div>

            {/* Main Canvas */}
            <div className="flex-1 p-6">
              <DragDropContext onDragEnd={handleDragEnd}>
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
                          <p className="text-gray-600">
                            Drag content blocks from the sidebar to create your coworking space website
                          </p>
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
                                      <h4 className="font-medium text-gray-900">{blockDef?.name}</h4>
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
              </DragDropContext>
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

// Block Preview Component
const BlockPreview = ({ blockType, config, theme, fullWidth = false }) => {
  const getPreviewContent = () => {
    switch (blockType) {
      case 'coworking_hero':
        return (
          <div className={`text-center py-12 ${fullWidth ? 'bg-blue-600 text-white' : 'bg-blue-100'}`}>
            <h1 className="text-3xl font-bold mb-4">{config.title || 'Hero Title'}</h1>
            <p className="text-lg mb-6">{config.subtitle || 'Hero subtitle'}</p>
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium">
              {config.cta_text || 'Call to Action'}
            </button>
          </div>
        );
      
      case 'membership_pricing':
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold text-center mb-8">{config.title || 'Membership Plans'}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {(config.plans || [{ name: 'Hot Desk', price: 25, billing: 'per day' }]).map((plan, idx) => (
                <div key={idx} className="border rounded-lg p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-4">${plan.price}</div>
                  <div className="text-gray-600">{plan.billing}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'space_gallery':
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold text-center mb-8">{config.title || 'Our Spaces'}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(idx => (
                <div key={idx} className="border rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <h3 className="font-medium">Space {idx}</h3>
                    <p className="text-gray-600 text-sm">Beautiful workspace</p>
                  </div>
                </div>
              ))}
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

// Block Editor Modal Component
const BlockEditor = ({ block, blockDefinition, onSave, onCancel }) => {
  const [config, setConfig] = useState(block.config);

  const handleFieldChange = (fieldName, value) => {
    setConfig(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Edit {blockDefinition?.name}</h2>
          <p className="text-gray-600 mt-1">{blockDefinition?.description}</p>
        </div>
        
        <div className="p-6 space-y-4">
          {blockDefinition?.customizable_fields?.map((field) => (
            <div key={field.field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.field.replace('_', ' ').toUpperCase()}
              </label>
              
              {field.type === 'text' && (
                <input
                  type="text"
                  value={config[field.field] || ''}
                  onChange={(e) => handleFieldChange(field.field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              
              {field.type === 'textarea' && (
                <textarea
                  rows={3}
                  value={config[field.field] || ''}
                  onChange={(e) => handleFieldChange(field.field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              
              {field.type === 'select' && (
                <select
                  value={config[field.field] || ''}
                  onChange={(e) => handleFieldChange(field.field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {field.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
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