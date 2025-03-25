import { getGeneratedFlow } from '@/lib/open_api_call';

export const handleGenerateFlow = async (aiPrompt, setError, setIsGenerating, processFlowData, setAiPrompt) => {
  if (!aiPrompt.trim()) {
    setError('Please enter a prompt for the AI assistant');
    return;
  }

  try {
    setIsGenerating(true);
    setError('');
    const generatedFlow = await getGeneratedFlow(aiPrompt);
    if (generatedFlow) {
      let parsedFlow;
      try {
        parsedFlow = JSON.parse(generatedFlow);
      } catch (parseError) {
        throw new Error('Invalid JSON response from AI: ' + parseError.message);
      }
      
      // Process the generated flow using the same function as JSON loading
      processFlowData(parsedFlow);
    }
  } catch (error) {
    console.error('Error generating flow:', error);
    setError('Failed to generate flow: ' + error.message);
  } finally {
    setIsGenerating(false);
    setAiPrompt('');
  }
}; 