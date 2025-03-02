
import { supabase } from "@/integrations/supabase/client";
import { MessageProps } from '@/components/Message';
import { callLLMAPI } from './llmService';
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
    // Create a database-safe version of the response
    // Remove any functions or circular references that can't be stored in JSONB
    const sanitizedMetrics = assistantResponse.metrics 
      ? JSON.parse(JSON.stringify(assistantResponse.metrics))
      : null;
    
    // For action buttons, only save properties that can be stored in the database
    // Remove any functions like onClick handlers
    const sanitizedActionButtons = assistantResponse.actionButtons 
      ? assistantResponse.actionButtons.map(btn => ({
          label: btn.label,
          primary: btn.primary || false
        }))
      : null;
    
    console.log('Sanitized metrics:', sanitizedMetrics);
    console.log('Sanitized action buttons:', sanitizedActionButtons);
    
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        role: 'assistant',
        content: assistantResponse.content,
        title: assistantResponse.title || null,
        metrics: sanitizedMetrics,
        actionbuttons: sanitizedActionButtons
      });

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
    const assistantResponse = await callLLMAPI(content, messages, campaignId, campaignName);
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
