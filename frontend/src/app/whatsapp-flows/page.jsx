'use client';

import React, { useEffect, useState } from 'react';
import { getWhatsAppFlows } from '@/services/whatsappService';
 

export default function WhatsAppFlowsPage() {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      setLoading(true);
      const response = await getWhatsAppFlows();
      setFlows(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">WhatsApp Flows</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map((flow) => (
          <div key={flow.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{flow.name}</h2>
            <div className="space-y-2">
              <p className="text-gray-600">ID: {flow.id}</p>
              <p className="text-gray-600">Status: <span className={`font-semibold ${flow.status === 'PUBLISHED' ? 'text-green-600' : 'text-yellow-600'}`}>{flow.status}</span></p>
              <p className="text-gray-600">Categories: {flow.categories.join(', ')}</p>
              {flow.validation_errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-red-500 font-semibold">Validation Errors:</p>
                  <ul className="list-disc list-inside text-red-500">
                    {flow.validation_errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 