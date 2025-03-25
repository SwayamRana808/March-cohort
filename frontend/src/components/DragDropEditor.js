'use client';

import React from 'react';
import { Bot, Type, List, Trash2, Plus } from 'lucide-react';

const DragDropEditor = ({ flowSteps, onDrop, onDelete, onAddStep }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const elementData = JSON.parse(e.dataTransfer.getData('element'));
    onDrop(elementData);
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'message':
        return <Bot className="h-5 w-5 text-blue-600" />;
      case 'input':
        return <Type className="h-5 w-5 text-green-600" />;
      case 'menu':
        return <List className="h-5 w-5 text-purple-600" />;
      default:
        return null;
    }
  };

  const getStepColor = (type) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50';
      case 'input':
        return 'bg-green-50';
      case 'menu':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Flow Builder</h2>
        <button 
          onClick={onAddStep}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Step
        </button>
      </div>

      <div 
        className="space-y-4 min-h-[400px]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {flowSteps.map((step, index) => (
          <div 
            key={index}
            className={`flex items-start space-x-4 p-4 ${getStepColor(step.type)} rounded-lg`}
          >
            <div className={`p-2 rounded-full ${getStepColor(step.type).replace('50', '100')}`}>
              {getStepIcon(step.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">{step.label}</h3>
                <button 
                  onClick={() => onDelete(index)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">{step.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DragDropEditor; 