import React from 'react';
import { Plus, X } from 'lucide-react';

const ScreenNavigation = ({ 
  screens, 
  activeScreen, 
  setActiveScreen, 
  onAddScreen, 
  onDeleteScreen 
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Screens</h3>
            <button
              onClick={onAddScreen}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Screen
            </button>
          </div>
        </div>
        <div className="flex overflow-x-auto py-2 px-4 space-x-2">
          {screens.map((screen, index) => (
            <div
              key={screen.id}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md cursor-pointer ${
                activeScreen === index ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveScreen(index)}
            >
              <span className="text-sm font-medium">{screen.title}</span>
              {screens.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteScreen(index);
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
  );
};

export default ScreenNavigation; 