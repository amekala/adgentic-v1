import { useState } from 'react';
import { MessageProps } from '@/components/Message';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import ChatActionPills from '@/components/ChatActionPills';
import EmptyState from './EmptyState';
import { useToast } from '@/hooks/use-toast';
import { callLLMAPI } from '@/services/llmService';

interface ChatInterfaceProps {
  onActionClick: (action: string) => void;
}

const ChatInterface = ({ onActionClick }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

      // Use our enhanced LLM service that supports Amazon API operations
      setTimeout(async () => {
        try {
          // Use callLLMAPI instead of generateResponse
          const assistantResponse = await callLLMAPI(content, newMessages, null, null);
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
  
  // Handle action clicks by directly sending the message
  const handleAction = (action: string) => {
    if (action === 'Create Campaign') {
      onActionClick(action);
    } else {
      handleSendMessage(action);
    }
  };
  
  return (
    <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
      {messages.length === 0 ? (
        <div className="items-center justify-center flex h-full">
          <EmptyState 
            onSendMessage={handleSendMessage} 
            onActionClick={handleAction} 
            isLoading={isLoading} 
          />
        </div>
      ) : (
        <>
          <MessageList messages={messages} onActionClick={handleAction} />
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

export default ChatInterface;
