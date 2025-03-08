import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageList from './MessageList';
import ChatEmptyState from './ChatEmptyState';
import ChatFooter from './ChatFooter';
import { MessageProps } from './Message';
import { callLLMAPI } from '@/services/llmService';
import { processCampaignActions, fetchAmazonCampaignData, getTestCampaignData } from '@/services/campaignProcessor';
import { toast } from '@/components/ui/use-toast';

interface ChatContainerProps {
  messages: MessageProps[];
  setMessages: (messages: MessageProps[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  chatId: string | undefined;
  campaignId: string | null;
  campaignName: string | null;
  setChatTitle: (title: string) => void;
}

const ChatContainer = ({
  messages,
  setMessages,
  isLoading,
  setIsLoading,
  chatId,
  campaignId,
  campaignName,
  setChatTitle
}: ChatContainerProps) => {
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState<any>(null);
  
  // Fetch campaign data when component mounts or campaignId changes
  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);
  
  // Function to fetch campaign data
  const fetchCampaignData = async () => {
    try {
      if (campaignId) {
        // Use the test campaign data for now
        const data = await getTestCampaignData();
        console.log('Loaded test campaign data:', data);
        setCampaignData(data);
      }
    } catch (error) {
      console.error('Error fetching campaign data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaign data',
        variant: 'destructive'
      });
    }
  };
  
  // Process campaign actions after receiving an assistant message
  const processChatForActions = async (latestMessages: MessageProps[]) => {
    try {
      // Only process if we have a chatId
      if (!chatId) return;
      
      // Get the latest user and assistant message pair
      const lastUserMessageIndex = [...latestMessages].reverse().findIndex(m => m.role === 'user');
      const lastAssistantMessageIndex = [...latestMessages].reverse().findIndex(m => m.role === 'assistant');
      
      // Only process if we have both a user and assistant message
      if (lastUserMessageIndex === -1 || lastAssistantMessageIndex === -1) return;
      
      console.log('Processing messages for campaign actions');
      
      // Process the conversation to detect campaign actions
      const actionResult = await processCampaignActions({
        messages: latestMessages,
        campaignId,
        campaignName,
        userId: null // We would get this from auth in a real app
      });
      
      if (!actionResult.success) {
        console.log('No campaign action processed:', actionResult.message);
        return;
      }
      
      if (actionResult.actionType === 'get_campaign_data' && campaignData) {
        // If the user is asking about campaign data, add the campaign data to the next message
        const newMessage: MessageProps = {
          role: 'assistant',
          content: `Here's the data for the ${campaignData.name} campaign:`,
          apiData: campaignData
        };
        
        setMessages([...latestMessages, newMessage]);
        return;
      }
      
      if (actionResult.actionType === 'create_campaign' && actionResult.data) {
        // If a new campaign should be created, provide a confirmation message
        const newMessage: MessageProps = {
          role: 'assistant',
          content: `I've prepared a new campaign with the following details. Would you like me to create it?`,
          apiData: actionResult.data,
          actionButtons: [
            { label: 'Create Campaign', primary: true },
            { label: 'Edit Details', primary: false }
          ]
        };
        
        setMessages([...latestMessages, newMessage]);
        return;
      }
      
    } catch (error) {
      console.error('Error processing campaign actions:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    if (!chatId) {
      console.error('No chat ID available');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userMessage: MessageProps = {
        role: 'user',
        content
      };
      
      // Add user message to the chat
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Generate response using the LLM service
      const assistantResponse = await callLLMAPI(
        content,
        updatedMessages,
        campaignId,
        campaignName
      );
      
      // Add assistant message to the chat
      const newMessages = [...updatedMessages, assistantResponse];
      setMessages(newMessages);
      
      // Process the conversation for any campaign actions
      await processChatForActions(newMessages);
      
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleActionClick = (action: string) => {
    console.log(`Action clicked: ${action}`);
    
    // Handle creating a campaign
    if (action === 'Create Campaign') {
      // Navigate to the campaign creation page
      navigate('/campaigns/new');
      return;
    }
    
    // Handle viewing campaign data
    if (action === 'View Campaign Data' && campaignData) {
      const newMessage: MessageProps = {
        role: 'assistant',
        content: `Here's the current campaign data for ${campaignData.name}:`,
        apiData: campaignData,
        followupPrompts: [
          { text: 'How can I improve this campaign?' },
          { text: 'What does the tactic T00020 mean?' },
          { text: 'Show me the performance metrics' }
        ]
      };
      
      setMessages([...messages, newMessage]);
      return;
    }
    
    // Handle performance analysis request
    if (action === 'Performance Analysis') {
      handleSendMessage('Show me the performance analysis for this campaign');
      return;
    }
    
    // Handle budget optimization request
    if (action === 'Budget Optimization') {
      handleSendMessage('How can I optimize the budget for this campaign?');
      return;
    }
    
    // If no special handler, treat it as a normal message
    handleSendMessage(`I want to ${action}`);
  };
  
  const handlePillClick = (message: string) => {
    handleSendMessage(message);
  };
  
  return (
    <div className="flex flex-col h-full pb-20 md:pb-0">
      {messages.length === 0 ? (
        <ChatEmptyState onPillClick={handlePillClick} />
      ) : (
        <MessageList 
          messages={messages} 
          onActionClick={handleActionClick} 
          onPillClick={handlePillClick}
        />
      )}
      <ChatFooter 
        onSend={handleSendMessage} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default ChatContainer;
