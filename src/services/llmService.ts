
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateChatResponse = async (messages: ChatMessage[], context?: any) => {
  try {
    console.log('Trying to get AI response from Edge Function...');
    
    const functionName = context?.chatType === 'campaign' ? 'campaign_chat' : 'chat';
    console.log(`Invoking Supabase Edge Function: ${functionName}`);
    
    const requestBody = {
      messages,
      context,
      // Note: The edge function should be updated to use "gpt-4o" instead of "gpt-4o-mini"
      // This needs to be changed in the Supabase edge function directly
      model: "gpt-4o" 
    };
    
    console.log(`With data:`, JSON.stringify(requestBody, null, 2));
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: requestBody
    });
    
    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(error.message);
    }
    
    console.log('Edge Function response:', data);
    
    if (!data) {
      throw new Error('No data returned from Edge Function');
    }
    
    console.log('Successfully received AI response:', data.content || data);
    return data;
    
  } catch (error: any) {
    console.error('Error in generateChatResponse:', error);
    throw error;
  }
};
