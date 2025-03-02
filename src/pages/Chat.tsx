
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import { useChat } from '@/hooks/useChat';
import Breadcrumb from '@/components/Breadcrumb';
import { supabase } from '@/integrations/supabase/client';

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
    if (queryCampaignId) {
      console.log("Setting campaign ID from query param:", queryCampaignId);
      setEffectiveCampaignId(queryCampaignId);
    } else {
      // When fetching chat details, if we have a chat that belongs to a campaign
      // the useChat hook will set campaignName, but we also need the ID
      const getChatCampaignDetails = async () => {
        if (chatId && chatId !== 'new') {
          try {
            const { data, error } = await supabase
              .from('chats')
              .select('campaign_id')
              .eq('id', chatId)
              .single();
              
            if (!error && data && data.campaign_id) {
              console.log("Setting campaign ID from chat details:", data.campaign_id);
              setEffectiveCampaignId(data.campaign_id);
            }
          } catch (err) {
            console.error("Error fetching chat campaign details:", err);
          }
        }
      };
      
      getChatCampaignDetails();
    }
  }, [chatId, queryCampaignId]);

  // Fetch messages when chatId or campaign changes
  useEffect(() => {
    fetchMessages();
  }, [chatId, queryCampaignId]);

  // Handle new campaign button click
  const handleNewCampaign = () => {
    navigate('/campaign/new');
  };

  // Prepare breadcrumb items with a clear hierarchy
  const breadcrumbItems = (() => {
    // Start with home
    const items = [
      { 
        label: "Home", 
        href: "/app",
        type: "home" as const,
        id: "home"
      }
    ];
    
    // For campaign chats, ensure we show Home > Campaign > Chat
    if (effectiveCampaignId && campaignName) {
      items.push({ 
        label: campaignName, 
        href: `/campaign/${effectiveCampaignId}`,
        type: "campaign" as const,
        id: effectiveCampaignId
      });
      
      if (chatTitle) {
        items.push({ 
          label: chatTitle, 
          href: `/chat/${chatId}`,
          type: "chat" as const,
          id: chatId as string
        });
      }
    } else {
      // For direct chats (not connected to campaigns)
      // Show just Home > Chat
      if (chatTitle) {
        items.push({ 
          label: chatTitle, 
          href: `/chat/${chatId}`,
          type: "chat" as const,
          id: chatId as string
        });
      }
    }
    
    return items;
  })();

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
