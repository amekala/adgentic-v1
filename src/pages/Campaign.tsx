
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import CampaignHeader from '@/components/campaign/CampaignHeader';
import CampaignContent from '@/components/campaign/CampaignContent';

const Campaign = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [campaignName, setCampaignName] = useState('New Campaign');
  const [campaignStatus, setCampaignStatus] = useState('draft');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const createNewChat = async () => {
    try {
      // For new campaigns, navigate to the chat directly
      if (campaignId === 'new') {
        navigate('/chat/new');
        return;
      }
      
      const { data, error } = await supabase
        .from('chats')
        .insert({
          title: 'New Chat',
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

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={handleNewCampaign}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          title={campaignName} 
        />
        
        <div className="flex flex-col h-full pt-[60px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-adgentic-text-secondary">Loading campaign...</div>
            </div>
          ) : (
            <>
              <CampaignHeader 
                campaignName={campaignName} 
                campaignStatus={campaignStatus}
                createNewChat={createNewChat}
              />
              
              <CampaignContent 
                campaignId={campaignId || 'new'} 
                chats={chats}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Campaign;
