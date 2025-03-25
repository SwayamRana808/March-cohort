'use client';

import React, { useState } from 'react';
import { Copy, Settings, ChevronRight, ChevronLeft, Plus, X } from 'lucide-react';

const FlowEditor = ({ flow, onFlowChange }) => {
  const [activeScreen, setActiveScreen] = useState(0);
  const [showJson, setShowJson] = useState(false);

  const handleCopyJson = () => {
    const jsonString = JSON.stringify(flow, null, 2);
    navigator.clipboard.writeText(jsonString);
  };

  const handleScreenChange = (screenIndex) => {
    setActiveScreen(screenIndex);
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
    onFlowChange(newFlow);
  };

  const handleAddScreen = () => {
    const newFlow = { ...flow };
    const newScreen = {
      id: `SCREEN_${newFlow.screens.length}`,
      title: `Screen ${newFlow.screens.length + 1}`,
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
    };
    newFlow.screens.push(newScreen);
    onFlowChange(newFlow);
  };

  const handleDeleteScreen = (screenIndex) => {
    const newFlow = { ...flow };
    newFlow.screens.splice(screenIndex, 1);
    if (activeScreen >= newFlow.screens.length) {
      setActiveScreen(newFlow.screens.length - 1);
    }
    onFlowChange(newFlow);
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

  const renderScreen = (screen, index) => {
    const form = screen.layout.children.find(child => child.type === 'Form');
    const fields = form ? form.children : [];

    return (
      <div key={screen.id} className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">{screen.title}</h2>
          <button
            onClick={() => handleDeleteScreen(index)}
            className="p-1 text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          {fields.map(field => renderField(field, index))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveScreen(Math.max(0, activeScreen - 1))}
            disabled={activeScreen === 0}
            className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">
            Screen {activeScreen + 1} of {flow.screens.length}
          </span>
          <button
            onClick={() => setActiveScreen(Math.min(flow.screens.length - 1, activeScreen + 1))}
            disabled={activeScreen === flow.screens.length - 1}
            className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowJson(!showJson)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showJson ? 'Hide JSON' : 'Show JSON'}
          </button>
          <button
            onClick={handleCopyJson}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Flow JSON
          </button>
          <button
            onClick={handleAddScreen}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Screen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {renderScreen(flow.screens[activeScreen], activeScreen)}
        </div>
        {showJson && (
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-800 overflow-auto max-h-[600px]">
              {JSON.stringify(flow, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowEditor; 