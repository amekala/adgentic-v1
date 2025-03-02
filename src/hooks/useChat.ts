
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { toast } from "sonner";
import { MessageProps } from '@/components/Message';

// Define a type for the chat_messages table rows
export type ChatMessageRow = {
  chat_id: string;
  content: string;
  created_at: string;
  id: string;
  role: string;
  metrics?: any; // Changed to 'any' to handle JSONB from database
  actionbuttons?: any; // Changed to 'any' to handle JSONB from database
};

export const useChat = (chatId: string | undefined, campaignId: string | null) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState<string>('New Chat');
  const [campaignName, setCampaignName] = useState<string | null>(null);
  const [chatType, setChatType] = useState<'general' | 'campaign'>('general');
  const { toast: useToastFn } = useToast();
  
  // Track conversation context for better follow-up handling
  const [conversationContext, setConversationContext] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!chatId || chatId === 'new') {
      // For new chats, don't load any messages
      console.log('No chatId provided, creating a new chat');
      setMessages([]);
      
      // If campaign_id is in the URL, set it for context
      if (campaignId) {
        try {
          console.log('Fetching campaign data for new chat with campaign ID:', campaignId);
          const { data: campaignData, error } = await supabase
            .from('campaigns')
            .select('campaign_name')
            .eq('id', campaignId)
            .single();
            
          if (error) {
            console.error('Error fetching campaign data:', error);
          } else if (campaignData) {
            console.log('Found campaign name for new chat:', campaignData.campaign_name);
            setCampaignName(campaignData.campaign_name);
            setChatType('campaign');
          }
        } catch (error) {
          console.error('Exception fetching campaign data:', error);
        }
      } else {
        // Make sure we clear campaign name if no campaign ID
        setCampaignName(null);
        setChatType('general');
      }
      return;
    }

    console.log('Fetching messages for chat:', chatId);
    setIsLoading(true);
    
    try {
      // Fetch chat details to get title and campaign association
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('title, campaign_id, chat_type')
        .eq('id', chatId)
        .single();
        
      if (chatData) {
        setChatTitle(chatData.title);
        
        // If this chat belongs to a campaign, fetch campaign details
        if (chatData.campaign_id) {
          const { data: campaignData } = await supabase
            .from('campaigns')
            .select('campaign_name')
            .eq('id', chatData.campaign_id)
            .single();
            
          if (campaignData) {
            setCampaignName(campaignData.campaign_name);
            setChatType('campaign');
          }
        } else {
          setCampaignName(null);
          setChatType('general');
        }
      }
      
      // Fetch messages
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        useToastFn({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive"
        });
        return;
      }

      console.log('Raw data from database:', data);

      if (data && data.length > 0) {
        // Convert data to MessageProps format, properly handling metrics and actionButtons
        const validMessages = data.map((msg: ChatMessageRow) => {
          // Debug each message conversion
          console.log('Processing message:', msg.id, 'role:', msg.role);
          console.log('metrics type:', typeof msg.metrics, 'value:', msg.metrics);
          console.log('actionbuttons type:', typeof msg.actionbuttons, 'value:', msg.actionbuttons);
          
          // Parse potential title from the content
          let title: string | undefined = undefined;
          let content = msg.content;
          
          // Simple heuristic: if the first line is short (< 80 chars), treat it as a title
          if (msg.role === 'assistant' && content) {
            const lines = content.split('\n');
            if (lines.length > 1 && lines[0].length < 80 && lines[1].trim() === '') {
              title = lines[0].trim();
              content = lines.slice(2).join('\n').trim();
            }
          }
          
          return {
            role: msg.role as MessageProps['role'],
            content: content,
            title: title,
            // Since we're using JSONB in the database, no need to parse
            metrics: msg.metrics || undefined,
            actionButtons: msg.actionbuttons || undefined
          };
        });
        
        console.log('Processed messages:', validMessages);
        setMessages(validMessages);
      } else {
        console.log('No messages found for chat:', chatId);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error processing messages:', error);
      useToastFn({
        title: "Error",
        description: "Failed to process chat messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    chatTitle,
    setChatTitle,
    campaignName,
    setCampaignName,
    chatType,
    setChatType,
    fetchMessages,
    conversationContext,
    setConversationContext
  };
};
