
import { useState } from 'react';
import { MessageProps } from '@/components/Message';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import ChatActionPills from '@/components/ChatActionPills';
import EmptyState from './EmptyState';
import { useToast } from '@/hooks/use-toast';
import { generateResponse } from '@/services/responseGenerator';

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
      
      // Add user message immediately
      setMessages(prev => [...prev, userMessage]);

      // Add thinking message to simulate streaming
      const thinkingMessage = {
        role: 'assistant' as const,
        content: '...'
      };
      
      // Add thinking message with slight delay to show that message processing has begun
      setTimeout(() => {
        setMessages(prev => [...prev, thinkingMessage]);
      }, 300);

      // Generate response with potential AI integration
      try {
        const assistantResponse = await generateResponse(content);
        
        // Replace thinking message with actual response
        setMessages(prev => 
          prev.map(msg => 
            msg === thinkingMessage ? assistantResponse : msg
          )
        );
      } catch (error) {
        console.error('Response generation error:', error);
        
        // Replace thinking message with error message
        setMessages(prev => 
          prev.map(msg => 
            msg === thinkingMessage 
              ? { role: 'assistant' as const, content: "I'm sorry, I couldn't generate a response. Please try again." } 
              : msg
          )
        );
        
        toast({
          title: "Error",
          description: "Failed to generate response",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePillClick = (message: string) => {
    console.log('Pill clicked in ChatInterface:', message);
    handleSendMessage(message);
  };
  
  return (
    <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
      {messages.length === 0 ? (
        <div className="items-center justify-center flex h-full">
          <EmptyState 
            onSendMessage={handleSendMessage} 
            onActionClick={onActionClick} 
            isLoading={isLoading} 
          />
        </div>
      ) : (
        <>
          <MessageList 
            messages={messages} 
            onActionClick={onActionClick} 
            onPillClick={handlePillClick} 
          />
          <div className="space-y-4 mt-auto">
            <div className="w-full max-w-3xl mx-auto px-4">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
            <ChatActionPills onPillClick={handlePillClick} />
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
