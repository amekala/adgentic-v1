
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';
import MessageList from '@/components/MessageList';
import ChatActionPills from '@/components/ChatActionPills';
import NewCampaignModal from '@/components/NewCampaignModal';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleStartNewCampaign = () => {
    setIsNewCampaignModalOpen(true);
  };

  const handleCreateCampaign = async (data: { name: string; goals: string; notes: string }) => {
    setIsNewCampaignModalOpen(false);
    navigate('/campaign/new');
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

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: newMessages }
      });

      if (error) throw error;

      if (data?.content) {
        setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePillAction = (message: string) => {
    handleSendMessage(message);
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
              <div className="space-y-4 mt-auto">
                <div className="w-full max-w-3xl mx-auto px-4">
                  <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                </div>
                <ChatActionPills onPillClick={handlePillAction} />
                <div className="text-xs text-center text-gray-500">
                  Adgentic can make mistakes. Check important info.
                </div>
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
