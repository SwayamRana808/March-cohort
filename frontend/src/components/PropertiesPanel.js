'use client';

import React from 'react';

const PropertiesPanel = ({ selectedStep, onUpdateStep }) => {
  if (!selectedStep) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Properties</h3>
        <p className="text-sm text-gray-500">Select a step to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Properties</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Message Type</label>
          <select 
            value={selectedStep.messageType || 'text'}
            onChange={(e) => onUpdateStep({ ...selectedStep, messageType: e.target.value })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
            <option value="location">Location</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Response Timeout (seconds)</label>
          <input
            type="number"
            value={selectedStep.timeout || 30}
            onChange={(e) => onUpdateStep({ ...selectedStep, timeout: parseInt(e.target.value) })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Validation</label>
          <select 
            value={selectedStep.validation || 'none'}
            onChange={(e) => onUpdateStep({ ...selectedStep, validation: e.target.value })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="none">None</option>
            <option value="required">Required</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </div>

        {selectedStep.type === 'menu' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Menu Options</label>
            <div className="mt-2 space-y-2">
              {selectedStep.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...selectedStep.options];
                      newOptions[index] = e.target.value;
                      onUpdateStep({ ...selectedStep, options: newOptions });
                    }}
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = selectedStep.options.filter((_, i) => i !== index);
                      onUpdateStep({ ...selectedStep, options: newOptions });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(selectedStep.options || []), ''];
                  onUpdateStep({ ...selectedStep, options: newOptions });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
