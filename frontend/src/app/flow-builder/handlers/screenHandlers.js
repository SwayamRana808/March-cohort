export const handleAddScreen = (flow, setFlow) => {
  const newFlow = { ...flow };
  const screenId = `screen_${Date.now()}`;
  const screenCount = newFlow.screens.length;
  const newScreenNumber = screenCount + 1;

  // Create new screen with correct structure
  const newScreen = {
    id: screenId,
    title: `Screen ${newScreenNumber}`,
    layout: {
      type: "SingleColumnLayout",
      children: [
        {
          type: "TextSubheading",
          text: "New Question"
        },
        {
          type: "RadioButtonsGroup",
          label: "New Field",
          name: `field_${Date.now()}`,
          required: true,
          "data-source": [
            { id: "option1", title: "Option 1" },
            { id: "option2", title: "Option 2" }
          ]
        },
        {
          type: "Footer",
          label: "Next ➡",
          "on-click-action": {
            name: "navigate",
            next: { type: "screen", name: "" }
          }
        }
      ]
    }
  };

  // Add new screen to screens array
  newFlow.screens.push(newScreen);

  // Update routing model
  if (screenCount > 0) {
    const lastScreenId = newFlow.screens[screenCount - 1].id;
    newFlow.routing_model[lastScreenId] = [screenId];
    newFlow.routing_model[screenId] = [];
  } else {
    newFlow.routing_model[screenId] = [];
  }

  setFlow(newFlow);
};

export const handleDeleteScreen = (screenIndex, flow, setFlow) => {
  const newFlow = { ...flow };
  const screenToDelete = newFlow.screens[screenIndex];
  const screenId = screenToDelete.id;

  // Remove screen from screens array
  newFlow.screens.splice(screenIndex, 1);

  // Update routing model
  delete newFlow.routing_model[screenId];
  
  // Update previous screen's routing
  if (screenIndex > 0) {
    const previousScreenId = newFlow.screens[screenIndex - 1].id;
    newFlow.routing_model[previousScreenId] = [];
  }

  // Update next screen's routing if it exists
  if (screenIndex < newFlow.screens.length) {
    const nextScreenId = newFlow.screens[screenIndex].id;
    if (screenIndex > 0) {
      const previousScreenId = newFlow.screens[screenIndex - 1].id;
      newFlow.routing_model[previousScreenId] = [nextScreenId];
    }
  }

  setFlow(newFlow);
}; 