'use client';

import React, { useState } from 'react';
import { Copy, Settings, ChevronRight, ChevronLeft, Plus, X, Trash2 } from 'lucide-react';
import WhatsAppPreview from './WhatsAppPreview';
import { publishFlow } from '@/services/whatsappService';

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
  handleDragOver,
  flowName
}) => {
  const [showJson, setShowJson] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [publishError, setPublishError] = useState(null);

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

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setPublishError(null);
      await publishFlow(flow, flowName);
      setShowSuccessPopup(true);
    } catch (error) {
      setPublishError(error.message);
    } finally {
      setPublishing(false);
    }
  };

 
  return (
    <div className={`${showPreview ? 'col-span-12' : 'col-span-6'}`}>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            {showPreview ? 'Flow Preview' : 'Flow Editor'}
          </h3>
          <div className="flex items-center space-x-4">
            {!showPreview && (
              <>
                <button
                  onClick={() => setShowJsonPreview(!showJsonPreview)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showJsonPreview ? 'Hide JSON' : 'Show JSON'}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    publishing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {publishing ? 'Publishing...' : 'Publish to WhatsApp'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Flow Published Successfully!</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Your flow has been published to WhatsApp. You can view it in the WhatsApp Flows section.
                </p>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {publishError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{publishError}</p>
          </div>
        )}

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
                {console.log(flow)}
                {flow.screens[activeScreen].layout.children.map((formChild, formIndex) => (
                  <div key={formIndex} className="pl-4 border-l-2 border-gray-200">
                     
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