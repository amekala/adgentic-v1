
import React from 'react';
import Message from './Message';

interface ChatMessageProps {
  message: {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at?: string;
    title?: string;
    actionButtons?: Array<{ label: string; primary?: boolean }>;
    metrics?: Array<{ label: string; value: string; improvement?: boolean }>;
  };
  onActionClick?: (action: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick }) => {
  return (
    <Message
      role={message.role}
      content={message.content}
      title={message.title}
      actionButtons={message.actionButtons}
      metrics={message.metrics}
      onActionClick={onActionClick}
    />
  );
};

export default ChatMessage;
