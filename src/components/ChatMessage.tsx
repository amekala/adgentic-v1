
import React from 'react';
import Message from './Message';

interface ChatMessageProps {
  message: {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at?: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <Message
      role={message.role}
      content={message.content}
    />
  );
};

export default ChatMessage;
