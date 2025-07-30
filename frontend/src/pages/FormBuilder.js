import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, Plus, Trash2, Settings } from 'lucide-react';
import api from '../services/api';

const FormBuilder = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!formId;

  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    fields: [],
    success_message: 'Thank you for your submission!',
    email_notifications: []
  });

  const saveForm = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return api.put(`/forms/${formId}`, data);
      } else {
        return api.post('/forms', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forms']);
      navigate('/forms');
    },
  });

  const addField = (type) => {
    const newField = {
      id: Date.now().toString(),
      label: `New ${type} field`,
      type,
      is_required: false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : [],
      placeholder: '',
      validation_rules: {}
    };

    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (fieldId, updates) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const deleteField = (fieldId) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const handleSave = () => {
    saveForm.mutate(form);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/forms')}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Form' : 'Create New Form'}
            </h1>
            <p className="text-sm text-gray-600">
              Build custom forms to capture leads
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={saveForm.isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveForm.isLoading ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Form Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form Name (Internal)
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contact Form"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form Title (Public)
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contact Us"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Form description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Success Message
              </label>
              <textarea
                value={form.success_message}
                onChange={(e) => setForm(prev => ({ ...prev, success_message: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Field Types */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add Field</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'text', label: 'Text' },
                { type: 'email', label: 'Email' },
                { type: 'phone', label: 'Phone' },
                { type: 'textarea', label: 'Text Area' },
                { type: 'select', label: 'Dropdown' },
                { type: 'checkbox', label: 'Checkbox' },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Form Fields</h3>
            
            {form.fields.length > 0 ? (
              <div className="space-y-4">
                {form.fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    field={field}
                    index={index}
                    onUpdate={(updates) => updateField(field.id, updates)}
                    onDelete={() => deleteField(field.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Plus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No fields yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add fields to your form using the controls on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ field, index, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="font-medium text-gray-900 border-none p-0 focus:ring-0 focus:outline-none bg-transparent"
            placeholder="Field label"
          />
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {field.type}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Field Preview */}
      <div className="mb-3">
        {field.type === 'textarea' ? (
          <textarea
            placeholder={field.placeholder || field.label}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
            rows={3}
            disabled
          />
        ) : field.type === 'select' ? (
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50" disabled>
            <option>Choose an option...</option>
            {field.options.map((option, i) => (
              <option key={i}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            placeholder={field.placeholder || field.label}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
            disabled
          />
        )}
      </div>

      {/* Field Settings */}
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.is_required}
              onChange={(e) => onUpdate({ is_required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`required-${field.id}`} className="ml-2 block text-sm text-gray-900">
              Required field
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder text
            </label>
            <input
              type="text"
              value={field.placeholder}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter placeholder..."
            />
          </div>

          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                value={field.options.join('\n')}
                onChange={(e) => onUpdate({ options: e.target.value.split('\n').filter(o => o.trim()) })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormBuilder;