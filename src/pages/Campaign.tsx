
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
  const [campaignData, setCampaignData] = useState<any>(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

  // Fetch campaign data and chats in parallel
  useEffect(() => {
    const fetchData = async () => {
      if (campaignId === 'new') {
        setCampaignName('New Campaign');
        setCampaignStatus('draft');
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Use Promise.all to fetch campaign data and chats in parallel
        const [campaignResponse, chatsResponse] = await Promise.all([
          // Fetch campaign details
          supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single(),
            
          // Fetch chats for this campaign
          supabase
            .from('chats')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false })
        ]);
        
        // Handle campaign data
        if (campaignResponse.error) {
          throw campaignResponse.error;
        }
        
        if (campaignResponse.data) {
          setCampaignData(campaignResponse.data);
          setCampaignName(campaignResponse.data.campaign_name);
          setCampaignStatus(campaignResponse.data.campaign_status || 'draft');
        }
        
        // Handle chats data
        if (chatsResponse.error) {
          console.error('Error fetching chats:', chatsResponse.error);
        } else if (chatsResponse.data) {
          setChats(chatsResponse.data);
        }
        
      } catch (err) {
        console.error('Error fetching campaign data:', err);
        toast.error('Could not load campaign');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [campaignId]);

  // Handle creating a new chat for this campaign
  const createNewChat = async (initialMessage = '') => {
    try {
      // For new campaigns, navigate to the chat directly
      if (campaignId === 'new') {
        navigate('/chat/new');
        return;
      }
      
      // Create a new chat
      const title = initialMessage ? 
        (initialMessage.length > 30 ? initialMessage.substring(0, 30) + '...' : initialMessage) :
        'New Chat';
        
      const { data, error } = await supabase
        .from('chats')
        .insert({
          title: title,
          chat_type: 'campaign',
          campaign_id: campaignId
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // If we have an initial message, also create that message
      if (initialMessage && data) {
        const { error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: data.id,
            role: 'user',
            content: initialMessage
          });
          
        if (messageError) {
          console.error('Error creating initial message:', messageError);
          // Continue anyway since the chat was created
        }
      }
      
      toast.success('New chat created');
      navigate(`/chat/${data.id}?campaign_id=${campaignId}`);
    } catch (err) {
      console.error('Error in createNewChat:', err);
      toast.error('Failed to create new chat');
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

  // Breadcrumb items with proper type information
  const breadcrumbItems = [
    { 
      label: "Home", 
      href: "/app",
      type: "home" as const,
      id: "home"
    },
    { 
      label: campaignName, 
      href: `/campaign/${campaignId}`,
      type: "campaign" as const,
      id: campaignId as string 
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
              <div className="animate-pulse flex flex-col items-center justify-center space-y-4">
                <div className="h-8 w-64 bg-gray-200 rounded-md"></div>
                <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
                <div className="mt-4 text-adgentic-text-secondary">Loading campaign data...</div>
              </div>
            </div>
          ) : (
            <div className="p-6 max-w-7xl mx-auto">
              {/* Hero section with campaign overview */}
              <div className="bg-white rounded-xl p-6 border border-adgentic-border shadow-sm mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        campaignStatus === 'live' ? 'bg-green-500' : 
                        campaignStatus === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm font-medium text-adgentic-text-secondary">
                        {campaignStatus === 'live' ? 'Active Campaign' : 
                         campaignStatus === 'paused' ? 'Paused Campaign' : 'Draft Campaign'}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-adgentic-text-primary">{campaignName}</h1>
                    <p className="text-adgentic-text-secondary mt-1 max-w-xl">
                      {campaignData?.goals_description || 'No campaign description provided. Add goals and notes in campaign settings.'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="rounded-full border-adgentic-border text-adgentic-text-primary"
                      onClick={handleCampaignSettings}
                    >
                      Edit Campaign
                    </Button>
                    <Button
                      className="rounded-full bg-adgentic-accent text-white hover:bg-adgentic-accent/90"
                      onClick={() => createNewChat()}
                    >
                      Start New Chat
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* New Chat input section */}
              <NewChatInput 
                onCreateChat={createNewChat} 
                campaignId={campaignId as string} 
                campaignName={campaignName}
              />
              
              {/* Campaign Performance */}
              <MetricsSection metrics={metrics} />
              
              {/* Action Cards Grid */}
              <ActionsGrid
                onChatClick={() => createNewChat()}
                onReportClick={() => navigate(`/campaign/${campaignId}/report`)}
                onSettingsClick={handleCampaignSettings}
                onHistoryClick={() => navigate(`/campaign/${campaignId}/chats`)}
                chatsCount={chats.length}
                campaignStatus={campaignStatus}
              />
              
              {/* Chats in this campaign */}
              <ChatsList 
                chats={chats} 
                campaignId={campaignId as string}
              />
              
              {/* Ad Creatives Section */}
              <CreativesSection />
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
