
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import NewCampaignModal from '@/components/NewCampaignModal';

// Import the new components
import NewChatInput from '@/components/campaign/NewChatInput';
import ActionsGrid from '@/components/campaign/ActionsGrid';
import MetricsSection from '@/components/campaign/MetricsSection';
import CreativesSection from '@/components/campaign/CreativesSection';
import ChatsList from '@/components/campaign/ChatsList';

const Campaign = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [campaignName, setCampaignName] = useState('New Campaign');
  const [campaignStatus, setCampaignStatus] = useState('draft');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (campaignId === 'new') {
        setCampaignName('New Campaign');
        setCampaignStatus('draft');
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .single();
          
        if (error) {
          console.error('Error fetching campaign:', error);
          toast.error('Could not load campaign');
          return;
        }
        
        setCampaignName(data.campaign_name);
        setCampaignStatus(data.campaign_status);
        
        // Fetch chats associated with this campaign
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('campaign_id', campaignId)
          .order('created_at', { ascending: false });
          
        if (chatError) {
          console.error('Error fetching chats:', chatError);
        } else {
          setChats(chatData);
        }
        
      } catch (err) {
        console.error('Error in fetchCampaign:', err);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [campaignId]);

  // Handle creating a new chat for this campaign
  const createNewChat = async (initialMessage = '') => {
    try {
      // For new campaigns, navigate to the chat directly
      if (campaignId === 'new') {
        navigate('/chat/new');
        return;
      }
      
      const { data, error } = await supabase
        .from('chats')
        .insert({
          title: initialMessage || 'New Chat',
          chat_type: 'campaign',
          campaign_id: campaignId
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating chat:', error);
        toast.error('Could not create new chat');
        return;
      }
      
      toast.success('New chat created');
      navigate(`/chat/${data.id}`);
    } catch (err) {
      console.error('Error in createNewChat:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const handleNewCampaign = () => {
    navigate('/campaign/new');
  };

  const handleCampaignSettings = () => {
    setIsNewCampaignModalOpen(true);
  };
  
  const handleCreateCampaign = async (data: { name: string; goals: string; notes: string }) => {
    if (campaignId === 'new') {
      // For new campaigns, this is handled by NewCampaignModal
      return;
    }
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          campaign_name: data.name.trim() || campaignName,
          goals_description: data.goals.trim() || null,
          campaign_notes: data.notes.trim() || null,
        })
        .eq('id', campaignId);
        
      if (error) throw error;
      
      toast.success('Campaign updated successfully!');
      setCampaignName(data.name.trim() || campaignName);
    } catch (error: any) {
      console.error("Error updating campaign:", error);
      toast.error(error.message || "Failed to update campaign. Please try again.");
    }
  };

  // Sample metrics
  const metrics = [
    { id: '1', label: 'Impressions', value: '143,892', timeframe: 'Last 30 days' },
    { id: '2', label: 'Clicks', value: '12,453', timeframe: 'Last 30 days' },
    { id: '3', label: 'CTR', value: '8.65%', timeframe: 'Last 30 days' },
    { id: '4', label: 'ACOS', value: '15.2%', timeframe: 'Last 30 days' }
  ];

  // Breadcrumb items with enhanced styling
  const breadcrumbItems = [
    { label: "Home", href: "/app" },
    { 
      label: campaignName, 
      href: `/campaign/${campaignId}`,
      isCampaign: true 
    },
  ];

  return (
    <div className="flex min-h-screen bg-adgentic-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={handleNewCampaign}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header with breadcrumb */}
        <header className="fixed top-0 left-0 right-0 z-10 h-[60px] border-b border-adgentic-border bg-white bg-opacity-80 backdrop-blur-md px-4">
          <div className={`flex items-center h-full transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
            <h1 className="text-lg font-semibold text-adgentic-text-primary truncate">
              {campaignName}
            </h1>
            <span className={`ml-2 text-sm font-normal px-2 py-0.5 rounded-md ${
              campaignStatus === 'live' ? 'bg-green-100 text-green-800' : 
              campaignStatus === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {campaignStatus.charAt(0).toUpperCase() + campaignStatus.slice(1)}
            </span>
          </div>
        </header>
        
        <div className="pt-[60px]">
          {/* Breadcrumb navigation */}
          <Breadcrumb items={breadcrumbItems} />
          
          {loading ? (
            <div className="flex items-center justify-center h-full p-10">
              <div className="text-adgentic-text-secondary">Loading campaign...</div>
            </div>
          ) : (
            <div className="p-6">
              {/* New Chat input section */}
              <NewChatInput onCreateChat={createNewChat} />
              
              {/* Action Cards Grid */}
              <ActionsGrid
                onChatClick={() => createNewChat()}
                onReportClick={() => navigate(`/campaign/${campaignId}/report`)}
                onSettingsClick={handleCampaignSettings}
                onHistoryClick={() => navigate(`/campaign/${campaignId}/chats`)}
                chatsCount={chats.length}
              />
              
              {/* Campaign Performance */}
              <MetricsSection metrics={metrics} />
              
              {/* Ad Creatives Section */}
              <CreativesSection />
              
              {/* Chats in this campaign */}
              <ChatsList chats={chats} />
            </div>
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

export default Campaign;
