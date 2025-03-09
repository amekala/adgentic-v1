import { useEffect, useRef } from 'react';
import Message, { MessageProps } from './Message';
import ChatActionPills from './ChatActionPills';

interface MessageListProps {
  messages: MessageProps[];
  onActionClick?: (action: string) => void;
  onPillClick?: (message: string) => void;
}

const MessageList = ({ messages, onActionClick, onPillClick }: MessageListProps) => {
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleFollowupClick = (prompt: string) => {
    if (onPillClick) {
      onPillClick(prompt);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <Message
          key={index}
          message={message}
          onActionClick={onActionClick}
          onFollowupClick={handleFollowupClick}
        />
      ))}
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageList;
