import { createClient } from '@/utils/supabase/client';

const BASE_URL = 'https://graph.facebook.com/v22.0';

export const publishFlow = async (flow, flowName) => {
  try {
    // Get user's session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    // Get WhatsApp config from MongoDB
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/config`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch WhatsApp configuration');
    }

    const whatsappConfig = await response.json();
    if (!whatsappConfig) {
      throw new Error('WhatsApp configuration not found');
    }

    // Remove duplicate fields from flow
    console.log("flowWithoutDuplicates this is  ",flowName);
    const { name, categories, publish, ...flowWithoutDuplicates } = flow;
    
    const flowResponse = await fetch(`${BASE_URL}/${whatsappConfig.wabaId}/flows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappConfig.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: flow.name,
        categories: flow.categories || ["OTHER"],
        publish: false,
        flow_json: flowWithoutDuplicates
      })
    });

    const responseData = await flowResponse.json();
    if (responseData.success) {
        return {
          success: true,
          flowId: responseData.id,
          message: 'Flow published successfully'
        };
      }

    if (!flowResponse.ok) {
      // Handle duplicate name error
      if (responseData.error?.code === 100 && responseData.error?.error_subcode === 4016019) {
        throw new Error('A flow with this name already exists. Please choose a different name.');
      }
      throw new Error(JSON.stringify(responseData.error) || 'Failed to publish flow');
    }

    // Check for validation errors
    if (responseData.validation_errors && responseData.validation_errors.length > 0) {
      throw new Error(`Flow validation failed: ${responseData.validation_errors.join(', ')}`);
    }

    // Success case
    if (responseData.success) {
      return {
        success: true,
        flowId: responseData.id,
        message: 'Flow published successfully'
      };
    }

    throw new Error('Unexpected response from WhatsApp API');
  } catch (error) {
    console.error('Error publishing flow:', error);
    throw error;
  }
};

export const getWhatsAppFlows = async () => {
  try {
    // Get user's session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    // Get WhatsApp config from MongoDB
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/config`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch WhatsApp configuration');
    }

    const whatsappConfig = await response.json();
    if (!whatsappConfig) {
      throw new Error('WhatsApp configuration not found');
    }

    const flowsResponse = await fetch(`${BASE_URL}/${whatsappConfig.wabaId}/flows`, {
      headers: {
        'Authorization': `Bearer ${whatsappConfig.accessToken}`
      }
    });

    if (!flowsResponse.ok) {
      throw new Error('Failed to fetch WhatsApp flows');
    }

    return await flowsResponse.json();
  } catch (error) {
    console.error('Error fetching WhatsApp flows:', error);
    throw error;
  }
}; 
