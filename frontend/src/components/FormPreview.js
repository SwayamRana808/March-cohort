'use client';

import React from 'react';
import { Bot, User, Send } from 'lucide-react';

const FormPreview = ({ flowSteps }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">WhatsApp Preview</h2>
      <div className="space-y-4">
        {flowSteps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            {step.type === 'message' ? (
              <>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{step.content}</p>
                  </div>
                </div>
              </>
            ) : step.type === 'input' ? (
              <>
                <div className="p-2 bg-green-100 rounded-full">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-500"
                    />
                  </div>
                </div>
              </>
            ) : step.type === 'menu' ? (
              <>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900 mb-2">{step.content}</p>
                    <div className="space-y-2">
                      {step.options?.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          className="w-full text-left px-3 py-2 bg-white rounded-md text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormPreview;
