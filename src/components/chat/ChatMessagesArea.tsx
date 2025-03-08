import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import { Message } from '@/hooks/useCurrentChat';

interface ChatMessagesAreaProps {
  messages: Message[];
  isLoading: boolean;
  onActionClick?: (action: string) => void;
  onFollowupClick?: (prompt: string) => void;
}

const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  messages,
  isLoading,
  onActionClick,
  onFollowupClick
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-adgentic-accent" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-adgentic-text-secondary">
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p>Start a conversation by typing a message below.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id || index}
              message={message}
              onActionClick={onActionClick}
              onFollowupClick={onFollowupClick}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatMessagesArea;
