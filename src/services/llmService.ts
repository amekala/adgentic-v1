
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

               When providing data-rich responses, use this JSON format inside your response:
               \`\`\`json
               {
                 "title": "Your Response Title",
                 "content": "Your detailed explanation here...",
                 "metrics": [
                   {"label": "Metric Name", "value": "Metric Value", "improvement": true/false},
                   ...
                 ],
                 "actionButtons": [
                   {"label": "Button Text", "primary": true/false},
                   ...
                 ]
               }
               \`\`\`
               
               For non-data responses, just respond normally. Use markdown formatting for better readability.`
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
      // Extract structured data if present
      const structuredData = extractStructuredData(data.content);
      
      assistantMessage = {
        role: 'assistant',
        content: structuredData.content,
        metrics: structuredData.metrics.length > 0 ? structuredData.metrics : undefined,
        actionButtons: structuredData.actionButtons.length > 0 ? structuredData.actionButtons : undefined
      };
      
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

// Function to extract structured data from LLM response
function extractStructuredData(content: string) {
  // Look for JSON blocks in the response
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  
  if (jsonMatch && jsonMatch[1]) {
    try {
      // Parse the JSON
      const structuredData = JSON.parse(jsonMatch[1]);
      
      // Remove the JSON block from the content
      const cleanedContent = content.replace(/```json\n[\s\S]*?\n```/, '').trim();
      
      return {
        title: structuredData.title,
        content: structuredData.content || cleanedContent,
        metrics: structuredData.metrics || [],
        actionButtons: structuredData.actionButtons || []
      };
    } catch (e) {
      console.error("Error parsing JSON from LLM:", e);
    }
  }
  
  // Return original content if no valid JSON found
  return {
    content,
    metrics: [],
    actionButtons: []
  };
}
