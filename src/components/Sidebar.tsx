
import { Menu, Play, Pause, FilePen, Plus, UserCircle2, DollarSign, Search, MessageSquare, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "./ui/input";

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
  }, []);

  const toggleCampaignExpansion = (campaignId: string) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const hasMatchingCampaigns = (items: Campaign[]) => {
    if (!searchQuery) return false;
    return items.some(campaign => 
      campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filterCampaigns = (campaigns: Campaign[]) => {
    if (!searchQuery) return campaigns;
    return campaigns.filter(campaign => 
      campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  useEffect(() => {
    if (searchQuery) {
      if (hasMatchingCampaigns(campaigns.live)) setExpandedSection("live");
      else if (hasMatchingCampaigns(campaigns.paused)) setExpandedSection("paused");
      else if (hasMatchingCampaigns(campaigns.draft)) setExpandedSection("draft");
    }
  }, [searchQuery, campaigns]);

  const createNewChatForCampaign = async (campaignId: string) => {
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
      return;
    }

    navigate(`/chat/${data.id}`);
  };

  const renderCampaignList = (items: Campaign[], sectionKey: string) => (
    <div className={cn("space-y-1", expandedSection === sectionKey ? "block" : "hidden")}>
      {filterCampaigns(items).map(campaign => (
        <div key={campaign.id} className="mb-1">
          <div 
            className="group flex h-9 items-center gap-2 rounded-lg px-2 hover:bg-[#383737] cursor-pointer text-sm text-gray-400 hover:text-white ml-4"
            onClick={() => toggleCampaignExpansion(campaign.id)}
          >
            {expandedCampaigns[campaign.id] ? 
              <ChevronDown className="h-4 w-4 min-w-4" /> : 
              <ChevronRight className="h-4 w-4 min-w-4" />
            }
            <FolderOpen className="h-4 w-4 min-w-4" />
            <span className="truncate flex-1">{campaign.campaign_name}</span>
          </div>
          
          {expandedCampaigns[campaign.id] && (
            <div className="ml-10 space-y-1 mt-1">
              {campaignChats[campaign.id]?.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="flex items-center gap-2 pl-2 py-2 rounded-lg hover:bg-[#383737] cursor-pointer text-xs text-gray-400 hover:text-white"
                >
                  <MessageSquare className="h-3.5 w-3.5 min-w-3.5" />
                  <span className="truncate">{chat.title}</span>
                </div>
              ))}
              <div
                onClick={() => createNewChatForCampaign(campaign.id)}
                className="flex items-center gap-2 pl-2 py-2 rounded-lg hover:bg-[#383737] cursor-pointer text-xs text-indigo-500 hover:text-indigo-400"
              >
                <Plus className="h-3.5 w-3.5 min-w-3.5" />
                <span>New chat</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {!isOpen && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={onToggle}
            className="h-10 w-10 rounded-lg flex items-center justify-center bg-[#2F2F2F] hover:bg-[#383737]"
          >
            <Menu className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      )}
      <div className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-[#2F2F2F] transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-16"
      )}>
        <div className="flex h-[60px] items-center px-3">
          {isOpen ? (
            <div className="flex w-full justify-between items-center">
              <button onClick={onToggle} className="h-10 rounded-lg px-2 text-gray-400 hover:bg-[#383737]">
                <Menu className="h-5 w-5" />
              </button>
              <button 
                onClick={onNewCampaign}
                className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm hover:bg-blue-600 bg-blue-500 text-white"
              >
                <Plus className="h-4 w-4" />
                <span>New Campaign</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onNewCampaign}
              className="w-full flex justify-center items-center h-10 rounded-lg hover:bg-[#383737]"
            >
              <Plus className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#212121] border-[#383737] text-white placeholder-gray-400 h-9"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3">
          <div className="space-y-1">
            <button onClick={() => toggleSection("live")} 
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-green-500 hover:bg-[#383737]",
                !isOpen && "justify-center px-2"
              )}
            >
              <Play className="h-5 w-5" />
              {isOpen && <span>Live Campaigns {searchQuery && hasMatchingCampaigns(campaigns.live) && '(matches found)'}</span>}
            </button>
            {isOpen && renderCampaignList(campaigns.live, "live")}

            <button onClick={() => toggleSection("paused")}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-yellow-500 hover:bg-[#383737]",
                !isOpen && "justify-center px-2"
              )}
            >
              <Pause className="h-5 w-5" />
              {isOpen && <span>Paused Campaigns {searchQuery && hasMatchingCampaigns(campaigns.paused) && '(matches found)'}</span>}
            </button>
            {isOpen && renderCampaignList(campaigns.paused, "paused")}

            <button onClick={() => toggleSection("draft")}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-400 hover:bg-[#383737]",
                !isOpen && "justify-center px-2"
              )}
            >
              <FilePen className="h-5 w-5" />
              {isOpen && <span>Draft Campaigns {searchQuery && hasMatchingCampaigns(campaigns.draft) && '(matches found)'}</span>}
            </button>
            {isOpen && renderCampaignList(campaigns.draft, "draft")}

            <button onClick={() => toggleSection("chats")}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-blue-500 hover:bg-[#383737]",
                !isOpen && "justify-center px-2"
              )}
            >
              <MessageSquare className="h-5 w-5" />
              {isOpen && <span>General Chats</span>}
            </button>
            {isOpen && expandedSection === "chats" && (
              <div className="space-y-1">
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className="group flex h-9 items-center gap-2.5 rounded-lg px-2 hover:bg-[#383737] cursor-pointer text-sm text-gray-400 hover:text-white ml-8"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">{chat.title}</span>
                  </div>
                ))}
                <div
                  onClick={() => navigate('/chat/new')}
                  className="group flex h-9 items-center gap-2.5 rounded-lg px-2 hover:bg-[#383737] cursor-pointer text-sm text-indigo-500 hover:text-indigo-400 ml-8"
                >
                  <Plus className="h-4 w-4" />
                  <span>New chat</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto px-3 pb-4 space-y-2">
          <button
            onClick={() => navigate('/account')}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#383737] rounded-lg",
              !isOpen && "justify-center px-2"
            )}
          >
            <UserCircle2 className="h-5 w-5" />
            {isOpen && (
              <div className="text-left">
                <div className="text-white">Your Account</div>
                <div className="text-xs">Standard Tier</div>
              </div>
            )}
          </button>

          <button
            onClick={() => navigate('/pricing')}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#383737] rounded-lg",
              !isOpen && "justify-center px-2"
            )}
          >
            <DollarSign className="h-5 w-5" />
            {isOpen && <span>Pricing</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
