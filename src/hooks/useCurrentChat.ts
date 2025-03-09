import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/components/Breadcrumb';

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
    // Add thinking message
    const thinkingMessage: Message = { role: 'assistant', content: '...' };
    setMessages(prev => [...prev, thinkingMessage]);
    
    try {
      // Verify campaign exists first if this is a campaign chat
      if (campaignId) {
        console.log('Verifying campaign data before API call');
        if (!campaign) {
          // Fetch the campaign data first
          try {
            const { data: campaignData, error: campaignError } = await supabase
              .from('campaigns')
              .select('*')
              .eq('id', campaignId)
              .single();
              
            if (campaignError || !campaignData) {
              throw new Error(`Campaign not found: ${campaignError?.message || 'Invalid campaign ID'}`);
            }
            
            // Set the campaign data
            setCampaign(campaignData);
            console.log('Successfully verified campaign exists:', campaignData.campaign_name);
          } catch (err) {
            console.error('Error verifying campaign:', err);
            throw new Error('Failed to validate campaign. Please try again.');
          }
        }
      }
      
      // Ensure all messages are valid
      const filteredHistory = messageHistory.filter(msg => 
        msg && msg.role && msg.content
      );
      
      // Format messages for the AI
      const formattedMessages = filteredHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // System message that will be prepended
      const systemPrompt = campaign 
        ? `You are Adspirer, an AI assistant specialized in advertising campaigns. This is a conversation about campaign: ${campaign?.campaign_name || 'unknown'}.`
        : `You are Adspirer, an AI assistant specialized in advertising and marketing campaigns.`
      
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
      console.log(`With data:`, JSON.stringify(requestData, null, 2));
      
      // Check for valid configuration before making the call
      if (!supabase.functions) {
        throw new Error('Missing Supabase configuration. Check environment variables.');
      }
      
      // Call the appropriate Supabase Edge Function with timeout
      const response = await Promise.race([
        supabase.functions.invoke(functionName, {
          body: requestData
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase Edge Function timeout')), 20000)
        )
      ]);
      
      console.log('Edge Function response received:', response);
      
      // Check if we received a response at all
      if (!response) {
        throw new Error('No response received from API');
      }
      
      // Handle error case
      if (response.error) {
        console.error("API response error:", response.error);
        throw new Error(`API error: ${response.error.message || response.error}`);
      }
      
      // The raw AI response data
      const responseData = response.data;
      console.log('Raw response data:', responseData);
      
      if (!responseData) {
        throw new Error('No data in API response');
      }
      
      // Initialize with defaults
      let responseContent = "I couldn't generate a response.";
      let actionButtons: any[] = [];
      let responseTitle: string | undefined = undefined;
      
      // Handle different response formats
      if (typeof responseData === 'string') {
        // Plain string response
        responseContent = responseData;
      } 
      else if (responseData.content && typeof responseData.content === 'string') {
        // Object with content field ({content: "..."})
        responseContent = responseData.content;
        
        // Check for action buttons in the response
        if (responseData.actionButtons && Array.isArray(responseData.actionButtons)) {
          actionButtons = responseData.actionButtons;
        }
        
        // Check for title in the response
        if (responseData.title) {
          responseTitle = responseData.title;
        }
      }
      else if (responseData.role === 'assistant' && responseData.content) {
        // Format from campaign_chat edge function: {role: "assistant", content: "..."}
        responseContent = responseData.content;
        
        // Campaign chat includes action buttons
        if (responseData.actionButtons && Array.isArray(responseData.actionButtons)) {
          actionButtons = responseData.actionButtons;
        }
      }
      else if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
        // Raw OpenAI API format
        responseContent = responseData.choices[0].message.content;
      }
      else {
        console.warn('Unexpected response format:', responseData);
        responseContent = "Received an unexpected response format. Please try again.";
      }
      
      // Extract structured data from response if it contains JSON
      if (typeof responseContent === 'string' && 
         (responseContent.includes('```json') || responseContent.includes('```'))) {
        try {
          // Look for JSON blocks in the response
          const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                          responseContent.match(/```([\s\S]*?)```/);
                          
          if (jsonMatch && jsonMatch[1]) {
            // Parse the JSON
            const jsonString = jsonMatch[1].trim();
            const structuredData = JSON.parse(jsonString);
            
            console.log('Found structured data in response:', structuredData);
            
            // Extract parts from the structured data
            if (structuredData.title) {
              responseTitle = structuredData.title;
            }
            
            if (structuredData.content) {
              // Replace content with the cleaned version from JSON
              responseContent = structuredData.content;
            } else {
              // Remove the JSON block from the content
              responseContent = responseContent.replace(/```json\n[\s\S]*?\n```/, '').trim() || 
                              responseContent.replace(/```[\s\S]*?```/, '').trim();
            }
            
            // Use action buttons from structured data if available
            if (structuredData.actionButtons && Array.isArray(structuredData.actionButtons)) {
              actionButtons = structuredData.actionButtons;
            }
          }
        } catch (e) {
          console.error('Error parsing JSON from response:', e);
          // If parsing fails, use the full content
        }
      }
      
      // Ensure the content is not empty
      if (!responseContent || responseContent.trim() === '') {
        responseContent = "I received an empty response from the server. Please try again.";
      }
      
      // Build the complete assistant message
      const assistantResponse: Message = {
        role: 'assistant',
        content: responseContent.trim()
      };
      
      // Add optional properties if available
      if (responseTitle) {
        assistantResponse.title = responseTitle;
      }
      
      if (actionButtons.length > 0) {
        assistantResponse.actionButtons = actionButtons;
      }
      
      console.log('Final assistant response:', assistantResponse);
      
      // Replace thinking message with actual response
      setMessages(prev => prev.map(msg => msg === thinkingMessage ? assistantResponse : msg));
      
      // Prepare the message for database storage
      const dbMessage = {
        chat_id: chatId,
        role: 'assistant',
        content: assistantResponse.content
      };
      
      // Add actionbuttons if available
      if (assistantResponse.actionButtons && assistantResponse.actionButtons.length > 0) {
        try {
          // @ts-ignore - actionbuttons is available in the DB but not typed
          dbMessage.actionbuttons = assistantResponse.actionButtons;
        } catch (e) {
          console.error('Error serializing action buttons:', e);
        }
      }
      
      // Save AI response to database
      const { error } = await supabase
        .from('chat_messages')
        .insert(dbMessage);
        
      if (error) throw error;
      
    } catch (error: any) {
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
      
      // Replace thinking message with fallback response
      setMessages(prev => 
        prev.map(msg => 
          msg.content === '...' ? {
            role: 'assistant',
            content: fallbackResponse,
            actionButtons: fallbackButtons.length > 0 ? fallbackButtons : undefined
          } : msg
        )
      );
      
      // Save fallback response to database
      try {
        const dbMessage = {
          chat_id: chatId,
          role: 'assistant',
          content: fallbackResponse
        };
        
        // Add actionbuttons if available
        if (fallbackButtons.length > 0) {
          // @ts-ignore
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
