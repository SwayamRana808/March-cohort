'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { MessageSquare, Play, Edit, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const FlowsPage = () => {
  const router = useRouter();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingFlowId, setDeletingFlowId] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flows/my-flows`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flows');
        }

        const data = await response.json();
        setFlows(data);
      } catch (error) {
        console.error('Error fetching flows:', error);
        setError('Failed to load flows. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, [router, supabase.auth]);

  const handleEdit = (e, flowId) => {
    e.stopPropagation();
    router.push(`/flow-builder?flowId=${flowId}`);
  };

  const handleDelete = async (e, flowId) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this flow? This action cannot be undone.')) {
      return;
    }

    setDeletingFlowId(flowId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flows/${flowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete flow');
      }

      // Remove the deleted flow from the state
      setFlows(flows.filter(flow => flow._id !== flowId));
    } catch (error) {
      console.error('Error deleting flow:', error);
      setError('Failed to delete flow. Please try again.');
    } finally {
      setDeletingFlowId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading flows...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Active Flows</h1>
          <button
            onClick={() => router.push('/flow-builder')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Create New Flow
          </button>
        </div>

        {flows.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No flows yet</h3>
            <p className="text-gray-500 mb-4">Create your first WhatsApp flow to get started</p>
            <button
              onClick={() => router.push('/flow-builder')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Flow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow) => (
              <div
                key={flow._id}
                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{flow.flowName}</h3>
                    <p className="text-sm text-gray-500">
                      Last updated {formatDistanceToNow(new Date(flow.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleEdit(e, flow._id)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, flow._id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete"
                      disabled={deletingFlowId === flow._id}
                    >
                      {deletingFlowId === flow._id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowsPage; 