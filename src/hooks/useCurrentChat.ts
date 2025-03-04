import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/components/Breadcrumb';
import { useAuth } from '@/context/AuthContext';

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
  title?: string;
  metrics?: Array<{ label: string; value: string; improvement?: boolean }>;
  actionButtons?: Array<{ label: string; primary?: boolean }>;
}

interface ChatData {
  id: string;
  title: string;
  chat_type: string;
  campaign_id?: string;
  created_at: string;
}

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_status: string;
}

interface ChatMessage {
  chat_id: string;
  role: string;
  content: string;
  actionbuttons?: any[];
}

interface DbChatMessage {
  chat_id: string;
  role: string;
  content: string;
  actionbuttons?: any[];
}

const ensureValidRole = (role: string): 'user' | 'assistant' | 'system' => {
  if (role === 'user' || role === 'assistant' || role === 'system') {
    return role;
  }
  console.warn(`Invalid role: ${role}, defaulting to 'assistant'`);
  return 'assistant';
};

export const useCurrentChat = () => {
  const { id: chatId } = useParams();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign_id');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  
  useEffect(() => {
    const fetchChatData = async () => {
      if (chatId === 'new') {
        setChatData({
          id: 'new',
          title: 'New Chat',
          chat_type: campaignId ? 'campaign' : 'general',
          campaign_id: campaignId || undefined,
          created_at: new Date().toISOString()
        });
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();
          
        if (chatError) throw chatError;
        setChatData(chatData);
        
        if (chatData.campaign_id) {
          const { data: campaignData, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', chatData.campaign_id)
            .single();
            
          if (!campaignError && campaignData) {
            setCampaign(campaignData);
          }
        }
        
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        if (messagesData && messagesData.length > 0) {
          const validMessages: Message[] = messagesData.map(msg => ({
            id: msg.id,
            role: ensureValidRole(msg.role),
            content: msg.content,
            created_at: msg.created_at
          }));
          
          setMessages(validMessages);
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
        toast.error('Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatData();
  }, [chatId, campaignId]);

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
        
        navigate(`/chat/${newChat.id}${campaignId ? `?campaign_id=${campaignId}` : ''}`);
        
        setChatData(newChat);
        setMessages([{
          id: newMessage.id,
          role: ensureValidRole(newMessage.role),
          content: newMessage.content,
          created_at: newMessage.created_at
        }]);
        
        await sendToAI(newChat.id, [{
          id: newMessage.id,
          role: ensureValidRole(newMessage.role),
          content: newMessage.content,
          created_at: newMessage.created_at
        }]);
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
          role: ensureValidRole(newMessage.role),
          content: newMessage.content,
          created_at: newMessage.created_at
        };
        
        setMessages(prev => 
          prev.map(msg => 
            msg === userMessage ? validMessage : msg
          )
        );
        
        await sendToAI(chatId as string, [...messages, validMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        setIsSending(false);
      }
    }
  };

  const sendToAI = async (chatId: string, messageHistory: Message[]) => {
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
      
      const dbMessage: DbChatMessage = {
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
        const dbMessage: DbChatMessage = {
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

  const handleDeleteChat = async () => {
    if (chatId === 'new') {
      navigate('/app');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', chatId);
        
      if (messagesError) throw messagesError;
      
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
        
      if (chatError) throw chatError;
      
      toast.success('Chat deleted');
      
      if (campaignId) {
        navigate(`/campaign/${campaignId}`);
      } else {
        navigate('/app');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleBackClick = () => {
    if (campaignId) {
      navigate(`/campaign/${campaignId}`);
    } else {
      navigate('/app');
    }
  };

  const getBreadcrumbItems = () => {
    const items: BreadcrumbItem[] = [
      { 
        label: "Home", 
        href: "/app",
        type: "home",
        id: "home"
      },
    ];

    if (campaign) {
      items.push({ 
        label: campaign.campaign_name, 
        href: `/campaign/${campaignId}`,
        type: "campaign", 
        id: campaignId as string 
      });
      
      items.push({ 
        label: chatData?.title || 'New Chat', 
        href: `/chat/${chatId}${campaignId ? `?campaign_id=${campaignId}` : ''}`,
        type: "chat",
        id: chatId || 'new'
      });
    } else {
      items.push({ 
        label: chatData?.title || 'New Chat', 
        href: `/chat/${chatId}`,
        type: "chat",
        id: chatId || 'new'
      });
    }

    return items;
  };

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

export type { ChatData, Campaign };
