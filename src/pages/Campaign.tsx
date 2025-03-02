
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  BarChart2, 
  Settings, 
  FileText, 
  ImageIcon, 
  Plus, 
  ArrowUp
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { AdCreativesSection } from '@/components/AdCreativesSection';
import NewCampaignModal from '@/components/NewCampaignModal';

const Campaign = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [campaignName, setCampaignName] = useState('New Campaign');
  const [campaignStatus, setCampaignStatus] = useState('draft');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newChatInput, setNewChatInput] = useState('');
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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/app" },
    { label: campaignName, href: `/campaign/${campaignId}` },
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
              {/* New Chat section */}
              <div className="mb-8 bg-white border border-adgentic-border rounded-xl p-4">
                <h2 className="text-lg text-adgentic-text-secondary mb-2">New chat in this campaign</h2>
                <div className="flex gap-3">
                  <Button onClick={() => createNewChat()} variant="outline" className="rounded-full p-2 h-10 w-10">
                    <Plus className="h-5 w-5" />
                  </Button>
                  <div className="relative flex-grow">
                    <input 
                      type="text" 
                      placeholder="Message Adgentic..."
                      className="w-full border border-adgentic-border rounded-full px-4 py-2 pr-10"
                      value={newChatInput}
                      onChange={(e) => setNewChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newChatInput.trim()) {
                          createNewChat(newChatInput);
                          setNewChatInput('');
                        }
                      }}
                    />
                    <Button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100 rounded-full p-1 h-7 w-7"
                      onClick={() => {
                        if (newChatInput.trim()) {
                          createNewChat(newChatInput);
                          setNewChatInput('');
                        }
                      }}
                    >
                      <ArrowUp className="h-4 w-4 text-adgentic-text-secondary" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-adgentic-border p-6 hover:shadow-sm transition-shadow cursor-pointer"
                     onClick={() => createNewChat()}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-adgentic-accent">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-adgentic-text-primary">Chat with AI</h3>
                  </div>
                  <p className="text-adgentic-text-secondary">Ask me anything about your campaign</p>
                </div>
                
                <div className="bg-white rounded-xl border border-adgentic-border p-6 hover:shadow-sm transition-shadow cursor-pointer"
                     onClick={() => navigate(`/campaign/${campaignId}/report`)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-adgentic-accent">
                      <BarChart2 className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-adgentic-text-primary">View Report</h3>
                  </div>
                  <p className="text-adgentic-text-secondary">See detailed campaign performance</p>
                </div>
                
                <div className="bg-white rounded-xl border border-adgentic-border p-6 hover:shadow-sm transition-shadow cursor-pointer"
                     onClick={handleCampaignSettings}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-adgentic-accent">
                      <Settings className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-adgentic-text-primary">Campaign Settings</h3>
                  </div>
                  <p className="text-adgentic-text-secondary">Update campaign configuration</p>
                </div>
                
                <div className="bg-white rounded-xl border border-adgentic-border p-6 hover:shadow-sm transition-shadow cursor-pointer"
                     onClick={() => navigate(`/campaign/${campaignId}/chats`)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-adgentic-accent">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-adgentic-text-primary">Past Conversations</h3>
                  </div>
                  <p className="text-adgentic-text-secondary">{chats.length} chat{chats.length !== 1 ? 's' : ''} in this campaign</p>
                </div>
              </div>
              
              {/* Campaign Performance */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-adgentic-text-primary mb-4 flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2" /> Campaign Performance
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="bg-white rounded-lg border border-adgentic-border p-4">
                      <div className="text-sm text-adgentic-text-secondary">{metric.label}</div>
                      <div className="text-2xl font-semibold text-adgentic-text-primary">{metric.value}</div>
                      <div className="text-xs text-adgentic-text-secondary">{metric.timeframe}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Ad Creatives Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-adgentic-text-primary mb-4 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" /> Ad Creatives
                </h2>
                <AdCreativesSection />
              </div>
              
              {/* Chats in this campaign */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-adgentic-text-primary mb-4">Chats in this campaign</h2>
                <div className="space-y-2">
                  {chats.length === 0 ? (
                    <div className="text-adgentic-text-secondary p-4 bg-white border border-adgentic-border rounded-lg">
                      No chats yet. Start a new conversation!
                    </div>
                  ) : (
                    chats.map((chat: any) => (
                      <Link 
                        key={chat.id} 
                        to={`/chat/${chat.id}`}
                        className="flex items-center gap-3 p-3 bg-white border border-adgentic-border rounded-lg hover:bg-adgentic-lightGray"
                      >
                        <MessageSquare className="h-5 w-5 text-adgentic-text-secondary" />
                        <div>
                          <div className="font-medium text-adgentic-text-primary">{chat.title}</div>
                          <div className="text-sm text-adgentic-text-secondary">
                            {new Date(chat.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
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
