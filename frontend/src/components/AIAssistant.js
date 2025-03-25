'use client';

import React from 'react';
import { Wand2, Loader2 } from 'lucide-react';

const AIAssistant = ({ aiPrompt, setAiPrompt, isGenerating, onGenerateFlow }) => {
  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      return;
    }
    
    try {
      await onGenerateFlow();
    } catch (error) {
      console.error('Error generating flow:', error);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">AI Assistant</h3>
        <button 
          className="p-1 text-gray-400 hover:text-gray-500"
        >
          <Wand2 className="h-5 w-5" />
        </button>
      </div>
      
      <div>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Describe your flow (e.g., 'Create a customer support flow with welcome message, menu options, and feedback collection')"
          className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button 
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full mt-2 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Flow'
        )}
      </button>
    </div>
  );
};

export default AIAssistant;
