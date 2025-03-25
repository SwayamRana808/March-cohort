export const handleFieldEdit = (screenIndex, fieldIndex, updates, flow, setFlow) => {
  const newFlow = { ...flow };
  const form = newFlow.screens[screenIndex].layout.children.find(child => child.type === 'Form');
  if (form && form.children[fieldIndex]) {
    form.children[fieldIndex] = {
      ...form.children[fieldIndex],
      ...updates
    };
  }
  setFlow(newFlow);
};

export const handleAddField = (screenIndex, fieldType, flow, setFlow) => {
  const newFlow = { ...flow };
  const form = newFlow.screens[screenIndex].layout.children.find(child => child.type === 'Form');
  if (form) {
    const newField = {
      type: fieldType,
      text: fieldType === 'TextSubheading' ? 'New Question' : '',
      label: fieldType !== 'TextSubheading' ? 'New Field' : '',
      name: `field_${Date.now()}`,
      required: false
    };
    
    if (fieldType === 'RadioButtonsGroup' || fieldType === 'Dropdown') {
      newField['data-source'] = [
        { id: '0_option1', title: 'Option 1' },
        { id: '1_option2', title: 'Option 2' }
      ];
    }
    
    form.children.push(newField);
  }
  setFlow(newFlow);
};

export const handleDeleteField = (screenIndex, fieldIndex, flow, setFlow) => {
  const newFlow = { ...flow };
  const form = newFlow.screens[screenIndex].layout.children.find(child => child.type === 'Form');
  if (form) {
    form.children.splice(fieldIndex, 1);
  }
  setFlow(newFlow);
};

export const handleScreenTitleChange = (screenIndex, newTitle, flow, setFlow) => {
  const newFlow = { ...flow };
  newFlow.screens[screenIndex].title = newTitle;
  setFlow(newFlow);
}; 