import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import api from '../../services/api';
import {
  Settings,
  Navigation,
  Layout,
  Eye,
  Save,
  Plus,
  Trash2,
  Move,
  Monitor,
  Smartphone,
  Tablet,
  Link,
  Type,
  Palette,
  Image as ImageIcon
} from 'lucide-react';

const SiteConfigurationWidget = ({ isOpen, onClose }) => {
  const { getColorScheme, translateTerm } = useTenant();
  const [activeTab, setActiveTab] = useState('navigation');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');

  const colorScheme = getColorScheme();

  useEffect(() => {
    if (isOpen) {
      loadSiteConfig();
    }
  }, [isOpen]);

  const loadSiteConfig = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cms/site-config');
      const loadedConfig = response.data.config || {};
      
      // Ensure all required structure exists
      const safeConfig = {
        navigation: {
          show_navigation: true,
          style: 'horizontal',
          position: 'top',
          menu_items: [],
          ...loadedConfig.navigation
        },
        header: {
          show_header: true,
          show_login_button: true,
          show_cta_button: true,
          cta_text: 'Join Today',
          cta_url: '/membership',
          style: 'modern',
          ...loadedConfig.header
        },
        footer: {
          show_footer: true,
          style: 'detailed',
          sections: [],
          bottom_text: '© 2025 Coworking Community. All rights reserved.',
          show_social_links: true,
          ...loadedConfig.footer
        },
        branding: {
          logo_url: '/images/logos/coworking-logo.svg',
          logo_alt: 'Coworking Community',
          favicon_url: '/images/favicon.ico',
          ...loadedConfig.branding
        }
      };
      
      setConfig(safeConfig);
    } catch (error) {
      console.error('Failed to load site config:', error);
      // Set default config if loading fails
      setConfig({
        navigation: {
          show_navigation: true,
          style: 'horizontal',
          position: 'top',
          menu_items: [
            {label: 'Home', url: '/', type: 'page'},
            {label: 'Membership', url: '/membership', type: 'page'},
            {label: 'Community', url: '/community', type: 'page'},
            {label: 'Contact', url: '/contact', type: 'page'}
          ]
        },
        header: {
          show_header: true,
          show_login_button: true,
          show_cta_button: true,
          cta_text: 'Join Today',
          cta_url: '/membership',
          style: 'modern'
        },
        footer: {
          show_footer: true,
          style: 'detailed',
          sections: [
            {
              title: 'Quick Links',
              links: [
                {label: 'About', url: '/about'},
                {label: 'Pricing', url: '/pricing'},
                {label: 'Events', url: '/events'}
              ]
            }
          ],
          bottom_text: '© 2025 Coworking Community. All rights reserved.',
          show_social_links: true
        },
        branding: {
          logo_url: '/images/logos/coworking-logo.svg',
          logo_alt: 'Coworking Community', 
          favicon_url: '/images/favicon.ico'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSiteConfig = async () => {
    setSaving(true);
    try {
      await api.post('/cms/site-config', config);
      alert('Site configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save site config:', error);
      alert('Failed to save site configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // Convert image to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      
      if (type === 'logo') {
        updateConfig('branding', 'logo_url', base64);
      } else if (type === 'favicon') {
        updateConfig('branding', 'favicon_url', base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addMenuItem = () => {
    const newItem = {
      label: 'New Page',
      url: '/new-page',
      type: 'page'
    };
    
    setConfig(prev => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        menu_items: [...(prev.navigation?.menu_items || []), newItem]
      }
    }));
  };

  const removeMenuItem = (index) => {
    setConfig(prev => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        menu_items: (prev.navigation?.menu_items || []).filter((_, i) => i !== index)
      }
    }));
  };

  const updateMenuItem = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        menu_items: (prev.navigation?.menu_items || []).map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const addFooterLink = (sectionIndex) => {
    const newLink = {
      label: 'New Link',
      url: '/new-link'
    };
    
    setConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        sections: (prev.footer?.sections || []).map((section, i) => 
          i === sectionIndex 
            ? { ...section, links: [...(section.links || []), newLink] }
            : section
        )
      }
    }));
  };

  const removeFooterLink = (sectionIndex, linkIndex) => {
    setConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        sections: (prev.footer?.sections || []).map((section, i) => 
          i === sectionIndex 
            ? { ...section, links: (section.links || []).filter((_, li) => li !== linkIndex) }
            : section
        )
      }
    }));
  };

  const tabs = [
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'header', label: 'Header', icon: Layout },
    { id: 'footer', label: 'Footer', icon: Layout },
    { id: 'branding', label: 'Branding', icon: Palette }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ color: colorScheme.text }}>
              {translateTerm('Site Configuration')}
            </h2>
            <p className="text-gray-600 mt-1">Configure navigation, header, footer, and branding</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-white shadow' : ''}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-white shadow' : ''}`}
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-white shadow' : ''}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={saveSiteConfig}
              disabled={saving}
              className="flex items-center px-6 py-2 text-white rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: colorScheme.primary }}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Settings className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: colorScheme.primary }} />
                  <p className="text-gray-600">Loading configuration...</p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {/* Navigation Tab */}
                {activeTab === 'navigation' && config && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Navigation Settings</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Navigation Style
                          </label>
                          <select
                            value={config.navigation.style}
                            onChange={(e) => updateConfig('navigation', 'style', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="horizontal">Horizontal</option>
                            <option value="vertical">Vertical</option>
                            <option value="dropdown">Dropdown</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position
                          </label>
                          <select
                            value={config.navigation.position}
                            onChange={(e) => updateConfig('navigation', 'position', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium">Menu Items</h4>
                        <button
                          onClick={addMenuItem}
                          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(config.navigation.menu_items || []).map((item, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Move className="h-4 w-4 text-gray-400 cursor-move" />
                                <span className="text-sm font-medium">Menu Item {index + 1}</span>
                              </div>
                              <button
                                onClick={() => removeMenuItem(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Label"
                                value={item.label}
                                onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                placeholder="URL"
                                value={item.url}
                                onChange={(e) => updateMenuItem(index, 'url', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Header Tab */}
                {activeTab === 'header' && config && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium mb-4">Header Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="show_header"
                          checked={config.header.show_header}
                          onChange={(e) => updateConfig('header', 'show_header', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show_header" className="ml-2 block text-sm text-gray-900">
                          Show Header
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="show_login_button"
                          checked={config.header.show_login_button}
                          onChange={(e) => updateConfig('header', 'show_login_button', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show_login_button" className="ml-2 block text-sm text-gray-900">
                          Show Login Button
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="show_cta_button"
                          checked={config.header.show_cta_button}
                          onChange={(e) => updateConfig('header', 'show_cta_button', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show_cta_button" className="ml-2 block text-sm text-gray-900">
                          Show CTA Button
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={config.header.cta_text}
                          onChange={(e) => updateConfig('header', 'cta_text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CTA Button URL
                        </label>
                        <input
                          type="text"
                          value={config.header.cta_url}
                          onChange={(e) => updateConfig('header', 'cta_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Tab */}
                {activeTab === 'footer' && config && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium mb-4">Footer Settings</h3>
                    
                    <div className="flex items-center space-x-6 mb-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="show_footer"
                          checked={config.footer.show_footer}
                          onChange={(e) => updateConfig('footer', 'show_footer', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show_footer" className="ml-2 block text-sm text-gray-900">
                          Show Footer
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="show_social_links"
                          checked={config.footer.show_social_links}
                          onChange={(e) => updateConfig('footer', 'show_social_links', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show_social_links" className="ml-2 block text-sm text-gray-900">
                          Show Social Links
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Footer Copyright Text
                      </label>
                      <input
                        type="text"
                        value={config.footer.bottom_text}
                        onChange={(e) => updateConfig('footer', 'bottom_text', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-4">Footer Sections</h4>
                      <div className="space-y-4">
                        {(config.footer.sections || []).map((section, sectionIndex) => (
                          <div key={sectionIndex} className="p-4 border border-gray-200 rounded-lg">
                            <input
                              type="text"
                              placeholder="Section Title"
                              value={section.title}
                              onChange={(e) => {
                                const newSections = [...config.footer.sections];
                                newSections[sectionIndex] = { ...section, title: e.target.value };
                                updateConfig('footer', 'sections', newSections);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium mb-3"
                            />
                            
                            <div className="space-y-2">
                              {(section.links || []).map((link, linkIndex) => (
                                <div key={linkIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    placeholder="Link Label"
                                    value={link.label}
                                    onChange={(e) => {
                                      const newSections = [...config.footer.sections];
                                      newSections[sectionIndex].links[linkIndex] = { ...link, label: e.target.value };
                                      updateConfig('footer', 'sections', newSections);
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                  <input
                                    type="text"
                                    placeholder="URL"
                                    value={link.url}
                                    onChange={(e) => {
                                      const newSections = [...config.footer.sections];
                                      newSections[sectionIndex].links[linkIndex] = { ...link, url: e.target.value };
                                      updateConfig('footer', 'sections', newSections);
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                  <button
                                    onClick={() => removeFooterLink(sectionIndex, linkIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => addFooterLink(sectionIndex)}
                                className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Link
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Branding Tab */}
                {activeTab === 'branding' && config && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium mb-4">Branding Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo URL
                        </label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={config.branding.logo_url}
                            onChange={(e) => updateConfig('branding', 'logo_url', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/logo.png"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'logo')}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label
                              htmlFor="logo-upload"
                              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Upload Logo
                            </label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo Alt Text
                        </label>
                        <input
                          type="text"
                          value={config.branding.logo_alt}
                          onChange={(e) => updateConfig('branding', 'logo_alt', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Your Company Name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favicon URL
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={config.branding.favicon_url}
                          onChange={(e) => updateConfig('branding', 'favicon_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/favicon.ico"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*,.ico"
                            onChange={(e) => handleImageUpload(e, 'favicon')}
                            className="hidden"
                            id="favicon-upload"
                          />
                          <label
                            htmlFor="favicon-upload"
                            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Upload Favicon
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteConfigurationWidget;