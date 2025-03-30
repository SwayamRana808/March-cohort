'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Save, Play, ArrowRight, Code, Upload, Download, AlertCircle, Trash2, Edit2, Plus, Wand2, Phone, X, Loader2 } from 'lucide-react';
import WhatsAppPreview from '@/components/WhatsAppPreview';
import Header from '@/components/Header';
import ScreenNavigation from '@/components/ScreenNavigation';
import FlowEditor from '@/components/FlowEditor';
import PropertiesPanel from '@/components/PropertiesPanel';
import AIAssistant from '@/components/AIAssistant';
import { createClient } from '@/utils/supabase/client';

// Import handlers
import { validateFlowJson, processFlowData, handleSaveJson, handleLoadJson } from './handlers/flowHandlers';
import { handleFieldEdit, handleAddField, handleDeleteField, handleScreenTitleChange } from './handlers/fieldHandlers';
import { handleAddScreen, handleDeleteScreen } from './handlers/screenHandlers';
import { handleDragStart, handleDrop, handleDragOver } from './handlers/dragDropHandlers';
import { handleGenerateFlow } from './handlers/aiHandlers';

const FlowBuilderPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [flowName, setFlowName] = useState('New Flow');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [error, setError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentFlowId, setCurrentFlowId] = useState(null);
  const fileInputRef = useRef(null);
  const supabase = createClient();

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

  // Load existing flow if flowId is present in URL
  useEffect(() => {
    const loadExistingFlow = async () => {
      const flowId = searchParams.get('flowId');
      if (!flowId) return;

      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flows/getFlow/${flowId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flow');
        }

        const data = await response.json();
        setFlowName(data.flowName);
        setFlow(data.flowData);
        setCurrentFlowId(flowId);
      } catch (error) {
        console.error('Error loading flow:', error);
        setError('Failed to load flow. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadExistingFlow();
  }, [searchParams, router, supabase.auth]);

  // Wrapper functions to pass state setters to handlers
  const handleFlowData = (data) => {
    processFlowData(data, setFlow, setFlowName, setActiveScreen, setSelectedField, setError, setShowJsonPreview);
  };

  const handleSave = () => {
    handleSaveJson(flow, flowName, setError, currentFlowId);
  };

  const handleLoad = (input) => {
    handleLoadJson(input, handleFlowData, setError, setSelectedField, setShowJsonPreview);
  };

  const handleFieldEditWrapper = (screenIndex, fieldIndex, updates) => {
    handleFieldEdit(screenIndex, fieldIndex, updates, flow, setFlow);
  };

  const handleAddFieldWrapper = (screenIndex, fieldType) => {
    handleAddField(screenIndex, fieldType, flow, setFlow);
  };

  const handleDeleteFieldWrapper = (screenIndex, fieldIndex) => {
    handleDeleteField(screenIndex, fieldIndex, flow, setFlow);
  };

  const handleScreenTitleChangeWrapper = (screenIndex, newTitle) => {
    handleScreenTitleChange(screenIndex, newTitle, flow, setFlow);
  };

  const handleAddScreenWrapper = () => {
    handleAddScreen(flow, setFlow, setActiveScreen);
  };

  const handleDeleteScreenWrapper = (screenIndex) => {
    handleDeleteScreen(screenIndex, flow, setFlow, setActiveScreen, setError);
  };

  const handleDropWrapper = (e, screenIndex) => {
    handleDrop(e, screenIndex, handleAddFieldWrapper);
  };

  const handleGenerateFlowWrapper = () => {
    handleGenerateFlow(aiPrompt, setError, setIsGenerating, handleFlowData, setAiPrompt);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading flow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        flowName={flowName}
        setFlowName={setFlowName}
        onLoadJson={handleLoad}
        onSaveJson={handleSave}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        fileInputRef={fileInputRef}
      />

      <ScreenNavigation 
        screens={flow.screens}
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        onAddScreen={handleAddScreenWrapper}
        onDeleteScreen={handleDeleteScreenWrapper}
      />

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

              <AIAssistant 
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                isGenerating={isGenerating}
                onGenerateFlow={handleGenerateFlowWrapper}
              />
            </div>
          )}

          {/* Main Content - Flow Editor or Preview */}
          <FlowEditor 
            showPreview={showPreview}
            showJsonPreview={showJsonPreview}
            setShowJsonPreview={setShowJsonPreview}
            flow={flow}
            activeScreen={activeScreen}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
            handleScreenTitleChange={handleScreenTitleChangeWrapper}
            handleFieldEdit={handleFieldEditWrapper}
            handleAddField={handleAddFieldWrapper}
            handleDeleteField={handleDeleteFieldWrapper}
            handleDragStart={handleDragStart}
            handleDrop={handleDropWrapper}
            handleDragOver={handleDragOver}
          />

          {/* Right Sidebar - Properties Panel */}
          {!showPreview && selectedField !== null && (
            <PropertiesPanel 
              selectedField={selectedField}
              flow={flow}
              handleFieldEdit={handleFieldEditWrapper}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowBuilderPage;