
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
import { SidebarHeader } from "./sidebar/SidebarHeader";
import useSidebarData from "./sidebar/useSidebarData";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onApiKeyChange: (apiKey: string) => void;
  onNewCampaign: () => void;
}

const Sidebar = ({ isOpen, onToggle, onApiKeyChange, onNewCampaign }: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    campaigns, 
    chats, 
    campaignChats,
    expandedCampaigns,
    expandedSection,
    setExpandedCampaigns,
    setExpandedSection,
    createNewChatForCampaign
  } = useSidebarData();

  const toggleCampaignExpansion = (campaignId: string) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={onToggle}
            className="h-10 w-10 rounded-md flex items-center justify-center bg-white shadow-sm border border-adspirer-border hover:bg-adspirer-hover"
          >
            <Menu className="h-5 w-5 text-adspirer-text-primary" />
          </button>
        </div>
      )}
      <div className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-adspirer-sidebar border-r border-adspirer-border transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        <SidebarHeader isOpen={isOpen} onToggle={onToggle} onNewCampaign={onNewCampaign} />

        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-adspirer-text-light" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-adspirer-border text-adspirer-text-primary placeholder-adspirer-text-light h-9"
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

        <SidebarFooter isOpen={isOpen} />
      </div>
    </>
  );
};

export default Sidebar;
