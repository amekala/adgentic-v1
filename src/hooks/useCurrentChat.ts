
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
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

// Helper function to ensure role is valid
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
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  
  // Check if Supabase configuration is available
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  useEffect(() => {
    const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
    if (!isSupabaseConfigured) {
      console.error('Supabase configuration is missing. Check environment variables.');
      toast.error('API configuration missing. Contact administrator.');
    } else {
      console.log('Supabase is configured with URL:', supabaseUrl);
    }
  }, []);

  // Fetch chat data and messages
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
        // Fetch chat data
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();
          
        if (chatError) throw chatError;
        setChatData(chatData);
        
        // If this is a campaign chat, fetch campaign data
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
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        if (messagesData && messagesData.length > 0) {
          // Convert DB messages to valid Message objects with type assertion
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
    
    // For new chats, create the chat first
    if (chatId === 'new') {
      try {
        setIsSending(true);
        
        // Create a new chat
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            title: userMessage.content.length > 30 
              ? userMessage.content.substring(0, 30) + '...' 
              : userMessage.content,
            chat_type: campaignId ? 'campaign' : 'general',
            campaign_id: campaignId || null
          })
          .select()
          .single();
          
        if (chatError) throw chatError;
        
        // Add the message to the new chat
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
        
        // Navigate to the new chat
        navigate(`/chat/${newChat.id}${campaignId ? `?campaign_id=${campaignId}` : ''}`);
        
        // Update local state
        setChatData(newChat);
        setMessages([{
          id: newMessage.id,
          role: ensureValidRole(newMessage.role),
          content: newMessage.content,
          created_at: newMessage.created_at
        }]);
        
        // Send to AI
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
      // For existing chats, just add the message
      try {
        setIsSending(true);
        setMessages(prev => [...prev, userMessage]);
        
        // Save message to database
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
        
        // Convert DB message to valid Message object
        const validMessage: Message = {
          id: newMessage.id,
          role: ensureValidRole(newMessage.role),
          content: newMessage.content,
          created_at: newMessage.created_at
        };
        
        // Update messages with the saved message
        setMessages(prev => 
          prev.map(msg => 
            msg === userMessage ? validMessage : msg
          )
        );
        
        // Send to AI
        await sendToAI(chatId as string, [...messages, validMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        setIsSending(false);
      }
    }
  };

  const sendToAI = async (chatId: string, messageHistory: Message[]) => {
    // Add thinking message
    const thinkingMessage: Message = { role: 'assistant', content: '...' };
    setMessages(prev => [...prev, thinkingMessage]);
    
    try {
      // Format messages for the AI
      const formattedMessages = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Extract Supabase URL and key for clarity
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Sanity check configuration
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase configuration. Check environment variables.');
      }
      
      // Log details about the request
      console.log(`Calling Supabase Edge Function at: ${supabaseUrl}/functions/v1/chat`);
      console.log('Message history length:', messageHistory.length);
      console.log("Calling AI with messages:", formattedMessages);
      
      // Call the Supabase Edge Function with enhanced request options
      const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'Accept': 'application/json',
          'X-Client-Info': 'adgentic-web-app'
        },
        // Add CORS mode and credentials to handle CORS issues
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ messages: formattedMessages })
      });
      
      // Check if we received a response at all
      if (!response) {
        throw new Error('No response received from API');
      }
      
      console.log('API Response Status:', response.status, response.statusText);
      
      // Get response as text first for debugging
      const responseText = await response.text();
      console.log('Raw API response (first 100 chars):', responseText.substring(0, 100) + '...');
      
      // Handle non-success HTTP status codes
      if (!response.ok) {
        console.error("API response error:", response.status, responseText);
        throw new Error(`API responded with status ${response.status}: ${responseText.substring(0, 100)}...`);
      }
      
      // Try to parse the response as JSON
      let aiResponse;
      try {
        aiResponse = JSON.parse(responseText);
        console.log("Received AI response:", aiResponse);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text (first 200 chars):', responseText.substring(0, 200));
        throw new Error('Invalid JSON response from API');
      }
      
      // Validate the response structure
      if (!aiResponse || !aiResponse.content) {
        console.error('Invalid AI response structure:', aiResponse);
        throw new Error('AI response missing required content');
      }
      
      // Replace thinking message with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg === thinkingMessage ? {
            role: 'assistant',
            content: aiResponse.content || "I couldn't generate a response."
          } : msg
        )
      );
      
      // Save AI response to database
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          role: 'assistant',
          content: aiResponse.content || "I couldn't generate a response."
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Provide more detailed error message to the user
      const errorMessage = error.message || 'Unknown error';
      const detailMessage = errorMessage.includes('Invalid JSON') 
        ? 'API returned invalid data format. Check Edge Function deployment.'
        : errorMessage.includes('404') 
          ? 'Edge Function not found. Check function deployment.'
          : errorMessage.includes('Missing Supabase configuration')
            ? 'API configuration missing. Check environment variables.'
            : 'API connection failed. Check Supabase configuration.';
      
      toast.error(`Failed to get AI response: ${detailMessage}`);
      
      // Fallback mechanism - generate a basic response without calling API
      console.log('Using fallback response mechanism');
      
      // Generate a basic fallback response
      const userMessage = messageHistory[messageHistory.length - 1]?.content || '';
      let fallbackResponse = "I'm sorry, I couldn't connect to the AI service. Here is a basic response:";
      
      if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        fallbackResponse += "\n\nHello! I'm sorry, but I'm currently operating in fallback mode due to connection issues with the AI service. How can I assist you with basic information?";
      } else if (userMessage.toLowerCase().includes('campaign')) {
        fallbackResponse += "\n\nYour campaign is important! When the full AI service is available, I can provide detailed analytics and insights about your advertising campaigns.";
      } else {
        fallbackResponse += "\n\nI'm operating in fallback mode due to connection issues. Please try again later or check your network connection. You may need to check that your Supabase Edge Function is properly deployed.";
      }
      
      // Replace thinking message with fallback response
      setMessages(prev => 
        prev.map(msg => 
          msg.content === '...' ? {
            role: 'assistant',
            content: fallbackResponse
          } : msg
        )
      );
      
      // Save fallback response to database
      try {
        await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            role: 'assistant',
            content: fallbackResponse
          });
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
      // Delete all messages first (due to foreign key constraints)
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', chatId);
        
      if (messagesError) throw messagesError;
      
      // Then delete the chat
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
        
      if (chatError) throw chatError;
      
      toast.success('Chat deleted');
      
      // Navigate back to campaign or home
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

  // Breadcrumb items with proper type information
  const getBreadcrumbItems = () => {
    const items = [
      { 
        label: "Home", 
        href: "/app",
        type: "home" as const,
        id: "home"
      },
    ];

    // For campaign chats, add the campaign breadcrumb
    if (campaign) {
      items.push({ 
        label: campaign.campaign_name, 
        href: `/campaign/${campaignId}`,
        type: "campaign" as const, 
        id: campaignId as string 
      });
      
      // For campaign chats, ensure we include the campaign ID in the chat URL
      // Always add the chat breadcrumb for the current chat
      items.push({ 
        label: chatData?.title || 'New Chat', 
        href: `/chat/${chatId}${campaignId ? `?campaign_id=${campaignId}` : ''}`,
        type: "chat" as const,
        id: chatId || 'new'
      });
    } else {
      // For general chats, just include the chat without campaign context
      items.push({ 
        label: chatData?.title || 'New Chat', 
        href: `/chat/${chatId}`,
        type: "chat" as const,
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

export type { Message, ChatData, Campaign };
