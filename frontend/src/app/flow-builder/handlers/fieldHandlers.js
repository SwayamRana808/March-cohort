export const handleFieldEdit = (screenIndex, fieldIndex, updates, flow, setFlow) => {
  const newFlow = { ...flow };
  const screen = newFlow.screens[screenIndex];
  
  // Find the field in the layout children
  const field = screen.layout.children[fieldIndex];
  if (field) {
    screen.layout.children[fieldIndex] = {
      ...field,
      ...updates
    };
  }
  
  setFlow(newFlow);
};

export const handleAddField = (screenIndex, fieldType, flow, setFlow) => {
  const newFlow = { ...flow };
  const screen = newFlow.screens[screenIndex];
  
  // Create new field with minimal required properties
  const newField = {
    type: fieldType,
    label: fieldType !== 'TextSubheading' ? 'New Field' : '',
    text: fieldType === 'TextSubheading' ? 'New Question' : '',
    name: `field_${Date.now()}`,
    required: true
  };
  
  // Add data-source for specific field types
  if (fieldType === 'RadioButtonsGroup' || fieldType === 'Dropdown') {
    newField['data-source'] = [
      { id: 'option1', title: 'Option 1' },
      { id: 'option2', title: 'Option 2' }
    ];
  }
  
  // Add on-click-action for Footer
  if (fieldType === 'Footer') {
    newField['on-click-action'] = {
      name: 'data_exchange',
      payload: {}
    };
  }
  
  // Insert before the Footer if it exists
  const footerIndex = screen.layout.children.findIndex(child => child.type === 'Footer');
  if (footerIndex !== -1) {
    screen.layout.children.splice(footerIndex, 0, newField);
  } else {
    screen.layout.children.push(newField);
  }
  
  setFlow(newFlow);
};

export const handleDeleteField = (screenIndex, fieldIndex, flow, setFlow) => {
  const newFlow = { ...flow };
  const screen = newFlow.screens[screenIndex];
  
  // Don't delete Footer components
  if (screen.layout.children[fieldIndex].type === 'Footer') {
    return;
  }
  
  screen.layout.children.splice(fieldIndex, 1);
  setFlow(newFlow);
};

export const handleScreenTitleChange = (screenIndex, newTitle, flow, setFlow) => {
  const newFlow = { ...flow };
  newFlow.screens[screenIndex].title = newTitle;
  setFlow(newFlow);
}; 