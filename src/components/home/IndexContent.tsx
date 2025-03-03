
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageProps } from '@/components/Message';
import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';
import MessageList from '@/components/MessageList';
import ChatActionPills from '@/components/ChatActionPills';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IndexContentProps {
  isSidebarOpen: boolean;
  onNewCampaign: () => void;
}

const IndexContent = ({ isSidebarOpen, onNewCampaign }: IndexContentProps) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Enhanced responses for different marketing scenarios
  const generateResponse = async (userMessage: string): Promise<MessageProps> => {
    const messageLower = userMessage.toLowerCase();
    
    try {
      // First try to get a response from the AI if we're not in a specific scenario
      if (!messageLower.includes('performance') && 
          !messageLower.includes('analytics') && 
          !messageLower.includes('report') && 
          !messageLower.includes('keyword') && 
          !messageLower.includes('search terms') && 
          !messageLower.includes('budget') && 
          !messageLower.includes('spend') && 
          !messageLower.includes('allocation') && 
          !messageLower.includes('create') && 
          !messageLower.includes('new campaign') && 
          !messageLower.includes('setup')) {
        
        // Try to get a response from the Supabase Edge Function
        try {
          const response = await supabase.functions.invoke('chat', {
            body: { 
              messages: [
                { 
                  role: 'system', 
                  content: 'You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. Keep your response brief and concise, under 200 words.'
                },
                { role: 'user', content: userMessage }
              ]
            }
          });
          
          if (response.data && response.data.content) {
            return {
              role: 'assistant' as const,
              content: response.data.content,
              actionButtons: [
                { label: 'Performance Analysis', primary: false },
                { label: 'Keyword Optimization', primary: false },
                { label: 'Budget Allocation', primary: false },
                { label: 'Create Campaign', primary: true }
              ]
            };
          }
        } catch (error) {
          console.error('Error calling AI service:', error);
          // Fall back to hardcoded responses
        }
      }
      
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
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        role: 'assistant' as const,
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        actionButtons: [
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

      // Generate response with potential AI integration
      setTimeout(async () => {
        try {
          const assistantResponse = await generateResponse(content);
          setMessages([...newMessages, assistantResponse]);
        } catch (error) {
          console.error('Response generation error:', error);
          toast({
            title: "Error",
            description: "Failed to generate response",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }, 500);

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
      // Call the onNewCampaign function passed from parent component
      onNewCampaign();
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
