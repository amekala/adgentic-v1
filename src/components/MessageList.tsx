
import { useEffect, useRef } from 'react';
import Message, { MessageProps } from './Message';
import ChatActionPills from './ChatActionPills';

interface MessageListProps {
  messages: MessageProps[];
  onActionClick?: (action: string) => void;
  onPillClick?: (message: string) => void;
}

const MessageList = ({ messages, onActionClick, onPillClick }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced debug logs to track messages state
  useEffect(() => {
    console.log('MessageList received messages:', messages);
    if (messages.length === 0) {
      console.log('No messages to display');
    } else {
      console.log('First message:', messages[0]);
      console.log('Last message:', messages[messages.length - 1]);
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
      <div className="w-full">
        {messages.length === 0 ? (
          <div className="pt-8 px-4">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to Adgentic Assistant</h2>
              <p className="text-gray-400">Your AI-powered advertising campaign assistant</p>
            </div>
            <ChatActionPills onPillClick={onPillClick} className="mb-8" />
          </div>
        ) : (
          messages.map((message, index) => (
            <Message 
              key={index} 
              {...message} 
              onActionClick={onActionClick}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
