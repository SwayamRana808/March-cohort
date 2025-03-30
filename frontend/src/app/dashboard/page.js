'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  MessageSquare, 
  PlusCircle, 
  Settings, 
  Bell, 
  Users,
  Activity,
  ChevronRight,
  Loader2,
  PhoneCall,
} from 'lucide-react';
import ProfileMenu from '@/components/ProfileMenu';
import { createClient } from '@/utils/supabase/client';
import WhatsAppConfigDialog from '@/components/WhatsAppConfigDialog';
import { getWhatsAppFlows } from '@/services/whatsappService';

const DashboardPage = () => {
  const router = useRouter();
  const [flowCount, setFlowCount] = useState(0);
  const [whatsappFlows, setWhatsappFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const [isWhatsAppConfigOpen, setIsWhatsAppConfigOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch flow count
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flows/count`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flow count');
        }

        const data = await response.json();
        setFlowCount(data.count);

        // Fetch WhatsApp flows
        const whatsappResponse = await getWhatsAppFlows();
        setWhatsappFlows(whatsappResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchData();
    }
  }, [router, supabase.auth, mounted]);

  const handleCreateFlow = () => {
    router.push('/flow-builder');
  };

  const handleViewFlows = () => {
    router.push('/flows');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
            </button>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            onClick={handleViewFlows}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft Flows</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  ) : (
                    flowCount || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div onClick={() => router.push('/whatsapp-flows')} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <PhoneCall className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">WhatsApp Flows</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                  ) : (
                    whatsappFlows.length || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages Today</p>
                <p className="text-2xl font-semibold text-gray-900">456</p>
              </div>
            </div>
          </div> */}

          {/* <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">89%</p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Flows */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Flows</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {whatsappFlows.slice(0, 3).map((flow) => (
                    <div key={flow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <PhoneCall className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{flow.name}</h3>
                          <p className="text-sm text-gray-500">
                            Status: <span className={`font-semibold ${flow.status === 'PUBLISHED' ? 'text-green-600' : 'text-yellow-600'}`}>{flow.status}</span>
                          </p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-500">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <button 
                    onClick={handleCreateFlow}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create New Flow
                  </button>
                  <button
                    onClick={() => setIsWhatsAppConfigOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Settings className="h-5 w-5 mr-2" />
                    Configure WhatsApp
                  </button>
                   
                  {/* Add the WhatsApp configuration dialog */}
                  <WhatsAppConfigDialog
                    isOpen={isWhatsAppConfigOpen}
                    onClose={() => setIsWhatsAppConfigOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;