
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';
import MessageList from '@/components/MessageList';
import NewCampaignModal from '@/components/NewCampaignModal';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const { toast } = useToast();

  const handleStartNewCampaign = () => {
    setIsNewCampaignModalOpen(true);
  };

  const handleCreateCampaign = (data: { name: string; goals: string; notes: string }) => {
    setMessages([{
      role: 'system',
      content: `Creating new campaign: "${data.name}". You've set your goals as: "${data.goals}". Let's begin with platform selection. Which platform are you advertising on? (Amazon, Walmart, Instacart?)`
    }]);
    setIsNewCampaignModalOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const newMessages = [
        ...messages,
        { role: 'user', content } as const
      ];
      
      setMessages(newMessages);

      // Regular chat flow response
      const assistantMessage: Message = {
        role: 'assistant',
        content: "I am a hardcoded response. The database connection has been removed for testing purposes. You can modify this response in the Index.tsx file."
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={handleStartNewCampaign}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} />
        
        <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
          {messages.length === 0 ? (
            <div className="w-full max-w-3xl px-4 space-y-4">
              <div>
                <h1 className="mb-8 text-4xl font-semibold text-center">What can I help with?</h1>
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
              <div className="mt-4">
                <ActionButtons onActionClick={(action) => {
                  if (action === "Create Campaign") {
                    handleStartNewCampaign();
                  }
                }} />
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              <div className="w-full max-w-3xl mx-auto px-4 py-2">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
              <div className="text-xs text-center text-gray-500 py-2">
                Adgentic can make mistakes. Check important info.
              </div>
            </>
          )}
        </div>
      </main>

      <NewCampaignModal
        isOpen={isNewCampaignModalOpen}
        onClose={() => setIsNewCampaignModalOpen(false)}
        onCreateCampaign={handleCreateCampaign}
      />
    </div>
  );
};

export default Index;
