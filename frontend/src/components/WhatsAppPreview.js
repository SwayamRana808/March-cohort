import React, { useState, useEffect } from 'react';
import { ChevronLeft, MoreVertical, Send, X } from 'lucide-react';

const WhatsAppPreview = ({ screen }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [isValid, setIsValid] = useState(false);

  // Check form validity whenever form values change
  useEffect(() => {
    const checkFormValidity = () => {
      const requiredFields = [];
      screen.layout.children.forEach(formChild => {   
            if (formChild.required && formChild.type !== 'Footer' && formChild.type !== 'TextSubheading') {
              requiredFields.push(formChild.name);        
        }
      });

      const allRequiredFieldsFilled = requiredFields.every(field => 
        formValues[field] && formValues[field].toString().trim() !== ''
      );
      setIsValid(allRequiredFieldsFilled);
    };

    checkFormValidity();
  }, [formValues, screen]);

  const handleInputChange = (name, value) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderFormContent = () => {
    return screen.layout.children.map((formChild, childIndex) => (
      <div key={childIndex} className="mb-4">
        {formChild.type === 'TextSubheading' ? (
          <h4 className="text-gray-800 font-medium mb-2">{formChild.text}</h4>
        ) : formChild.type === 'Footer' ? (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <button
              className={`w-full py-3 px-4 rounded-lg font-medium text-center transition-colors duration-200 ${
                isValid
                  ? 'bg-[#25D366] text-white hover:bg-[#1ea952]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isValid}
            >
              <span className="block text-center">{formChild.label}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-gray-700">
              {formChild.label}
              {formChild.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {formChild.type === 'RadioButtonsGroup' && (
              <div className="space-y-2">
                {formChild['data-source']?.map((option) => (
                  <label key={option.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name={formChild.name}
                      value={option.id}
                      checked={formValues[formChild.name] === option.id}
                      onChange={(e) => handleInputChange(formChild.name, e.target.value)}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-3 text-gray-700">{option.title}</span>
                  </label>
                ))}
              </div>
            )}
            {formChild.type === 'TextArea' && (
              <textarea
                placeholder="Type your answer..."
                value={formValues[formChild.name] || ''}
                onChange={(e) => handleInputChange(formChild.name, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none overflow-y-auto"
                style={{ minHeight: '100px', maxHeight: '200px' }}
                rows={3}
              />
            )}
            {formChild.type === 'Dropdown' && (
              <select
                value={formValues[formChild.name] || ''}
                onChange={(e) => handleInputChange(formChild.name, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select an option</option>
                {formChild['data-source']?.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    ));
  };
  

  return (
    <div className="max-w-sm mx-auto border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-gray-100 relative">
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] text-white p-4">
        <div className="flex items-center">
          <ChevronLeft className="h-6 w-6" />
          <div className="ml-4">
            <h2 className="text-lg font-semibold">{screen.title}</h2>
            <p className="text-sm opacity-75">WhatsApp Bot</p>
          </div>
          <MoreVertical className="h-6 w-6 ml-auto" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="bg-[#ECE5DD] p-4 h-[500px] overflow-y-auto space-y-4">
        {/* Bot Message */}
        <div className="flex">
          <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
            <p className="text-gray-800 mb-2">Click below to preview the flow</p>
            <button
              onClick={() => setShowPreview(true)}
              className="text-[#25D366] text-sm font-medium hover:underline"
            >
              Preview Flow
            </button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[#F0F2F5] p-3 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 rounded-full px-4 py-2 border-none focus:ring-0"
          disabled
        />
        <button className="p-2 text-[#075E54] hover:bg-gray-100 rounded-full">
          <Send className="h-6 w-6" />
        </button>
      </div>

      {/* Slide-up Preview */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-xl transform transition-transform duration-300 ease-in-out ${
          showPreview ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '80vh' }}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{screen.title}</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4 pb-28 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 65px)' }}>
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPreview; 