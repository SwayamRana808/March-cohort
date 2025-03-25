export const handleDragStart = (e, fieldType) => {
  e.dataTransfer.setData('fieldType', fieldType);
};

export const handleDrop = (e, screenIndex, handleAddField) => {
  e.preventDefault();
  const fieldType = e.dataTransfer.getData('fieldType');
  handleAddField(screenIndex, fieldType);
};

export const handleDragOver = (e) => {
  e.preventDefault();
}; 