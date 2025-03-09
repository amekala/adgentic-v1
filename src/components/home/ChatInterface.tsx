import { useState, useRef, useEffect } from 'react';
import { MessageProps } from '@/components/Message';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import EmptyState from './EmptyState';
import { useToast } from '@/hooks/use-toast';
import { generateResponse } from '@/services/responseGenerator';
import { ChevronDown } from 'lucide-react';

interface ChatInterfaceProps {
  onActionClick: (action: string) => void;
}

const ChatInterface = ({ onActionClick }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Detect if not scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Show button if not at bottom (with a small threshold)
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isAtBottom);
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
  
  // Handle action clicks by directly sending the message
  const handleAction = (action: string) => {
    if (action === 'Create Campaign') {
      onActionClick(action);
    } else {
      handleSendMessage(action);
    }
  };
  
  return (
    <div className="flex h-full flex-col justify-between pt-[60px] pb-4 relative">
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
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto mb-4"
          >
            <MessageList 
              messages={messages} 
              onActionClick={handleAction}
              messagesEndRef={messagesEndRef} 
            />
          </div>
          
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <button 
              onClick={scrollToBottom}
              className="absolute right-6 bottom-28 rounded-full p-2 bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="h-5 w-5 text-gray-600" />
            </button>
          )}
          
          <div className="mt-auto fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-10 min-h-[76px]">
            <div className="w-full max-w-3xl mx-auto">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
