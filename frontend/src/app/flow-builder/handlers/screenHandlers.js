export const handleAddScreen = (flow, setFlow, setActiveScreen) => {
  const newFlow = { ...flow };
  newFlow.screens.push({
    id: `SCREEN_${Date.now()}`,
    title: `Screen ${flow.screens.length + 1}`,
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
  });
  setFlow(newFlow);
  setActiveScreen(newFlow.screens.length - 1);
};

export const handleDeleteScreen = (screenIndex, flow, setFlow, setActiveScreen, setError) => {
  if (flow.screens.length <= 1) {
    setError("Cannot delete the last screen");
    return;
  }
  const newFlow = { ...flow };
  newFlow.screens.splice(screenIndex, 1);
  setFlow(newFlow);
  if (activeScreen >= screenIndex) {
    setActiveScreen(Math.max(0, activeScreen - 1));
  }
}; 