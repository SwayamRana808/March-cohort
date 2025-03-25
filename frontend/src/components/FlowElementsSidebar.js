'use client';

import React from 'react';
import { MessageSquare, Type, List, CheckSquare } from 'lucide-react';
import AIAssistant from './AIAssistant';

const FlowElementsSidebar = ({ onDragStart, onGenerateFlow }) => {
  const elements = [
    { id: 'message', type: 'message', icon: MessageSquare, color: 'blue', label: 'Message' },
    { id: 'input', type: 'input', icon: Type, color: 'green', label: 'Input' },
    { id: 'menu', type: 'menu', icon: List, color: 'purple', label: 'Menu' },
    { id: 'condition', type: 'condition', icon: CheckSquare, color: 'yellow', label: 'Condition' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Flow Elements</h3>
        <div className="space-y-2">
          {elements.map((element) => (
            <button
              key={element.id}
              draggable
              onDragStart={(e) => onDragStart(e, element)}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <element.icon className={`h-5 w-5 mr-2 text-${element.color}-500`} />
              {element.label}
            </button>
          ))}
        </div>
      </div>

      <AIAssistant onGenerateFlow={onGenerateFlow} />
    </div>
  );
};

export default FlowElementsSidebar; 