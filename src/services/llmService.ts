
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

               IMPORTANT: ALL responses should be well-formatted with a clear structure.

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
               
               For follow-up questions and conversations, ALWAYS use the same JSON structure, even if you don't have metrics
               to share. For example:
               
               \`\`\`json
               {
                 "title": "About Your CPC",
                 "content": "Your Cost Per Click is lower than average because your ad creative has a high relevance score and good click-through rate. This indicates your targeting is effective.",
                 "actionButtons": [
                   {"label": "Improve CTR Further", "primary": true},
                   {"label": "Compare to Industry", "primary": false}
                 ]
               }
               \`\`\`
               
               Always respond with structured, well-formatted information. Start every response with an informative title.`
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
      
      // Make sure we construct a valid MessageProps object
      assistantMessage = {
        role: 'assistant',
        content: structuredData.content || '',
      };
      
      // Only add optional properties if they exist and are valid
      if (structuredData.title) {
        assistantMessage.title = structuredData.title;
      }
      
      if (Array.isArray(structuredData.metrics) && structuredData.metrics.length > 0) {
        assistantMessage.metrics = structuredData.metrics;
      }
      
      if (Array.isArray(structuredData.actionButtons) && structuredData.actionButtons.length > 0) {
        assistantMessage.actionButtons = structuredData.actionButtons;
      }
      
      // Clean up any leftover formatting issues
      assistantMessage.content = assistantMessage.content.trim();
      
      // Log the processed message before returning
      console.log('Processed assistant message:', assistantMessage);
    }
    
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
  // Look for JSON blocks in the response - handle both ```json and just ``` format
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
  
  if (jsonMatch && jsonMatch[1]) {
    try {
      // Parse the JSON
      const jsonString = jsonMatch[1].trim();
      console.log('Attempting to parse JSON:', jsonString);
      
      const structuredData = JSON.parse(jsonString);
      console.log('Found structured data in response:', structuredData);
      
      // Remove the JSON block from the content
      const cleanedContent = content.replace(/```json\n[\s\S]*?\n```/, '').trim() || 
                            content.replace(/```[\s\S]*?```/, '').trim();
      
      // Return a safe object with default values for missing properties
      return {
        title: structuredData.title || '',
        content: structuredData.content || cleanedContent,
        metrics: Array.isArray(structuredData.metrics) ? structuredData.metrics : [],
        actionButtons: Array.isArray(structuredData.actionButtons) ? structuredData.actionButtons : []
      };
    } catch (e) {
      console.error("Error parsing JSON from LLM:", e);
      console.log("Problematic JSON string:", jsonMatch[1]);
    }
  }

  // If no JSON format was found, check if we can structure simple responses for follow-up questions
  // This helps format regular text responses nicely
  const lines = content.split('\n');
  if (lines.length > 0) {
    // If first line is short, treat it as a title
    const firstLine = lines[0].trim();
    if (firstLine.length < 80 && firstLine.length > 0) {
      const remainingContent = lines.slice(1).join('\n').trim();
      return {
        title: firstLine,
        content: remainingContent || firstLine, // Use title as content if no other content
        metrics: [],
        actionButtons: [
          { label: "Tell me more", primary: true },
          { label: "Adjust strategy", primary: false }
        ]
      };
    }
  }
  
  // Auto-format plain text responses into structured JSON format
  // Find a potential title from the first line or create one
  const firstLine = content.split('\n')[0].trim();
  const title = firstLine.length < 50 ? firstLine : "Analysis Results";
  
  // Create a content section from the rest of the message
  let cleanContent = content;
  if (firstLine.length < 50) {
    cleanContent = content.substring(firstLine.length).trim();
  }
  
  // Force structured format with action buttons that make sense for the content
  return {
    title: title,
    content: cleanContent,
    metrics: [],
    actionButtons: [
      { label: "Tell me more", primary: true },
      { label: "Optimize strategy", primary: false }
    ]
  };
}
