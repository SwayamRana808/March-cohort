'use client';
import React from 'react';
import {  Upload, Download, Play, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProfileMenu from './ProfileMenu';
const Header = ({ 
  flowName, 
  setFlowName, 
  onLoadJson, 
  onSaveJson, 
  showPreview, 
  setShowPreview,
  fileInputRef 
}) => {
  const router = useRouter();
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
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
            onChange={onLoadJson}
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
            onClick={onSaveJson}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-5 w-5 mr-2" />
            Save JSON
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Play className="h-5 w-5 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header; 