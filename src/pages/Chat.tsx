
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import { useChat } from '@/hooks/useChat';
import Breadcrumb from '@/components/Breadcrumb';

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

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/app" },
  ];
  
  if (effectiveCampaignId && campaignName) {
    breadcrumbItems.push({ label: campaignName, href: `/campaign/${effectiveCampaignId}` });
  }
  
  if (chatTitle) {
    breadcrumbItems.push({ label: chatTitle, href: `/chat/${chatId}` });
  }

  return (
    <div className="flex h-screen bg-adgentic-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={handleNewCampaign}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} flex flex-col`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          title={chatTitle}
          campaignId={effectiveCampaignId || undefined}
          campaignName={campaignName || undefined}
        />
        
        {/* Breadcrumb navigation */}
        <div className="pt-[60px]">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        {/* Flex container for messages and input */}
        <div className="flex-1 flex flex-col">
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
        </div>
      </main>
    </div>
  );
};

export default Chat;
