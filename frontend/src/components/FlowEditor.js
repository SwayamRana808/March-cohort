'use client';

import React, { useState } from 'react';
import { Copy, Settings, ChevronRight, ChevronLeft, Plus, X, Trash2 } from 'lucide-react';
import WhatsAppPreview from './WhatsAppPreview';

const FlowEditor = ({
  showPreview,
  showJsonPreview,
  setShowJsonPreview,
  flow,
  activeScreen,
  selectedField,
  setSelectedField,
  handleScreenTitleChange,
  handleFieldEdit,
  handleAddField,
  handleDeleteField,
  handleDragStart,
  handleDrop,
  handleDragOver
}) => {
  const [showJson, setShowJson] = useState(false);

  const handleCopyJson = () => {
    const jsonString = JSON.stringify(flow, null, 2);
    navigator.clipboard.writeText(jsonString);
  };

  const handleFieldChange = (screenIndex, fieldName, value) => {
    const newFlow = { ...flow };
    // Find the field in the form children and update its value
    const screen = newFlow.screens[screenIndex];
    const form = screen.layout.children.find(child => child.type === 'Form');
    const field = form.children.find(child => child.name === fieldName);
    if (field) {
      field.value = value;
    }
    handleFieldEdit(screenIndex, fieldName, value);
  };

  const renderField = (field, screenIndex) => {
    switch (field.type) {
      case 'TextSubheading':
        return (
          <div key={field.text} className="mb-4">
            <h3 className="text-sm font-medium text-gray-900">{field.text}</h3>
          </div>
        );
      case 'RadioButtonsGroup':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
            <div className="space-y-2">
              {field['data-source'].map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    name={field.name}
                    value={option.id}
                    checked={field.value === option.id}
                    onChange={(e) => handleFieldChange(screenIndex, field.name, e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">{option.title}</label>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Dropdown':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
            <select
              value={field.value || ''}
              onChange={(e) => handleFieldChange(screenIndex, field.name, e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select an option</option>
              {field['data-source'].map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
        );
      case 'TextArea':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
            <textarea
              value={field.value || ''}
              onChange={(e) => handleFieldChange(screenIndex, field.name, e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={4}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${showPreview ? 'col-span-12' : 'col-span-6'}`}>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            {showPreview ? 'Flow Preview' : 'Flow Editor'}
          </h3>
          {!showPreview && (
            <button
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showJsonPreview ? 'Hide JSON' : 'Show JSON'}
            </button>
          )}
        </div>
        {showPreview ? (
          <WhatsAppPreview screen={flow.screens[activeScreen]} />
        ) : (
          showJsonPreview ? (
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-sm">
              {JSON.stringify(flow, null, 2)}
            </pre>
          ) : (
            <div className="space-y-4">
              <div 
                className="p-4 border rounded-lg"
                onDrop={(e) => handleDrop(e, activeScreen)}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={flow.screens[activeScreen].title}
                    onChange={(e) => handleScreenTitleChange(activeScreen, e.target.value)}
                    className="text-sm font-medium text-gray-900 border-none bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddField(activeScreen, 'TextSubheading')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Add Question
                    </button>
                    <button
                      onClick={() => handleAddField(activeScreen, 'RadioButtonsGroup')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Add Options
                    </button>
                    <button
                      onClick={() => handleAddField(activeScreen, 'TextArea')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Add Input
                    </button>
                  </div>
                </div>
                {flow.screens[activeScreen].layout.children.map((child, childIndex) => (
                  <div key={childIndex} className="pl-4 border-l-2 border-gray-200">
                    {child.type === 'Form' && child.children.map((formChild, formIndex) => (
                      <div 
                        key={formIndex} 
                        className={`mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${selectedField === formIndex ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setSelectedField(formIndex)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            {formChild.type === 'TextSubheading' ? (
                              <div className="flex items-center space-x-2 w-full">
                                <input
                                  type="text"
                                  value={formChild.text || ''}
                                  onChange={(e) => handleFieldEdit(activeScreen, formIndex, { text: e.target.value })}
                                  className="flex-1 text-sm text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-3 py-2"
                                  placeholder="Enter question"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteField(activeScreen, formIndex);
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded"
                                  title="Delete question"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={formChild.label || ''}
                                    onChange={(e) => handleFieldEdit(activeScreen, formIndex, { label: e.target.value })}
                                    className="flex-1 text-sm text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-3 py-2"
                                    placeholder="Enter label"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteField(activeScreen, formIndex);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded"
                                    title="Delete field"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="flex items-center">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={formChild.required || false}
                                      onChange={(e) => handleFieldEdit(activeScreen, formIndex, { required: e.target.checked })}
                                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Required</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {(formChild.type === 'RadioButtonsGroup' || formChild.type === 'Dropdown') && (
                          <div className="mt-4 space-y-2 pl-4 border-l-2 border-gray-200">
                            <div className="text-sm font-medium text-gray-700 mb-2">Options:</div>
                            {formChild['data-source']?.map((option, optIndex) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option.title}
                                  onChange={(e) => {
                                    const newDataSource = [...formChild['data-source']];
                                    newDataSource[optIndex].title = e.target.value;
                                    handleFieldEdit(activeScreen, formIndex, { 'data-source': newDataSource });
                                  }}
                                  className="flex-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newDataSource = [...formChild['data-source']];
                                    newDataSource.splice(optIndex, 1);
                                    handleFieldEdit(activeScreen, formIndex, { 'data-source': newDataSource });
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded"
                                  title="Delete option"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newDataSource = [...(formChild['data-source'] || [])];
                                newDataSource.push({
                                  id: `${newDataSource.length}_option${newDataSource.length + 1}`,
                                  title: `Option ${newDataSource.length + 1}`
                                });
                                handleFieldEdit(activeScreen, formIndex, { 'data-source': newDataSource });
                              }}
                              className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Option</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FlowEditor; 