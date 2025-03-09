import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/components/Breadcrumb';

// Utility function to get auth token safely
async function getSupabaseAuthToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || '';
  } catch (error) {
    console.error('Error getting auth token:', error);
    return '';
  }
}

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
  
  // Fetch chat data and messages
  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId || chatId === 'new') {
        setChatData({
          id: 'new',
          title: 'New Chat',
          chat_type: campaignId ? 'campaign' : 'general',
          campaign_id: campaignId || undefined,
          created_at: new Date().toISOString()
        });
        
        // Fetch campaign data for new campaign chats too
        if (campaignId) {
          try {
            const { data: campaignData, error: campaignError } = await supabase
              .from('campaigns')
              .select('*')
              .eq('id', campaignId)
              .single();
              
            if (!campaignError && campaignData) {
              setCampaign(campaignData);
            }
          } catch (err) {
            console.error('Error fetching campaign data for new chat:', err);
          }
        }
        
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log('Fetching chat data for ID:', chatId);
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

  const handleSendMessage = async (overrideMessage?: string) => {
    // If overrideMessage is provided, use that instead of inputValue
    const messageText = overrideMessage || inputValue.trim();
    
    if (!messageText || isSending) return;
    
    const userMessage: Message = {
      role: 'user',
      content: messageText
    };
    
    // Only clear input field if we're using inputValue
    if (!overrideMessage) {
      setInputValue('');
    }
    
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
    console.log('Sending to AI...', { chatId, messageLength: messageHistory.length });
    
    try {
      // Ensure we have a valid auth session for API calls
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session found');
      }
      
      // Format messages for the API
      const formattedMessages = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // System prompt varies by chat type
      let systemPrompt = `You are Adspirer, an AI assistant specialized in digital advertising and marketing. 
Be concise and clear in your responses. Format responses with markdown for readability.`;
      
      // Add system message and context
      const completeMessages = [
        { role: 'system', content: systemPrompt },
        ...formattedMessages
      ];
      
      // Add context about whether this is a campaign chat
      const requestData = { 
        messages: completeMessages,
        context: campaignId ? {
          chatType: 'campaign',
          campaignId,
          campaignName: campaign?.campaign_name || 'Unknown Campaign'
        } : undefined
      };
      
      // Determine which edge function to call based on chat type
      const functionName = campaignId ? 'campaign_chat' : 'chat';
      console.log(`Invoking Supabase Edge Function: ${functionName}`);
      
      // Check for valid configuration before making the call
      if (!supabase.functions) {
        throw new Error('Missing Supabase configuration. Check environment variables.');
      }
      
      // We'll try multiple approaches in sequence:
      // 1. First try via Netlify proxy
      // 2. Then try direct Supabase Edge Function
      // 3. Finally fall back to a basic response if all else fails
      
      let response;
      let errorDetails = [];
      
      // SKIP Netlify proxy entirely - it's not working
      console.log('Bypassing Netlify proxy and going directly to Supabase');
      
      // Try direct Supabase Edge Function call with proper CORS headers
      try {
        console.log('Making direct Supabase Edge Function call with custom fetch');
        
        // Get session for auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.access_token) {
          throw new Error('No authenticated session found');
        }
        
        // Get the anon key
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        if (!supabaseAnonKey) {
          console.error('Missing Supabase Anon Key');
        }
        
        // Manually construct the request to have more control
        const endpoint = `${import.meta.env.VITE_SUPABASE_URL || 'https://wllhsxoabzdzulomizzx.supabase.co'}/functions/v1/${functionName}`;
        console.log(`Calling endpoint directly: ${endpoint}`);
        
        // Manual fetch with proper headers
        const fetchResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
            'x-client-info': 'adspirer-client-browser'
          },
          body: JSON.stringify(requestData)
        });
        
        if (fetchResponse.ok) {
          const jsonResponse = await fetchResponse.json();
          response = { data: jsonResponse, error: null };
          console.log('Direct fetch successful');
        } else {
          const statusText = fetchResponse.statusText;
          const responseText = await fetchResponse.text().catch(() => 'No response body');
          
          const errorMsg = `Direct fetch failed with status: ${fetchResponse.status} ${statusText}, body: ${responseText}`;
          console.error(errorMsg);
          errorDetails.push(errorMsg);
          
          // No throw - we'll use fallback
        }
      } catch (directError) {
        const errorMsg = `Direct fetch error: ${directError.message || directError}`;
        console.error(errorMsg);
        errorDetails.push(errorMsg);
        
        // Try one more time with supabase.functions
        try {
          console.log('Trying with supabase.functions as last resort');
          response = await Promise.race([
            supabase.functions.invoke(functionName, {
              body: requestData
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Supabase Edge Function timeout after 20s')), 20000)
            )
          ]);
          
          console.log('supabase.functions response:', response);
        } catch (supabaseError) {
          const fallbackErrorMsg = `Supabase functions error: ${supabaseError.message || supabaseError}`;
          console.error(fallbackErrorMsg);
          errorDetails.push(fallbackErrorMsg);
        }
      }
      
      // 3. If both approaches failed, use fallback
      if (!response || response.error) {
        console.warn('Using fallback response mechanism');
        
        // Prepare error details for better user experience
        const errorMessage = response?.error 
          ? `API error: ${response.error.message || JSON.stringify(response.error)}`
          : `Failed to get AI response: ${errorDetails.join('; ')}`;
        
        console.error('Error getting AI response:', errorMessage);
        
        // Create a fallback response
        return {
          role: 'assistant' as const,
          content: `I'm sorry, I couldn't connect to the AI service. Here is a basic response:

Your campaign is important! When the full AI service is available, I can provide detailed analytics and insights about your advertising campaigns.

**Troubleshooting**:
- Error details: ${errorDetails.join('\n- ')}
- Please check your internet connection
- Try refreshing the page
- Contact support if this problem persists
`,
          actionButtons: [
            { label: 'Try Again', primary: true },
            { label: 'Campaign Settings' }
          ]
        };
      }
      
      // Process successful response
      console.log('Received AI response', response.data);
      
      if (!response.data || !response.data.content) {
        throw new Error('Invalid response format from AI service');
      }
      
      // Format the assistant response for the UI
      const assistantResponse: Message = {
        role: 'assistant',
        content: response.data.content,
      };
      
      // Add any additional response data
      if (response.data.metrics) {
        assistantResponse.metrics = response.data.metrics;
      }
      
      if (response.data.actionButtons) {
        assistantResponse.actionButtons = response.data.actionButtons;
      }
      
      // Update chat title if this is the first response
      if (messages.length <= 1 && response.data.suggestedTitle) {
        // Store suggested title for later use
        console.log('Received suggested title:', response.data.suggestedTitle);
        
        // Update the chat title in Supabase
        try {
          await supabase
            .from('chats')
            .update({ title: response.data.suggestedTitle })
            .eq('id', chatId);
        } catch (titleUpdateError) {
          console.warn('Failed to update chat title:', titleUpdateError);
        }
      }
      
      return assistantResponse;
    } catch (error) {
      console.error('Error in sendToAI:', error);
      
      // Return a graceful error response
      return {
        role: 'assistant',
        content: `I apologize, but I encountered an error while processing your request: ${error.message || 'Unknown error'}. Please try again later.`,
        actionButtons: [
          { label: 'Try Again', primary: true },
          { label: 'Campaign Settings' }
        ]
      };
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
    const items: BreadcrumbItem[] = [
      { 
        label: "Home", 
        href: "/app",
        type: "home",
        id: "home"
      },
    ];

    // For campaign chats, add the campaign breadcrumb
    if (campaignId) {
      items.push({ 
        label: campaign?.campaign_name || 'Campaign', 
        href: `/campaign/${campaignId}`,
        type: "campaign", 
        id: campaignId
      });
      
      // Always add the chat breadcrumb for the current chat
      items.push({ 
        label: chatData?.title || 'New Chat', 
        href: `/chat/${chatId}?campaign_id=${campaignId}`,
        type: "chat",
        id: chatId || 'new'
      });
    } else {
      // For general chats, just include the chat without campaign context
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
