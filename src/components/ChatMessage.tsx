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
    followupPrompts?: Array<{ text: string }>;
  };
  onActionClick?: (action: string) => void;
  onFollowupClick?: (prompt: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onActionClick,
  onFollowupClick
}) => {
  return (
    <Message
      message={message}
      onActionClick={onActionClick}
      onFollowupClick={onFollowupClick}
    />
  );
};

export default ChatMessage;
