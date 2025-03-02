
import { Menu, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "./ui/input";
import { toast } from "sonner";
import CampaignList from "./sidebar/CampaignList";
import GeneralChats from "./sidebar/GeneralChats";
import SidebarFooter from "./sidebar/SidebarFooter";

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_status: 'draft' | 'live' | 'paused';
}

interface Chat {
  id: string;
  title: string;
  chat_type: string;
  created_at: string;
  campaign_id: string | null;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onApiKeyChange: (apiKey: string) => void;
  onNewCampaign: () => void;
}

const Sidebar = ({ isOpen, onToggle, onApiKeyChange, onNewCampaign }: SidebarProps) => {
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedSection, setExpandedSection] = useState<string>("live");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [campaigns, setCampaigns] = useState<{
    live: Campaign[];
    paused: Campaign[];
    draft: Campaign[];
  }>({
    live: [],
    paused: [],
    draft: []
  });
  const [chats, setChats] = useState<Chat[]>([]);
  const [campaignChats, setCampaignChats] = useState<Record<string, Chat[]>>({});

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, campaign_name, campaign_status');

      if (error) {
        console.error('Error fetching campaigns:', error);
        return;
      }

      const categorizedCampaigns = {
        live: data.filter(c => c.campaign_status === 'live'),
        paused: data.filter(c => c.campaign_status === 'paused'),
        draft: data.filter(c => c.campaign_status === 'draft')
      };

      setCampaigns(categorizedCampaigns);
      
      // Auto-expand campaign if we're on its page
      const currentPath = location.pathname;
      if (currentPath.includes('/campaign/') || currentPath.includes('/chat/')) {
        const pathParts = currentPath.split('/');
        const id = pathParts[2];
        
        if (id && id !== 'new') {
          // If we're on a chat page, check if it belongs to a campaign
          if (currentPath.includes('/chat/')) {
            const { data: chatData } = await supabase
              .from('chats')
              .select('campaign_id')
              .eq('id', id)
              .single();
              
            if (chatData?.campaign_id) {
              setExpandedCampaigns(prev => ({
                ...prev,
                [chatData.campaign_id]: true
              }));
            }
          } else {
            // If we're on a campaign page, expand that campaign
            setExpandedCampaigns(prev => ({
              ...prev,
              [id]: true
            }));
          }
        }
      }
    };

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        return;
      }

      // Separate standalone chats and campaign chats
      setChats(data.filter(chat => !chat.campaign_id));
      
      // Group chats by campaign
      const chatsByCampaign: Record<string, Chat[]> = {};
      data.forEach(chat => {
        if (chat.campaign_id) {
          if (!chatsByCampaign[chat.campaign_id]) {
            chatsByCampaign[chat.campaign_id] = [];
          }
          chatsByCampaign[chat.campaign_id].push(chat);
        }
      });
      
      setCampaignChats(chatsByCampaign);
    };

    fetchCampaigns();
    fetchChats();

    const campaignsChannel = supabase
      .channel('campaigns-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, fetchCampaigns)
      .subscribe();

    const chatsChannel = supabase
      .channel('chats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, fetchChats)
      .subscribe();

    return () => {
      supabase.removeChannel(campaignsChannel);
      supabase.removeChannel(chatsChannel);
    };
  }, [location.pathname]);

  const toggleCampaignExpansion = (campaignId: string) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const createNewChatForCampaign = async (campaignId: string) => {
    try {
      // Create new chat for campaign
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
        console.error('Error creating new chat:', error);
        toast.error("Failed to create new chat");
        return;
      }

      toast.success("New chat created");
      navigate(`/chat/${data.id}`);
    } catch (err) {
      console.error('Error in createNewChatForCampaign:', err);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={onToggle}
            className="h-10 w-10 rounded-md flex items-center justify-center bg-white shadow-sm border border-adgentic-border hover:bg-adgentic-hover"
          >
            <Menu className="h-5 w-5 text-adgentic-text-primary" />
          </button>
        </div>
      )}
      <div className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-adgentic-sidebar border-r border-adgentic-border transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        <div className="flex h-[60px] items-center px-3">
          <div className="flex w-full justify-between items-center">
            <button onClick={onToggle} className="h-10 rounded-md px-2 text-adgentic-text-secondary hover:bg-adgentic-hover">
              <Menu className="h-5 w-5" />
            </button>
            <button 
              onClick={onNewCampaign}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-adgentic-accent hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-adgentic-text-light" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-adgentic-border text-adgentic-text-primary placeholder-adgentic-text-light h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <CampaignList 
            campaigns={campaigns}
            campaignChats={campaignChats}
            expandedCampaigns={expandedCampaigns}
            expandedSection={expandedSection}
            toggleSection={toggleSection}
            toggleCampaignExpansion={toggleCampaignExpansion}
            createNewChatForCampaign={createNewChatForCampaign}
            searchQuery={searchQuery}
            isOpen={isOpen}
          />
          
          <GeneralChats 
            isOpen={isOpen}
            expandedSection={expandedSection}
            toggleSection={toggleSection}
            chats={chats}
          />
        </div>

        <SidebarFooter />
      </div>
    </>
  );
};

export default Sidebar;
