
import { Menu, Play, Pause, FilePen, Plus, UserCircle2, DollarSign, Search, MessageSquare, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "./ui/input";
import { toast } from "sonner";

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

  const hasMatchingCampaigns = (items: Campaign[]) => {
    if (!searchQuery) return true;
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

  const renderCampaignSection = (title: string, campaigns: Campaign[], sectionKey: string, icon: React.ReactNode, textColorClass: string) => {
    if (!hasMatchingCampaigns(campaigns) && searchQuery) return null;
    
    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className={cn(
            "flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md",
            textColorClass,
            isOpen ? "hover:bg-[#2A2B32]" : "justify-center"
          )}
        >
          <div className="flex items-center gap-2">
            {icon}
            {isOpen && <span>{title}</span>}
          </div>
          {isOpen && campaigns.length > 0 && (
            <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSection !== sectionKey && "rotate-[-90deg]")} />
          )}
        </button>
        
        {isOpen && expandedSection === sectionKey && (
          <div className="mt-1 space-y-1">
            {filterCampaigns(campaigns).map(campaign => (
              <div key={campaign.id} className="mb-1">
                <div 
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[#2A2B32] cursor-pointer text-sm text-gray-300"
                  onClick={() => toggleCampaignExpansion(campaign.id)}
                >
                  <FolderOpen className="h-4 w-4 min-w-4 text-gray-400" />
                  <span className="truncate flex-1">{campaign.campaign_name}</span>
                  {expandedCampaigns[campaign.id] ? 
                    <ChevronDown className="h-3 w-3 min-w-3 text-gray-500" /> : 
                    <ChevronRight className="h-3 w-3 min-w-3 text-gray-500" />}
                </div>
                
                {expandedCampaigns[campaign.id] && (
                  <div className="ml-5 space-y-0.5 mt-0.5">
                    {campaignChats[campaign.id]?.map(chat => (
                      <div
                        key={chat.id}
                        onClick={() => navigate(`/chat/${chat.id}`)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#2A2B32] cursor-pointer text-xs text-gray-400 hover:text-white"
                      >
                        <MessageSquare className="h-3.5 w-3.5 min-w-3.5" />
                        <span className="truncate">{chat.title}</span>
                      </div>
                    ))}
                    <div
                      onClick={() => createNewChatForCampaign(campaign.id)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#2A2B32] cursor-pointer text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      <Plus className="h-3.5 w-3.5 min-w-3.5" />
                      <span>New chat</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={onToggle}
            className="h-10 w-10 rounded-md flex items-center justify-center bg-[#2F2F2F] hover:bg-[#383737]"
          >
            <Menu className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      )}
      <div className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-[#202123] transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        <div className="flex h-[60px] items-center px-3">
          <div className="flex w-full justify-between items-center">
            <button onClick={onToggle} className="h-10 rounded-md px-2 text-gray-400 hover:bg-[#2A2B32]">
              <Menu className="h-5 w-5" />
            </button>
            <button 
              onClick={onNewCampaign}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-blue-600 bg-blue-500 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

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

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="space-y-1">
            {renderCampaignSection(
              "Live Campaigns", 
              campaigns.live, 
              "live", 
              <Play className="h-5 w-5" />, 
              "text-green-500"
            )}
            
            {renderCampaignSection(
              "Paused Campaigns", 
              campaigns.paused, 
              "paused", 
              <Pause className="h-5 w-5" />, 
              "text-yellow-500"
            )}
            
            {renderCampaignSection(
              "Draft Campaigns", 
              campaigns.draft, 
              "draft", 
              <FilePen className="h-5 w-5" />, 
              "text-gray-400"
            )}

            <button 
              onClick={() => toggleSection("chats")}
              className={cn(
                "flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md text-blue-500 hover:bg-[#2A2B32]",
                !isOpen && "justify-center"
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {isOpen && <span>General Chats</span>}
              </div>
              {isOpen && chats.length > 0 && (
                <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSection !== "chats" && "rotate-[-90deg]")} />
              )}
            </button>
            
            {isOpen && expandedSection === "chats" && (
              <div className="mt-1 space-y-0.5">
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#2A2B32] cursor-pointer text-sm text-gray-400 hover:text-white ml-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">{chat.title}</span>
                  </div>
                ))}
                <div
                  onClick={() => navigate('/chat/new')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#2A2B32] cursor-pointer text-sm text-indigo-400 hover:text-indigo-300 ml-1"
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
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#2A2B32] rounded-md"
          >
            <UserCircle2 className="h-5 w-5" />
            <div className="text-left">
              <div className="text-white">Your Account</div>
              <div className="text-xs">Standard Tier</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/pricing')}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#2A2B32] rounded-md"
          >
            <DollarSign className="h-5 w-5" />
            <span>Pricing</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
