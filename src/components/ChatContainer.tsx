
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatActionPills from './ChatActionPills';
import { toast } from "sonner";
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

  const handleActionClick = (action: string) => {
    if (action === "Apply Recommendations" || action === "Optimize Campaigns") {
      toast.success("Recommendations applied successfully!");
    } else if (action === "View Detailed Report") {
      navigate(`/campaign/${campaignId || 'new'}`);
    } else {
      handleSendMessage(`Tell me more about ${action}`);
    }
  };

  const handlePillClick = (message: string) => {
    handleSendMessage(message);
  };

  return (
    <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold text-adgentic-text-primary mb-8">Adgentic Chat Assistant</h2>
          <ChatActionPills onPillClick={handlePillClick} className="mb-8" />
        </div>
      ) : (
        <MessageList 
          messages={messages} 
          onActionClick={handleActionClick} 
          onPillClick={handlePillClick}
        />
      )}
      <div className="space-y-4 mt-auto px-4">
        <div className="w-full max-w-3xl mx-auto">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
        <div className="text-xs text-center text-adgentic-text-secondary">
          Adgentic can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
