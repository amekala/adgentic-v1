
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageProps } from '@/components/Message';
import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';
import MessageList from '@/components/MessageList';
import ChatActionPills from '@/components/ChatActionPills';
import { useToast } from '@/hooks/use-toast';

interface IndexContentProps {
  isSidebarOpen: boolean;
}

const IndexContent = ({ isSidebarOpen }: IndexContentProps) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Enhanced responses for different marketing scenarios
  const generateResponse = (userMessage: string) => {
    const messageLower = userMessage.toLowerCase();
    
    // Performance analysis scenario
    if (messageLower.includes('performance') || messageLower.includes('analytics') || messageLower.includes('report')) {
      return {
        role: 'assistant' as const,
        content: "Here's the performance data for your campaigns over the past 7 days:",
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
    
    // Keyword optimization scenario
    else if (messageLower.includes('keyword') || messageLower.includes('search terms')) {
      return {
        role: 'assistant' as const,
        content: "Based on your campaign performance, I recommend the following keyword changes:",
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
    
    // Budget allocation scenario
    else if (messageLower.includes('budget') || messageLower.includes('spend') || messageLower.includes('allocation')) {
      return {
        role: 'assistant' as const,
        content: "Based on ROAS analysis, I recommend the following budget allocation:",
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
    
    // Campaign creation assistance
    else if (messageLower.includes('create') || messageLower.includes('new campaign') || messageLower.includes('setup')) {
      return {
        role: 'assistant' as const,
        content: "I'd be happy to help you set up a new campaign. What type of campaign are you looking to create?",
        actionButtons: [
          { label: 'Sponsored Products', primary: false },
          { label: 'Sponsored Brands', primary: false },
          { label: 'Sponsored Display', primary: false },
          { label: 'Custom Campaign', primary: true }
        ]
      };
    }
    
    // Default response for other queries
    else {
      return {
        role: 'assistant' as const,
        content: "I'm here to help optimize your retail media campaigns. You can ask me about performance analytics, keyword optimization, budget allocation, or campaign creation.",
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
      const userMessage = {
        role: 'user' as const,
        content
      };
      
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Simulate AI processing delay
      setTimeout(() => {
        const assistantResponse = generateResponse(content);
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
    if (action === "Create Campaign") {
      navigate('/campaign/new');
    } else if (action === "Apply Recommendations" || action === "Optimize Campaigns") {
      toast({
        title: "Success",
        description: "Recommendations applied successfully!",
      });
    } else if (action === "View Detailed Report") {
      navigate('/campaign/new');
    } else {
      handleSendMessage(action);
    }
  };

  return (
    <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
      {messages.length === 0 ? (
        <div className="w-full max-w-3xl px-4 space-y-4">
          <div>
            <h1 className="mb-8 text-4xl font-semibold text-center">What can I help with?</h1>
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </div>
          <div className="mt-4">
            <ActionButtons onActionClick={handleActionClick} />
          </div>
        </div>
      ) : (
        <>
          <MessageList messages={messages} onActionClick={handleActionClick} />
          <div className="space-y-4 mt-auto">
            <div className="w-full max-w-3xl mx-auto px-4">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
            <ChatActionPills onPillClick={handleSendMessage} />
            <div className="text-xs text-center text-gray-500">
              Adgentic can make mistakes. Check important info.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IndexContent;
