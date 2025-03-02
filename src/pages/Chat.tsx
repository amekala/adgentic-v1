
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { useCurrentChat } from '@/hooks/useCurrentChat';
import ChatPageHeader from '@/components/chat/ChatPageHeader';
import ChatInputArea from '@/components/chat/ChatInputArea';
import ChatMessagesArea from '@/components/chat/ChatMessagesArea';

const Chat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {
    chatData,
    messages,
    inputValue,
    isLoading,
    isSending,
    handleInputChange,
    handleSendMessage,
    handleDeleteChat,
    handleBackClick,
    getBreadcrumbItems,
    setInputValue
  } = useCurrentChat();

  // Handle key presses in the textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <div className="flex min-h-screen bg-adgentic-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={() => {}}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <ChatPageHeader 
          chatData={chatData}
          onBackClick={handleBackClick}
          onDeleteChat={handleDeleteChat}
          isSidebarOpen={isSidebarOpen}
        />
        
        <div className="pt-[60px]">
          {/* Breadcrumb navigation */}
          <Breadcrumb items={getBreadcrumbItems()} />
          
          {/* Chat messages */}
          <div className="flex flex-col h-[calc(100vh-180px)] overflow-hidden">
            <ChatMessagesArea 
              messages={messages}
              isLoading={isLoading}
            />
            
            {/* Input area */}
            <ChatInputArea 
              inputValue={inputValue}
              isSending={isSending}
              onInputChange={handleInputChange}
              onSendMessage={handleSendMessage}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
