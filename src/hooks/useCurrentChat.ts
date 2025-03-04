
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useChatData } from './chat/useChatData';
import { useAIService } from './chat/useAIService';
import { useChatOperations } from './chat/useChatOperations';
import { formatBreadcrumbItems } from './chat/chatUtils';
import { Message, ChatData, Campaign, UseCurrentChatResult } from './chat/types';

export { type Message, type ChatData, type Campaign };

export const useCurrentChat = (): UseCurrentChatResult => {
  const { id: chatId } = useParams();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign_id');
  const { user } = useAuth();
  
  const [inputValue, setInputValue] = useState('');
  
  const { messages, setMessages, isLoading, chatData, campaign } = useChatData(chatId, campaignId, user?.id);
  const { sendToAI, isSending, setIsSending } = useAIService();
  const { deleteChat, navigateBack } = useChatOperations();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;
    
    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim()
    };
    
    setInputValue('');
    
    if (chatId === 'new') {
      try {
        setIsSending(true);
        
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            title: userMessage.content.length > 30 
              ? userMessage.content.substring(0, 30) + '...' 
              : userMessage.content,
            chat_type: campaignId ? 'campaign' : 'general',
            campaign_id: campaignId || null,
            created_by: user?.id
          })
          .select()
          .single();
          
        if (chatError) throw chatError;
        
        const { data: newMessage, error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: newChat.id,
            role: userMessage.role,
            content: userMessage.content
          })
          .select()
          .single();
          
        if (messageError) throw messageError;
        
        // Use the navigate function from useChatOperations
        navigateBack(campaignId);
        navigateBack(`/chat/${newChat.id}${campaignId ? `?campaign_id=${campaignId}` : ''}`);
        
        const validMessage: Message = {
          id: newMessage.id,
          role: newMessage.role as 'user' | 'assistant' | 'system',
          content: newMessage.content,
          created_at: newMessage.created_at
        };
        
        setMessages([validMessage]);
        
        await sendToAI(newChat.id, [validMessage], campaign, campaignId, setMessages);
      } catch (error) {
        console.error('Error creating chat:', error);
        toast.error('Failed to create chat');
        setIsSending(false);
      }
    } else {
      try {
        setIsSending(true);
        setMessages(prev => [...prev, userMessage]);
        
        const { data: newMessage, error } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            role: userMessage.role,
            content: userMessage.content
          })
          .select()
          .single();
          
        if (error) throw error;
        
        const validMessage: Message = {
          id: newMessage.id,
          role: newMessage.role as 'user' | 'assistant' | 'system',
          content: newMessage.content,
          created_at: newMessage.created_at
        };
        
        setMessages(prev => 
          prev.map(msg => 
            msg === userMessage ? validMessage : msg
          )
        );
        
        await sendToAI(chatId as string, [...messages, validMessage], campaign, campaignId, setMessages);
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        setIsSending(false);
      }
    }
  };

  const handleDeleteChat = () => deleteChat(chatId || 'new', campaignId);
  const handleBackClick = () => navigateBack(campaignId);
  const getBreadcrumbItems = () => formatBreadcrumbItems(chatData, chatId, campaignId, campaign);

  return {
    chatId,
    campaignId,
    messages,
    inputValue,
    isLoading,
    isSending,
    chatData,
    campaign,
    handleInputChange,
    handleSendMessage,
    handleDeleteChat,
    handleBackClick,
    getBreadcrumbItems,
    setInputValue
  };
};
