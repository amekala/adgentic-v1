import { supabase } from "@/integrations/supabase/client";
import { MessageProps } from '@/components/Message';
import { generateChatResponse } from './llmService';
import { toast } from "sonner";

export const createNewChat = async (
  title: string,
  campaignId: string | null = null
) => {
  console.log('Creating new chat with title:', title.substring(0, 50));
  console.log('Campaign ID:', campaignId);
  
  const chatData = {
    title: title.substring(0, 50),
    chat_type: campaignId ? 'campaign' : 'general',
    ...(campaignId ? { campaign_id: campaignId } : {})
  };
  
  const { data: newChatData, error: chatError } = await supabase
    .from('chats')
    .insert(chatData)
    .select()
    .single();

  if (chatError) {
    console.error('Error creating chat:', chatError);
    throw chatError;
  }

  return newChatData;
};

export const saveUserMessage = async (chatId: string, content: string) => {
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      chat_id: chatId,
      role: 'user',
      content
    });

  if (error) {
    console.error('Error saving user message:', error);
    throw error;
  }
};

export const saveAssistantMessage = async (
  chatId: string,
  assistantResponse: MessageProps
) => {
  try {
    console.log('Saving assistant message with structure:', JSON.stringify(assistantResponse, null, 2));
    
    // Extract title from the assistantResponse if it exists
    const title = assistantResponse.title || null;
    let contentToSave = assistantResponse.content || '';
    
    // If there's a title, prepend it to the content for storage
    // We'll do this only if we need to store the title as part of content
    if (title && !contentToSave.includes(title)) {
      contentToSave = `${title}\n\n${contentToSave}`;
      console.log('Added title to content for storage:', contentToSave.substring(0, 100) + '...');
    }
    
    // Create a clean object with only the properties our database supports
    const messageToSave = {
      chat_id: chatId,
      role: 'assistant',
      content: contentToSave,
      metrics: null,
      actionbuttons: null
    };
    
    // Process metrics if they exist
    if (assistantResponse.metrics && Array.isArray(assistantResponse.metrics)) {
      try {
        // Create a minimal version with only required properties
        const cleanMetrics = assistantResponse.metrics.map(metric => ({
          label: String(metric.label || ''),
          value: String(metric.value || ''),
          improvement: typeof metric.improvement === 'boolean' ? metric.improvement : null
        }));
        
        // Serialize and then deserialize to remove any circular references
        messageToSave.metrics = JSON.parse(JSON.stringify(cleanMetrics));
        console.log('Sanitized metrics to save:', messageToSave.metrics);
      } catch (metricError) {
        console.error('Error processing metrics:', metricError);
        // If there's any error, just don't save the metrics
      }
    }
    
    // Process action buttons if they exist
    if (assistantResponse.actionButtons && Array.isArray(assistantResponse.actionButtons)) {
      try {
        // Create a minimal version with only required properties
        const cleanButtons = assistantResponse.actionButtons.map(btn => ({
          label: String(btn.label || ''),
          primary: typeof btn.primary === 'boolean' ? btn.primary : false
        }));
        
        // Serialize and then deserialize to remove any circular references
        messageToSave.actionbuttons = JSON.parse(JSON.stringify(cleanButtons));
        console.log('Sanitized action buttons to save:', messageToSave.actionbuttons);
      } catch (buttonError) {
        console.error('Error processing action buttons:', buttonError);
        // If there's any error, just don't save the action buttons
      }
    }
    
    console.log('Final message object to save:', messageToSave);
    
    const { error } = await supabase
      .from('chat_messages')
      .insert(messageToSave);

    if (error) {
      console.error('Error saving assistant message:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error processing assistant message for save:', error);
    throw error;
  }
};

export const sendMessage = async (
  content: string,
  chatId: string | null,
  messages: MessageProps[],
  campaignId: string | null = null,
  campaignName: string | null = null,
  setMessages: (messages: MessageProps[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  setChatTitle: (title: string) => void,
  navigate: (path: string) => void
) => {
  if (!content.trim()) {
    toast.error("Please enter a message");
    return null;
  }

  setIsLoading(true);

  try {
    // If there's no chatId, create a new chat
    let currentChatId = chatId !== 'new' ? chatId : null;
    
    if (!currentChatId) {
      const newChatData = await createNewChat(content, campaignId);

      if (newChatData) {
        currentChatId = newChatData.id;
        setChatTitle(newChatData.title);
        console.log('Created new chat with ID:', currentChatId);
        navigate(`/chat/${currentChatId}`);
      }
    }

    const userMessage: MessageProps = {
      role: 'user',
      content
    };

    // Add user message to local state immediately for UI feedback
    setMessages([...messages, userMessage]);
    console.log('Added user message to local state:', userMessage);

    // Save user message to database
    await saveUserMessage(currentChatId!, content);

    // Call the LLM API to get a response
    const assistantResponse = await generateChatResponse(
      messages.map(msg => ({
        role: msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system' 
          ? msg.role 
          : 'assistant',
        content: msg.content
      })).concat([{
        role: 'user',
        content
      }]),
      campaignId ? {
        chatType: 'campaign',
        campaignId,
        campaignName
      } : undefined
    );
    
    console.log('LLM API response:', assistantResponse);

    // Save the assistant's response to the database
    await saveAssistantMessage(currentChatId!, assistantResponse);
    
    // Add the assistant's response to the UI
    setMessages([...messages, userMessage, assistantResponse]);
    setIsLoading(false);
    
    return currentChatId;
  } catch (error: any) {
    console.error('Chat error:', error);
    toast.error(error.message || "Failed to send message");
    setIsLoading(false);
    return null;
  }
};
