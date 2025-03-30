'use client'
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const WhatsAppConfigDialog = ({ isOpen, onClose }) => {
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/config`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setWabaId(data.wabaId);
        setAccessToken(data.accessToken);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp config:', error);
    }
  };

  const handleSave = async () => {
    if (!wabaId || !accessToken) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ wabaId, accessToken })
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      const data = await response.json();
      setConfig(data.config);
      onClose();
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      setError('Failed to save configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/config`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }

      setConfig(null);
      setWabaId('');
      setAccessToken('');
      onClose();
    } catch (error) {
      console.error('Error deleting WhatsApp config:', error);
      setError('Failed to delete configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">WhatsApp Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WABA ID
            </label>
            <input
              type="text"
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your WhatsApp Business Account ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Token
            </label>
            <div className="relative">
              <input
                type={showAccessToken ? "text" : "password"}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter your Meta API Access Token"
              />
              <button
                type="button"
                onClick={() => setShowAccessToken(!showAccessToken)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showAccessToken ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            {config && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-red-600 hover:text-red-700 flex items-center"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfigDialog; 