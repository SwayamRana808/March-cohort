import { createClient } from '@/utils/supabase/client';
export const validateFlowJson = (json) => {
  if (!json.version || !Array.isArray(json.screens)) {
    throw new Error('Invalid flow format: missing version or screens array');
  }
  
  json.screens.forEach((screen, index) => {
    if (!screen.id || !screen.title) {
      throw new Error(`Invalid screen at index ${index}: missing id or title`);
    }
    if (!screen.layout?.type || !Array.isArray(screen.layout.children)) {
      throw new Error(`Invalid layout in screen ${screen.id}`);
    }
  });
  return true;
};

export const processFlowData = (data, setFlow, setFlowName, setActiveScreen, setSelectedField, setError, setShowJsonPreview) => {
  try {
    // Validate the JSON structure
    if (!data || !data.screens || !Array.isArray(data.screens) || data.screens.length === 0) {
      throw new Error('Invalid JSON format: Missing or empty screens array');
    }

    const firstScreen = data.screens[0];
    
    // Validate required screen properties
    if (!firstScreen.title || !firstScreen.layout || !firstScreen.layout.children) {
      throw new Error('Invalid screen format: Missing required fields');
    }
    console.log("data this is  ",data);
    // Create a new flow object preserving all original fields
    const newFlow = {
      name: data.name,
      version: data.version || "7.0",
      data_api_version: data.data_api_version,
      routing_model: data.routing_model,
      categories: data.categories || ["OTHER"],
      publish: false,
      screens: data.screens.map((screen,index) => ({
        id: screen.id,
        title: screen.title,
        ...(index === data.screens.length - 1 && { terminal: true, success: true }),
        layout: {
          type: screen.layout.type || "SingleColumnLayout",
          children: screen.layout.children.map(child => ({
            ...child,
            // Ensure required properties exist for specific types
            ...(child.type === 'TextSubheading' && { text: child.text || '' }),
            ...(child.type === 'RadioButtonsGroup' && {
              label: child.label || '',
              name: child.name || `field_${Date.now()}`,
              required: child.required ?? true,
              'data-source': child['data-source'] || []
            }),
            ...(child.type === 'Dropdown' && {
              label: child.label || '',
              name: child.name || `field_${Date.now()}`,
              required: child.required ?? true,
              'data-source': child['data-source'] || []
            }),
            ...(child.type === 'TextArea' && {
              label: child.label || '',
              name: child.name || `field_${Date.now()}`,
              required: child.required ?? true
            }),
            ...(child.type === 'Footer' && {
              label: child.label || 'Next ➡',
              'on-click-action': child['on-click-action'] || {
                name: 'data_exchange',
                payload: {}
              }
            })
          }))
        }
      }))
    };

    // Set the flow state with the new object
    setFlow(newFlow);
    setFlowName(firstScreen.title || 'New Flow');
    setActiveScreen(0);
    setSelectedField(null);
    setError('');
    setShowJsonPreview(false);
  } catch (error) {
    console.error('Error processing flow data:', error);
    throw new Error(`Invalid flow format: ${error.message}`);
  }
};

export const handleSaveJson = async (flow, flowName, setError, currentFlowId) => {
  try {
    validateFlowJson(flow);
    
    // Get the user's session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    // Save to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flows/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        flowName,
        flowData: flow,
        flowId: currentFlowId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save flow');
    }

    // Save as JSON file locally with name and categories fields preserved
    console.log("flow this is  ",flow);
    const flowWithMetadata = {
      name: flowName,
      categories: flow.categories || [], // Preserve original categories if they exist
      ...flow
    };
    const blob = new Blob([JSON.stringify(flowWithMetadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flowName.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    setError(error.message);
  }
};

export const handleLoadJson = (input, processFlowData, setError, setSelectedField, setShowJsonPreview) => {
  try {
    // Reset states before loading new JSON
    setError('');
    setSelectedField(null);
    setShowJsonPreview(false);

    // If input is a file input event
    if (input?.target?.files) {
      const file = input.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target.result);
          processFlowData(parsedData);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          setError('Invalid JSON file format. Please check your file.');
        }
      };
      reader.readAsText(file);
      return;
    }

    // If input is already an object
    if (typeof input === 'object' && input !== null) {
      processFlowData(input);
      return;
    }

    // If input is a JSON string
    if (typeof input === 'string') {
      const parsedData = JSON.parse(input);
      processFlowData(parsedData);
      return;
    }

    throw new Error('Invalid input format');
  } catch (error) {
    console.error('Error loading JSON:', error);
    setError('Invalid JSON format. Please check your data.');
  }
}; 