import { useEffect, useRef, MutableRefObject } from 'react';
import Message, { MessageProps } from './Message';
import ChatActionPills from './ChatActionPills';

interface MessageListProps {
  messages: MessageProps[];
  onActionClick?: (action: string) => void;
  onPillClick?: (message: string) => void;
  messagesEndRef?: MutableRefObject<HTMLDivElement | null>;
}

const MessageList = ({ messages, onActionClick, onPillClick, messagesEndRef }: MessageListProps) => {
  const defaultEndRef = useRef<HTMLDivElement>(null);
  const endRef = messagesEndRef || defaultEndRef;

  // Scroll to bottom when messages change (only if not using external ref)
  useEffect(() => {
    if (!messagesEndRef && defaultEndRef.current) {
      defaultEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagesEndRef]);

  const handleFollowupClick = (prompt: string) => {
    if (onPillClick) {
      onPillClick(prompt);
    }
  };

  return (
    <div className="flex-1">
      {messages.map((message, index) => (
        <Message
          key={index}
          message={message}
          onActionClick={onActionClick}
          onFollowupClick={handleFollowupClick}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
