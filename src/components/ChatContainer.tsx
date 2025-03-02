
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageList from './MessageList';
import ChatEmptyState from './ChatEmptyState';
import ChatFooter from './ChatFooter';
import ActionHandler from './ActionHandler';
import { MessageProps } from './Message';
import { sendMessage } from '@/services/chatService';

interface ChatContainerProps {
  messages: MessageProps[];
  setMessages: (messages: MessageProps[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  chatId: string | undefined;
  campaignId: string | null;
  campaignName: string | null;
  setChatTitle: (title: string) => void;
}

const ChatContainer = ({
  messages,
  setMessages,
  isLoading,
  setIsLoading,
  chatId,
  campaignId,
  campaignName,
  setChatTitle
}: ChatContainerProps) => {
  const navigate = useNavigate();
  
  const handleSendMessage = async (content: string) => {
    await sendMessage(
      content,
      chatId,
      messages,
      campaignId,
      campaignName,
      setMessages,
      setIsLoading,
      setChatTitle,
      navigate
    );
  };
  
  // Use our extracted action handler
  const { handleActionClick, handlePillClick } = ActionHandler({ 
    campaignId, 
    onSendMessage: handleSendMessage 
  });

  return (
    <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
      {messages.length === 0 ? (
        <ChatEmptyState onPillClick={handlePillClick} />
      ) : (
        <MessageList 
          messages={messages} 
          onActionClick={handleActionClick} 
          onPillClick={handlePillClick}
        />
      )}
      <ChatFooter onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatContainer;
