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

  const generateResponse = (userMessage: string, previousMessages: MessageProps[]) => {
    // Extract the last few messages to establish context
    const recentMessages = previousMessages.slice(-3);
    const messageLower = userMessage.toLowerCase();
    
    // Determine if this is a follow-up question
    const isFollowUp = previousMessages.length > 0;
    
    // Set conversation context based on the current topic if it's not already set
    if (!conversationContext) {
      if (messageLower.includes('performance') || messageLower.includes('analytics') || messageLower.includes('report')) {
        setConversationContext('performance');
      } else if (messageLower.includes('keyword') || messageLower.includes('search terms')) {
        setConversationContext('keywords');
      } else if (messageLower.includes('budget') || messageLower.includes('spend') || messageLower.includes('allocation')) {
        setConversationContext('budget');
      }
    }
    
    // Handle follow-up questions based on established context
    if (isFollowUp) {
      // Context-aware responses for follow-up questions
      if (conversationContext === 'performance') {
        // Handle follow-up questions about performance
        if (messageLower.includes('why') || messageLower.includes('how') || messageLower.includes('what')) {
          return {
            role: 'assistant' as const,
            content: "Based on your previous question about performance, I can provide more details. Your campaigns are showing an overall strong performance, particularly on Walmart and Instacart because these platforms have lower CPC (Cost Per Click) while maintaining similar conversion rates compared to Amazon. This results in a better ROAS (Return on Ad Spend) on these platforms, which is why I recommend shifting some budget from Amazon to these better-performing channels.",
            metrics: [
              { label: 'Amazon ROAS', value: '3.2x', improvement: false },
              { label: 'Walmart ROAS', value: '4.5x', improvement: true },
              { label: 'Instacart ROAS', value: '5.1x', improvement: true }
            ],
            actionButtons: [
              { label: 'View Platform Comparison', primary: false },
              { label: 'Optimize Budget Now', primary: true }
            ]
          };
        }
      } else if (conversationContext === 'keywords') {
        // Handle follow-up questions about keywords
        if (messageLower.includes('data') || messageLower.includes('give me') || messageLower.includes('show')) {
          return {
            role: 'assistant' as const,
            content: "Here's the keyword performance data you requested for your campaigns:",
            metrics: [
              { label: 'Top Keyword', value: 'organic supplements', improvement: true },
              { label: 'Highest CTR', value: 'vegan protein', improvement: true },
              { label: 'Lowest ACOS', value: 'plant protein', improvement: true },
              { label: 'Most Conversions', value: 'protein powder', improvement: true },
              { label: 'Worst Performer', value: 'discount supplements', improvement: false }
            ],
            actionButtons: [
              { label: 'Download Full Report', primary: false },
              { label: 'Optimize Keywords', primary: true }
            ]
          };
        }
      } else if (conversationContext === 'budget') {
        // Handle follow-up questions about budget allocation
        if (messageLower.includes('increase') || messageLower.includes('amazon') || messageLower.includes('why')) {
          return {
            role: 'assistant' as const,
            content: "You asked why I recommend decreasing Amazon's budget rather than increasing it. Amazon currently has the highest CPC among your channels but shows lower conversion rates compared to Walmart and Instacart. Our data indicates you're paying 23% more per click on Amazon while getting 15% fewer conversions. By shifting budget to the other platforms, you'll likely achieve better overall ROAS and more efficient ad spend.",
            metrics: [
              { label: 'Amazon CPC', value: '$1.27', improvement: false },
              { label: 'Walmart CPC', value: '$0.92', improvement: true },
              { label: 'Instacart CPC', value: '$0.84', improvement: true },
              { label: 'Amazon Conv. Rate', value: '3.1%', improvement: false },
              { label: 'Other Platforms Avg', value: '4.2%', improvement: true }
            ],
            actionButtons: [
              { label: 'View Detailed Analysis', primary: false },
              { label: 'Maintain Amazon Budget', primary: false },
              { label: 'Apply Recommendations', primary: true }
            ]
          };
        }
      }
    }
    
    // If no specific context is set or the follow-up doesn't match contextual patterns,
    // fall back to the original keyword-based responses
    
    if (messageLower.includes('performance') || messageLower.includes('analytics') || messageLower.includes('report')) {
      setConversationContext('performance');
      return {
        role: 'assistant' as const,
        content: "# Performance Report\n\nHere's the performance data for your campaigns over the past 7 days:\n\nYour campaigns are showing strong overall performance with improvements in most key metrics. CTR has increased by 0.3% and ACOS has decreased by 1.2% compared to the previous period.",
        metrics: [
          { label: 'Impressions', value: '142,587', improvement: true },
          { label: 'Clicks', value: '3,842', improvement: true },
          { label: 'CTR', value: '2.69%', improvement: true },
          { label: 'ACOS', value: '15.8%', improvement: true },
          { label: 'Spend', value: '$4,215', improvement: false },
          { label: 'Sales', value: '$26,678', improvement: true }
        ],
        actionButtons: [
          { label: 'View Detailed Report', primary: false },
          { label: 'Optimize Campaigns', primary: true }
        ]
      };
    }
    
    else if (messageLower.includes('keyword') || messageLower.includes('search terms')) {
      setConversationContext('keywords');
      return {
        role: 'assistant' as const,
        content: "# Keyword Recommendations\n\nBased on your campaign performance, I recommend the following keyword changes:\n\n- Add \"organic protein powder\" as a broad match\n- Increase bid on \"vegan supplements\" by 15%\n- Pause \"discount protein\" due to low conversion\n- Add negative keyword \"sample\" to reduce irrelevant clicks",
        metrics: [
          { label: 'Under-performing Keywords', value: '8', improvement: false },
          { label: 'Suggested New Keywords', value: '12', improvement: true },
          { label: 'Potential CTR Increase', value: '23%', improvement: true },
          { label: 'Estimated ACOS Impact', value: '-12%', improvement: true }
        ],
        actionButtons: [
          { label: 'Review All Changes', primary: false },
          { label: 'Apply Recommendations', primary: true }
        ]
      };
    }
    
    else if (messageLower.includes('budget') || messageLower.includes('spend') || messageLower.includes('allocation')) {
      setConversationContext('budget');
      return {
        role: 'assistant' as const,
        content: "# Budget Allocation Recommendations\n\nBased on ROAS analysis, I recommend the following budget allocation:\n\nYour current budget allocation is showing strong performance on Walmart and Instacart. I recommend shifting 15% of your Amazon budget to these channels to maximize overall ROAS.",
        metrics: [
          { label: 'Amazon (current)', value: '65%', improvement: false },
          { label: 'Amazon (recommended)', value: '50%', improvement: true },
          { label: 'Walmart (current)', value: '25%', improvement: false },
          { label: 'Walmart (recommended)', value: '30%', improvement: true },
          { label: 'Instacart (current)', value: '10%', improvement: false },
          { label: 'Instacart (recommended)', value: '20%', improvement: true }
        ],
        actionButtons: [
          { label: 'Adjust Manually', primary: false },
          { label: 'Apply Recommendations', primary: true }
        ]
      };
    }
    
    else {
      // Reset context if user asks something unrelated to previous topics
      setConversationContext(null);
      return {
        role: 'assistant' as const,
        content: "# Adgentic Assistant\n\nI'm here to help optimize your retail media campaigns. You can ask me about:\n\n- Performance analytics and insights\n- Keyword optimization and recommendations\n- Budget allocation across channels\n- Campaign creation and management\n\nWhat would you like help with today?",
        actionButtons: [
          { label: 'Performance Analysis', primary: false },
          { label: 'Keyword Optimization', primary: false },
          { label: 'Budget Allocation', primary: false },
          { label: 'Create Campaign', primary: true }
        ]
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

      // Generate AI response with context from previous messages
      setTimeout(async () => {
        // Pass the current messages array to provide context
        const assistantResponse = generateResponse(content, messages);
        console.log('Generated assistant response:', assistantResponse);

        // Direct insertion of metrics and actionButtons as JSONB
        const { error: aiInsertError } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: currentChatId,
            role: 'assistant',
            content: assistantResponse.content,
            metrics: assistantResponse.metrics || null,
            actionbuttons: assistantResponse.actionButtons || null
          });

        if (aiInsertError) {
          console.error('Error saving assistant message:', aiInsertError);
          throw aiInsertError;
        }
        
        setMessages(prevMessages => [...prevMessages, assistantResponse]);
        setIsLoading(false);
      }, 1000);

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
