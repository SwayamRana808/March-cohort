'use client';

import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';

const AIAssistant = ({ onGenerateFlow }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description of your flow');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await onGenerateFlow(prompt);
      setPrompt('');
    } catch (error) {
      setError('Failed to generate flow. Please try again.');
      console.error('Error generating flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">AI Assistant</h3>
        <button 
          className="p-1 text-gray-400 hover:text-gray-500"
        >
          <Wand2 className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your flow (e.g., 'Create a customer support flow with welcome message, menu options, and feedback collection')"
            className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Flow'
          )}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
