
import { supabase } from "@/integrations/supabase/client";
import { MessageProps } from '@/components/Message';

// Function to call the OpenAI integration via Supabase Edge Function
export const callLLMAPI = async (
  userMessage: string, 
  previousMessages: MessageProps[], 
  campaignId: string | null = null, 
  campaignName: string | null = null
): Promise<MessageProps> => {
  try {
    console.log('Calling LLM API with message:', userMessage);
    
    // Prepare messages in the format expected by the Edge Function
    const messageHistory = previousMessages.map(msg => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content
    }));
    
    // Add context about campaigns if available
    const campaignContext = campaignId 
      ? `This is a conversation about the campaign: ${campaignName || 'unknown'}. `
      : 'This is a general conversation about retail media campaigns. ';
      
    const systemMessage = {
      role: 'system' as const,
      content: `You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. 
               ${campaignContext}
               You help users optimize their ad campaigns and provide insights on marketing strategies.
               When appropriate, you may include metrics and action buttons in your response.
               For metrics, use the format: [{"label": "Metric Name", "value": "Metric Value", "improvement": true/false}]
               For action buttons, use: [{"label": "Button Text", "primary": true/false}]`
    };
    
    // Add the new user message
    messageHistory.unshift(systemMessage);
    messageHistory.push({
      role: 'user' as const,
      content: userMessage
    });
    
    console.log('Sending message history to edge function:', messageHistory);
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { messages: messageHistory }
    });
    
    if (error) {
      console.error('Error calling OpenAI via Edge Function:', error);
      throw new Error(error.message || 'Failed to get response from AI');
    }
    
    console.log('Raw response from Edge Function:', data);
    
    // Process the response from the LLM
    // The Edge Function should return an object with role and content
    let assistantMessage: MessageProps = {
      role: 'assistant',
      content: 'I apologize, but I encountered an issue processing your request.'
    };
    
    if (data && data.content) {
      assistantMessage = {
        role: 'assistant',
        content: data.content
      };
      
      // Try to extract metrics and action buttons from the response if they exist
      try {
        // Look for metrics in the format [{"label": "Metric Name", "value": "Metric Value", "improvement": true/false}]
        const metricsMatch = data.content.match(/\[\s*\{\s*"label":\s*".*?"\s*,\s*"value":\s*".*?"\s*,\s*"improvement":\s*(true|false)\s*\}.*?\]/);
        if (metricsMatch) {
          try {
            const metricsJson = JSON.parse(metricsMatch[0]);
            assistantMessage.metrics = metricsJson;
            // Remove the metrics JSON from the content
            assistantMessage.content = assistantMessage.content.replace(metricsMatch[0], '');
          } catch (e) {
            console.error('Failed to parse metrics JSON:', e);
          }
        }
        
        // Look for action buttons in the format [{"label": "Button Text", "primary": true/false}]
        const buttonsMatch = data.content.match(/\[\s*\{\s*"label":\s*".*?"\s*,\s*"primary":\s*(true|false)\s*\}.*?\]/);
        if (buttonsMatch) {
          try {
            const buttonsJson = JSON.parse(buttonsMatch[0]);
            assistantMessage.actionButtons = buttonsJson;
            // Remove the buttons JSON from the content
            assistantMessage.content = assistantMessage.content.replace(buttonsMatch[0], '');
          } catch (e) {
            console.error('Failed to parse action buttons JSON:', e);
          }
        }
      } catch (e) {
        console.error('Error processing response extras:', e);
      }
      
      // Clean up any leftover formatting issues
      assistantMessage.content = assistantMessage.content.trim();
    }
    
    console.log('Processed assistant message:', assistantMessage);
    return assistantMessage;
  } catch (error) {
    console.error('Error in callLLMAPI:', error);
    return {
      role: 'assistant',
      content: 'I apologize, but I encountered an issue connecting to my knowledge base. Please try again in a moment.'
    };
  }
};
