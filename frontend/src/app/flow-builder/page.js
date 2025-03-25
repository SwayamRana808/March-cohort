'use client';

import React, { useState, useRef } from 'react';
import { Save, Play, ArrowRight, Code, Upload, Download, AlertCircle, Trash2, Edit2, Plus, Wand2, Phone, X } from 'lucide-react';
import { getGeneratedFlow } from '@/lib/open_api_call';
import WhatsAppPreview from '@/components/WhatsAppPreview';

const FlowBuilderPage = () => {
  const [flowName, setFlowName] = useState('New Flow');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [error, setError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const fileInputRef = useRef(null);
  const [flow, setFlow] = useState({
    version: "7.0",
    screens: [
      {
        id: "SCREEN_1",
        title: "New Screen",
        data: {},
        layout: {
          type: "SingleColumnLayout",
          children: [
            {
              type: "Form",
              name: "form",
              children: []
            }
          ]
        }
      }
    ]
  });
  const [activeScreen, setActiveScreen] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const validateFlowJson = (json) => {
    if (!json.version || !Array.isArray(json.screens)) {
      throw new Error('Invalid flow format: missing version or screens array');
    }
    
    json.screens.forEach((screen, index) => {
      if (!screen.id || !screen.title) {
        throw new Error(`Invalid screen at index ${index}: missing id or title`);
      }
      if (!screen.layout?.type || !Array.isArray(screen.layout.children)) {
        throw new Error(`Invalid layout in screen ${screen.id}`);
      }
    });
    return true;
  };

  const handleSaveJson = () => {
    try {
      validateFlowJson(flow);
      const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${flowName.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLoadJson = (input) => {
    try {
      // Reset states before loading new JSON
      setError('');
      setSelectedField(null);
      setShowJsonPreview(false);

      // If input is a file input event
      if (input?.target?.files) {
        const file = input.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsedData = JSON.parse(e.target.result);
            processFlowData(parsedData);
          } catch (error) {
            console.error('Error parsing JSON file:', error);
            setError('Invalid JSON file format. Please check your file.');
          }
        };
        reader.readAsText(file);
        return;
      }

      // If input is already an object
      if (typeof input === 'object' && input !== null) {
        processFlowData(input);
        return;
      }

      // If input is a JSON string
      if (typeof input === 'string') {
        const parsedData = JSON.parse(input);
        processFlowData(parsedData);
        return;
      }

      throw new Error('Invalid input format');
    } catch (error) {
      console.error('Error loading JSON:', error);
      setError('Invalid JSON format. Please check your data.');
    }
  };

  const processFlowData = (data) => {
    try {
      // Validate the JSON structure
      if (!data || !data.screens || !Array.isArray(data.screens) || data.screens.length === 0) {
        throw new Error('Invalid JSON format: Missing or empty screens array');
      }

      const firstScreen = data.screens[0];
      
      // Validate required screen properties
      if (!firstScreen.title || !firstScreen.layout || !firstScreen.layout.children) {
        throw new Error('Invalid screen format: Missing required fields');
      }

      // Create a new flow object with the correct structure
      const newFlow = {
        version: data.version || "7.0",
        screens: data.screens.map(screen => ({
          ...screen,
          layout: {
            ...screen.layout,
            children: screen.layout.children.map(child => {
              if (child.type === 'Form') {
                return {
                  ...child,
                  children: Array.isArray(child.children) ? child.children : []
                };
              }
              return child;
            })
          }
        }))
      };

      // Set the flow state with the new object
      setFlow(newFlow);
      setFlowName(firstScreen.title || 'New Flow');
      setActiveScreen(0);
      setSelectedField(null);
      setError('');
      setShowJsonPreview(false);
    } catch (error) {
      console.error('Error processing flow data:', error);
      throw new Error(`Invalid flow format: ${error.message}`);
    }
  };

  const handleScreenTitleChange = (screenIndex, newTitle) => {
    const newFlow = { ...flow };
    newFlow.screens[screenIndex].title = newTitle;
    setFlow(newFlow);
  };

  const handleFieldEdit = (screenIndex, fieldIndex, updates) => {
    const newFlow = { ...flow };
    const form = newFlow.screens[screenIndex].layout.children.find(child => child.type === 'Form');
    if (form && form.children[fieldIndex]) {
      form.children[fieldIndex] = {
        ...form.children[fieldIndex],
        ...updates
      };
    }
    setFlow(newFlow);
  };

  const handleAddField = (screenIndex, fieldType) => {
    const newFlow = { ...flow };
    const form = newFlow.screens[screenIndex].layout.children.find(child => child.type === 'Form');
    if (form) {
      const newField = {
        type: fieldType,
        text: fieldType === 'TextSubheading' ? 'New Question' : '',
        label: fieldType !== 'TextSubheading' ? 'New Field' : '',
        name: `field_${Date.now()}`,
        required: false
      };
      
      if (fieldType === 'RadioButtonsGroup' || fieldType === 'Dropdown') {
        newField['data-source'] = [
          { id: '0_option1', title: 'Option 1' },
          { id: '1_option2', title: 'Option 2' }
        ];
      }
      
      form.children.push(newField);
    }
    setFlow(newFlow);
  };

  const handleDeleteField = (screenIndex, fieldIndex) => {
    const newFlow = { ...flow };
    const form = newFlow.screens[screenIndex].layout.children.find(child => child.type === 'Form');
    if (form) {
      form.children.splice(fieldIndex, 1);
    }
    setFlow(newFlow);
  };

  const handleGenerateFlow = async () => {
    if (!aiPrompt.trim()) {
      setError('Please enter a prompt for the AI assistant');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      const generatedFlow = await getGeneratedFlow(aiPrompt);
      if (generatedFlow) {
        let parsedFlow;
        try {
          parsedFlow = JSON.parse(generatedFlow);
        } catch (parseError) {
          throw new Error('Invalid JSON response from AI: ' + parseError.message);
        }
        
        // Process the generated flow using the same function as JSON loading
        processFlowData(parsedFlow);
      }
    } catch (error) {
      console.error('Error generating flow:', error);
      setError('Failed to generate flow: ' + error.message);
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  };

  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.setData('fieldType', fieldType);
  };

  const handleDrop = (e, screenIndex) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData('fieldType');
    handleAddField(screenIndex, fieldType);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAddScreen = () => {
    const newFlow = { ...flow };
    newFlow.screens.push({
      id: `SCREEN_${Date.now()}`,
      title: `Screen ${flow.screens.length + 1}`,
      data: {},
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: []
          }
        ]
      }
    });
    setFlow(newFlow);
    setActiveScreen(newFlow.screens.length - 1);
  };

  const handleDeleteScreen = (screenIndex) => {
    if (flow.screens.length <= 1) {
      setError("Cannot delete the last screen");
      return;
    }
    const newFlow = { ...flow };
    newFlow.screens.splice(screenIndex, 1);
    setFlow(newFlow);
    if (activeScreen >= screenIndex) {
      setActiveScreen(Math.max(0, activeScreen - 1));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <ArrowRight className="h-6 w-6" />
            </button>
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="text-2xl font-semibold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
              placeholder="Flow Name"
            />
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLoadJson}
              accept=".json"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-5 w-5 mr-2" />
              Load JSON
            </button>
            <button 
              onClick={handleSaveJson}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-5 w-5 mr-2" />
              Save JSON
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-4 py-2 text-sm font-medium  text-white bg-blue-600 hover:bg-blue-700 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Play className="h-5 w-5 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>
      </header>

      {/* Screen Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Screens</h3>
              <button
                onClick={handleAddScreen}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Screen
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto py-2 px-4 space-x-2">
            {flow.screens.map((screen, index) => (
              <div
                key={screen.id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md cursor-pointer ${
                  activeScreen === index ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveScreen(index)}
              >
                <span className="text-sm font-medium">{screen.title}</span>
                {flow.screens.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScreen(index);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Draggable Elements */}
          {!showPreview && (
            <div className="col-span-3 bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Elements</h3>
              <div className="space-y-2">
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'TextSubheading')}
                  className="p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50"
                >
                  Question
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'RadioButtonsGroup')}
                  className="p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50"
                >
                  Options
                </div>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'TextArea')}
                  className="p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50"
                >
                  Input
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">AI Assistant</h3>
                <div className="space-y-4">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe your flow..."
                    className="w-full h-32 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleGenerateFlow}
                    disabled={isGenerating}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Flow'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Flow Editor or Preview */}
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
                                        onClick={() => handleDeleteField(activeScreen, formIndex)}
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
                                          onClick={() => handleDeleteField(activeScreen, formIndex)}
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
                                        onClick={() => {
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
                                    onClick={() => {
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

          {/* Right Sidebar - Properties Panel */}
          {!showPreview && selectedField !== null && (
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Properties</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Field Type</label>
                    <select
                      value={flow.screens[0].layout.children[0].children[selectedField].type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const screenIndex = 0;
                        handleFieldEdit(screenIndex, selectedField, { 
                          type: newType,
                          'data-source': newType === 'RadioButtonsGroup' || newType === 'Dropdown' 
                            ? [{ id: '0_option1', title: 'Option 1' }, { id: '1_option2', title: 'Option 2' }]
                            : undefined
                        });
                      }}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="TextSubheading">Question</option>
                      <option value="RadioButtonsGroup">Options</option>
                      <option value="TextArea">Input</option>
                      <option value="Dropdown">Dropdown</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={flow.screens[0].layout.children[0].children[selectedField].name}
                      onChange={(e) => handleFieldEdit(0, selectedField, { name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowBuilderPage;