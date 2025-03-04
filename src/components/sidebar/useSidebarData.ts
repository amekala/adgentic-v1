
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Chat } from "@/types/chat";
import { useAuth } from "@/context/AuthContext";

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_status: 'draft' | 'live' | 'paused';
}

const useSidebarData = () => {
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedSection, setExpandedSection] = useState<string>("live");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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
      if (!user) return;
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, campaign_name, campaign_status')
        .eq('created_by', user.id);

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
              .eq('created_by', user.id)
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
      if (!user) return;
      
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('created_by', user.id)
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

    if (user) {
      fetchCampaigns();
      fetchChats();
    }

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
  }, [location.pathname, user]);

  const createNewChatForCampaign = async (campaignId: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to create a chat");
        return;
      }
      
      // Create new chat for campaign
      const { data, error } = await supabase
        .from('chats')
        .insert({
          title: 'New Chat',
          chat_type: 'campaign',
          campaign_id: campaignId,
          created_by: user.id
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

  return {
    campaigns,
    chats,
    campaignChats,
    expandedCampaigns,
    expandedSection,
    setExpandedCampaigns,
    setExpandedSection,
    createNewChatForCampaign
  };
};

export default useSidebarData;
