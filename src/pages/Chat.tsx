
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import { useChat } from '@/hooks/useChat';

const Chat = () => {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Extract campaign_id from URL query params if present
  const searchParams = new URLSearchParams(location.search);
  const queryCampaignId = searchParams.get('campaign_id');
  const [effectiveCampaignId, setEffectiveCampaignId] = useState<string | null>(null);

  // Initialize chat hook
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    chatTitle,
    setChatTitle,
    campaignName,
    setCampaignName,
    fetchMessages
  } = useChat(chatId, queryCampaignId);

  // Set up campaign id based on URL or existing chat
  useEffect(() => {
    setEffectiveCampaignId(queryCampaignId);
  }, [queryCampaignId]);

  // Fetch messages when chatId changes
  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  // Handle new campaign button click
  const handleNewCampaign = () => {
    navigate('/campaign/new');
  };

  return (
    <div className="flex h-screen bg-[#343541]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={handleNewCampaign}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          title={chatTitle}
          campaignId={effectiveCampaignId || undefined}
          campaignName={campaignName || undefined}
        />
        
        <ChatContainer
          messages={messages}
          setMessages={setMessages}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          chatId={chatId}
          campaignId={effectiveCampaignId}
          campaignName={campaignName}
          setChatTitle={setChatTitle}
        />
      </main>
    </div>
  );
};

export default Chat;
