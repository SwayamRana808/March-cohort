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

    // Create a new flow object with the correct structure
    const newFlow = {
      version: data.version || "7.0",
      screens: data.screens.map(screen => ({
        ...screen,
        layout: {
          ...screen.layout,
          children: screen.layout.children.map(child => {
            if (child.type === 'Form') {
              return {
                ...child,
                children: Array.isArray(child.children) ? child.children : []
              };
            }
            return child;
          })
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

export const handleSaveJson = (flow, flowName, setError) => {
  try {
    validateFlowJson(flow);
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
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