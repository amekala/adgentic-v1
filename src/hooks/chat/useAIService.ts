
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, DbMessage, Campaign } from './types';
import { toast } from 'sonner';

export const useAIService = () => {
  const [isSending, setIsSending] = useState(false);

  const sendToAI = async (
    chatId: string, 
    messageHistory: Message[], 
    campaign: Campaign | null, 
    campaignId: string | null, 
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ) => {
    const thinkingMessage: Message = { role: 'assistant', content: '...' };
    setMessages(prev => [...prev, thinkingMessage]);
    
    try {
      const filteredHistory = messageHistory.filter(msg => 
        msg && msg.role && msg.content
      );
      
      const formattedMessages = filteredHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const systemMessage = {
        role: 'system' as const,
        content: campaignId 
          ? `You are Adgentic, an AI assistant specialized in advertising campaigns. This is a conversation about campaign: ${campaign?.campaign_name || 'unknown'}.`
          : `You are Adgentic, an AI assistant specialized in advertising and marketing campaigns.`
      };
      
      const completeMessages = [
        systemMessage,
        ...formattedMessages
      ];
      
      const requestData = { 
        messages: completeMessages,
        context: campaignId ? {
          chatType: 'campaign',
          campaignId,
          campaignName: campaign?.campaign_name || 'Unknown Campaign'
        } : undefined
      };
      
      const functionName = campaignId ? 'campaign_chat' : 'chat';
      console.log(`Invoking Supabase Edge Function: ${functionName}`);
      console.log(`With data:`, JSON.stringify(requestData, null, 2));
      
      const response = await supabase.functions.invoke(functionName, {
        body: requestData
      });
      
      console.log('Edge Function response received:', response);
      
      if (!response) {
        throw new Error('No response received from API');
      }
      
      if (response.error) {
        console.error("API response error:", response.error);
        throw new Error(`API error: ${response.error.message || response.error}`);
      }
      
      const responseData = response.data;
      console.log('Raw response data:', responseData);
      
      if (!responseData) {
        throw new Error('No data in API response');
      }
      
      let responseContent = "I couldn't generate a response.";
      let actionButtons: any[] = [];
      let responseTitle: string | undefined = undefined;
      
      if (typeof responseData === 'string') {
        responseContent = responseData;
      } 
      else if (responseData.content && typeof responseData.content === 'string') {
        responseContent = responseData.content;
        
        if (responseData.actionButtons && Array.isArray(responseData.actionButtons)) {
          actionButtons = responseData.actionButtons;
        }
        
        if (responseData.title) {
          responseTitle = responseData.title;
        }
      }
      else if (responseData.role === 'assistant' && responseData.content) {
        responseContent = responseData.content;
        
        if (responseData.actionButtons && Array.isArray(responseData.actionButtons)) {
          actionButtons = responseData.actionButtons;
        }
      }
      else if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
        responseContent = responseData.choices[0].message.content;
      }
      else {
        console.warn('Unexpected response format:', responseData);
        responseContent = "Received an unexpected response format. Please try again.";
      }
      
      if (typeof responseContent === 'string' && 
         (responseContent.includes('```json') || responseContent.includes('```'))) {
        try {
          const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                          responseContent.match(/```([\s\S]*?)```/);
                          
          if (jsonMatch && jsonMatch[1]) {
            const jsonString = jsonMatch[1].trim();
            const structuredData = JSON.parse(jsonString);
            
            console.log('Found structured data in response:', structuredData);
            
            if (structuredData.title) {
              responseTitle = structuredData.title;
            }
            
            if (structuredData.content) {
              responseContent = structuredData.content;
            } else {
              responseContent = responseContent.replace(/```json\n[\s\S]*?\n```/, '').trim() || 
                              responseContent.replace(/```[\s\S]*?```/, '').trim();
            }
            
            if (structuredData.actionButtons && Array.isArray(structuredData.actionButtons)) {
              actionButtons = structuredData.actionButtons;
            }
          }
        } catch (e) {
          console.error('Error parsing JSON from response:', e);
        }
      }
      
      if (!responseContent || responseContent.trim() === '') {
        responseContent = "I received an empty response from the server. Please try again.";
      }
      
      const assistantResponse: Message = {
        role: 'assistant',
        content: responseContent.trim()
      };
      
      if (responseTitle) {
        assistantResponse.title = responseTitle;
      }
      
      if (actionButtons.length > 0) {
        assistantResponse.actionButtons = actionButtons;
      }
      
      setMessages(prev => prev.map(msg => msg === thinkingMessage ? assistantResponse : msg));
      
      const dbMessage: DbMessage = {
        chat_id: chatId,
        role: 'assistant',
        content: assistantResponse.content
      };
      
      if (assistantResponse.actionButtons && assistantResponse.actionButtons.length > 0) {
        try {
          dbMessage.actionbuttons = assistantResponse.actionButtons;
        } catch (e) {
          console.error('Error serializing action buttons:', e);
        }
      }
      
      const { error } = await supabase
        .from('chat_messages')
        .insert(dbMessage);
        
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = error.message || 'Unknown error';
      const detailMessage = errorMessage.includes('Invalid JSON') 
        ? 'API returned invalid data format. Check Edge Function deployment.'
        : errorMessage.includes('404') 
          ? 'Edge Function not found. Check function deployment.'
          : errorMessage.includes('Missing Supabase configuration')
            ? 'API configuration missing. Check environment variables.'
            : 'API connection failed. Check Supabase configuration.';
      
      toast.error(`Failed to get AI response: ${detailMessage}`);
      
      console.log('Using fallback response mechanism');
      
      const userMessage = messageHistory[messageHistory.length - 1]?.content || '';
      let fallbackResponse = "I'm sorry, I couldn't connect to the AI service. Here is a basic response:";
      let fallbackButtons = [];
      
      if (campaignId) {
        fallbackResponse += "\n\nYour campaign is important! When the full AI service is available, I can provide detailed analytics and insights about your advertising campaigns.";
        fallbackButtons = [
          { label: 'Campaign Settings', primary: false },
          { label: 'Performance Analysis', primary: true },
          { label: 'Budget Allocation', primary: false }
        ];
      } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        fallbackResponse += "\n\nHello! I'm sorry, but I'm currently operating in fallback mode due to connection issues with the AI service. How can I assist you with basic information?";
      } else {
        fallbackResponse += "\n\nI'm operating in fallback mode due to connection issues. Please try again later or check your network connection. You may need to check that your Supabase Edge Function is properly deployed.";
      }
      
      setMessages(prev => 
        prev.map(msg => 
          msg.content === '...' ? {
            role: 'assistant',
            content: fallbackResponse,
            actionButtons: fallbackButtons.length > 0 ? fallbackButtons : undefined
          } : msg
        )
      );
      
      try {
        const dbMessage: DbMessage = {
          chat_id: chatId,
          role: 'assistant',
          content: fallbackResponse
        };
        
        if (fallbackButtons.length > 0) {
          dbMessage.actionbuttons = fallbackButtons;
        }
        
        await supabase
          .from('chat_messages')
          .insert(dbMessage);
      } catch (dbError) {
        console.error('Failed to save fallback response to database:', dbError);
      }
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendToAI,
    isSending,
    setIsSending
  };
};
