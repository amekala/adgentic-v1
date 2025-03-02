
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import ChatActionPills from '@/components/ChatActionPills';
import { useToast } from '@/hooks/use-toast';
import { toast } from "sonner";
import { MessageProps } from '@/components/Message';

// Define a type for the chat_messages table rows
type ChatMessageRow = {
  chat_id: string;
  content: string;
  created_at: string;
  id: string;
  role: string;
  metrics?: any; // Changed to 'any' to handle JSONB from database
  actionbuttons?: any; // Changed to 'any' to handle JSONB from database
};

const Chat = () => {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState<string>('New Chat');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState<string | null>(null);
  const { toast: useToastFn } = useToast();
  
  // Extract campaign_id from URL query params if present
  const searchParams = new URLSearchParams(location.search);
  const queryCampaignId = searchParams.get('campaign_id');

  // Track conversation context for better follow-up handling
  const [conversationContext, setConversationContext] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId || chatId === 'new') {
        // For new chats, don't load any messages
        console.log('No chatId provided, creating a new chat');
        setMessages([]);
        
        // If campaign_id is in the URL, set it for context
        if (queryCampaignId) {
          setCampaignId(queryCampaignId);
          try {
            const { data: campaignData } = await supabase
              .from('campaigns')
              .select('campaign_name')
              .eq('id', queryCampaignId)
              .single();
              
            if (campaignData) {
              setCampaignName(campaignData.campaign_name);
            }
          } catch (error) {
            console.error('Error fetching campaign data:', error);
          }
        }
        return;
      }

      console.log('Fetching messages for chat:', chatId);
      setIsLoading(true);
      
      try {
        // Fetch chat details to get title and campaign association
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('title, campaign_id')
          .eq('id', chatId)
          .single();
          
        if (chatData) {
          setChatTitle(chatData.title);
          
          // If this chat belongs to a campaign, fetch campaign details
          if (chatData.campaign_id) {
            setCampaignId(chatData.campaign_id);
            const { data: campaignData } = await supabase
              .from('campaigns')
              .select('campaign_name')
              .eq('id', chatData.campaign_id)
              .single();
              
            if (campaignData) {
              setCampaignName(campaignData.campaign_name);
            }
          } else {
            setCampaignId(null);
            setCampaignName(null);
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
            
            return {
              role: msg.role as MessageProps['role'],
              content: msg.content,
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

    fetchMessages();
  }, [chatId, useToastFn, queryCampaignId]);

  // Function to call the OpenAI integration via Supabase Edge Function
  const callLLMAPI = async (userMessage: string, previousMessages: MessageProps[]): Promise<MessageProps> => {
    try {
      console.log('Calling LLM API with message:', userMessage);
      
      // Prepare messages in the format expected by the Edge Function
      const messageHistory = previousMessages.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      }));
      
      // Add context about campaigns if available
      const campaignContext = campaignId 
        ? `This is a conversation about the campaign: ${campaignName || 'unknown'}. `
        : 'This is a general conversation about retail media campaigns. ';
        
      const systemMessage = {
        role: 'system' as const,
        content: `You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. 
                 ${campaignContext}
                 You help users optimize their ad campaigns and provide insights on marketing strategies.
                 When appropriate, you may include metrics and action buttons in your response.
                 For metrics, use the format: [{"label": "Metric Name", "value": "Metric Value", "improvement": true/false}]
                 For action buttons, use: [{"label": "Button Text", "primary": true/false}]`
      };
      
      // Add the new user message
      messageHistory.unshift(systemMessage);
      messageHistory.push({
        role: 'user' as const,
        content: userMessage
      });
      
      console.log('Sending message history to edge function:', messageHistory);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: messageHistory }
      });
      
      if (error) {
        console.error('Error calling OpenAI via Edge Function:', error);
        throw new Error(error.message || 'Failed to get response from AI');
      }
      
      console.log('Raw response from Edge Function:', data);
      
      // Process the response from the LLM
      // The Edge Function should return an object with role and content
      let assistantMessage: MessageProps = {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue processing your request.'
      };
      
      if (data && data.content) {
        assistantMessage = {
          role: 'assistant',
          content: data.content
        };
        
        // Try to extract metrics and action buttons from the response if they exist
        try {
          // Look for metrics in the format [{"label": "Metric Name", "value": "Metric Value", "improvement": true/false}]
          const metricsMatch = data.content.match(/\[\s*\{\s*"label":\s*".*?"\s*,\s*"value":\s*".*?"\s*,\s*"improvement":\s*(true|false)\s*\}.*?\]/);
          if (metricsMatch) {
            try {
              const metricsJson = JSON.parse(metricsMatch[0]);
              assistantMessage.metrics = metricsJson;
              // Remove the metrics JSON from the content
              assistantMessage.content = assistantMessage.content.replace(metricsMatch[0], '');
            } catch (e) {
              console.error('Failed to parse metrics JSON:', e);
            }
          }
          
          // Look for action buttons in the format [{"label": "Button Text", "primary": true/false}]
          const buttonsMatch = data.content.match(/\[\s*\{\s*"label":\s*".*?"\s*,\s*"primary":\s*(true|false)\s*\}.*?\]/);
          if (buttonsMatch) {
            try {
              const buttonsJson = JSON.parse(buttonsMatch[0]);
              assistantMessage.actionButtons = buttonsJson;
              // Remove the buttons JSON from the content
              assistantMessage.content = assistantMessage.content.replace(buttonsMatch[0], '');
            } catch (e) {
              console.error('Failed to parse action buttons JSON:', e);
            }
          }
        } catch (e) {
          console.error('Error processing response extras:', e);
        }
        
        // Clean up any leftover formatting issues
        assistantMessage.content = assistantMessage.content.trim();
      }
      
      console.log('Processed assistant message:', assistantMessage);
      return assistantMessage;
    } catch (error) {
      console.error('Error in callLLMAPI:', error);
      return {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue connecting to my knowledge base. Please try again in a moment.'
      };
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsLoading(true);

    try {
      // If there's no chatId, create a new chat
      let currentChatId = chatId !== 'new' ? chatId : null;
      
      if (!currentChatId) {
        console.log('Creating new chat with title:', content.substring(0, 50));
        console.log('Campaign ID:', campaignId || queryCampaignId);
        
        const effectiveCampaignId = campaignId || queryCampaignId;
        
        const chatData = {
          title: content.substring(0, 50),
          chat_type: effectiveCampaignId ? 'campaign' : 'general',
          ...(effectiveCampaignId ? { campaign_id: effectiveCampaignId } : {})
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
      setMessages(prevMessages => [...prevMessages, userMessage]);
      console.log('Added user message to local state:', userMessage);

      // Save user message to database
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: currentChatId,
          role: 'user',
          content: content
        });

      if (insertError) {
        console.error('Error saving user message:', insertError);
        throw insertError;
      }

      // Call the LLM API to get a response
      const assistantResponse = await callLLMAPI(content, messages);
      console.log('LLM API response:', assistantResponse);

      // Create a database-safe version of the response without onClick functions
      // We only need to store label and primary properties for action buttons
      const dbSafeActionButtons = assistantResponse.actionButtons 
        ? assistantResponse.actionButtons.map(btn => ({
            label: btn.label,
            primary: btn.primary
          })) 
        : null;

      // Save the assistant's response to the database
      const { error: aiInsertError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: currentChatId,
          role: 'assistant',
          content: assistantResponse.content,
          metrics: assistantResponse.metrics || null,
          actionbuttons: dbSafeActionButtons
        });

      if (aiInsertError) {
        console.error('Error saving assistant message:', aiInsertError);
        throw aiInsertError;
      }
      
      // Add the assistant's response to the UI
      setMessages(prevMessages => [...prevMessages, assistantResponse]);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || "Failed to send message");
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action === "Apply Recommendations" || action === "Optimize Campaigns") {
      toast.success("Recommendations applied successfully!");
    } else if (action === "View Detailed Report") {
      navigate(`/campaign/${campaignId || 'new'}`);
    } else {
      handleSendMessage(`Tell me more about ${action}`);
    }
  };

  const handlePillClick = (message: string) => {
    handleSendMessage(message);
  };

  // Updated Sidebar with navigation for new campaign chats
  const handleNewCampaign = () => {
    navigate('/campaign/new');
  };

  return (
    <div className="flex h-screen bg-[#343541]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={handleNewCampaign}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          title={chatTitle}
          campaignId={campaignId || undefined}
          campaignName={campaignName || undefined}
        />
        
        <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <h2 className="text-2xl font-bold text-white mb-8">Adgentic Chat Assistant</h2>
              <ChatActionPills onPillClick={handlePillClick} className="mb-8" />
            </div>
          ) : (
            <MessageList 
              messages={messages} 
              onActionClick={handleActionClick} 
              onPillClick={handlePillClick}
            />
          )}
          <div className="space-y-4 mt-auto px-4">
            <div className="w-full max-w-3xl mx-auto">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
            <div className="text-xs text-center text-gray-500">
              Adgentic can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
