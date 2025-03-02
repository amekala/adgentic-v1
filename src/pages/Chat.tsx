import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import { useToast } from '@/hooks/use-toast';
import { MessageProps } from '@/components/Message';

// Define a type for the chat_messages table rows
type ChatMessageRow = {
  chat_id: string;
  content: string;
  created_at: string;
  id: string;
  role: string;
  metrics?: string; // Optional fields for metrics and actionButtons
  actionButtons?: string;
};

const Chat = () => {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      console.log('Fetching messages for chat:', chatId);
      
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (chatId) {
        query = query.eq('chat_id', chatId);
      } else {
        // For new chats, don't load any messages
        return;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        console.log('Fetched messages:', data);
        // Safely convert data to MessageProps format
        const validMessages = data.map((msg: ChatMessageRow) => ({
          role: msg.role as MessageProps['role'],
          content: msg.content,
          metrics: msg.metrics ? JSON.parse(msg.metrics) : undefined,
          actionButtons: msg.actionButtons ? JSON.parse(msg.actionButtons) : undefined
        }));
        setMessages(validMessages);
      }
    };

    fetchMessages();
  }, [chatId, toast]);

  const generateResponse = (userMessage: string) => {
    const messageLower = userMessage.toLowerCase();
    
    if (messageLower.includes('performance') || messageLower.includes('analytics') || messageLower.includes('report')) {
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
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!chatId) {
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .insert({
            title: content.substring(0, 50),
            chat_type: 'campaign'
          })
          .select()
          .single();

        if (chatError) throw chatError;

        if (chatData) {
          navigate(`/chat/${chatData.id}`);
          return;
        }
      }

      const userMessage: MessageProps = {
        role: 'user',
        content
      };

      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          role: 'user',
          content: content
        });

      if (insertError) throw insertError;

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      setTimeout(async () => {
        const assistantResponse = generateResponse(content);

        // When inserting assistant response, include metrics and actionButtons as JSON strings
        const { error: aiInsertError } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            role: 'assistant',
            content: assistantResponse.content,
            metrics: assistantResponse.metrics ? JSON.stringify(assistantResponse.metrics) : null,
            actionButtons: assistantResponse.actionButtons ? JSON.stringify(assistantResponse.actionButtons) : null
          });

        if (aiInsertError) throw aiInsertError;
        
        setMessages([...newMessages, assistantResponse]);
        setIsLoading(false);
      }, 1000);

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action === "Apply Recommendations" || action === "Optimize Campaigns") {
      toast({
        title: "Success",
        description: "Recommendations applied successfully!",
      });
    } else if (action === "View Detailed Report") {
      navigate(`/campaign/${chatId || 'new'}`);
    } else {
      handleSendMessage(`Tell me more about ${action}`);
    }
  };

  const handlePillClick = (message: string) => {
    handleSendMessage(message);
  };

  return (
    <div className="flex h-screen bg-[#111]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={() => {}}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} />
        
        <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
          <MessageList 
            messages={messages} 
            onActionClick={handleActionClick} 
            onPillClick={handlePillClick}
          />
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
