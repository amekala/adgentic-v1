
import { Play, Pause, FilePen } from "lucide-react";
import { useState, useEffect } from "react";
import CampaignListItem from "./CampaignListItem";
import { Chat } from "@/types/chat";

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_status: 'draft' | 'live' | 'paused';
}

interface CampaignListProps {
  campaigns: {
    live: Campaign[];
    paused: Campaign[];
    draft: Campaign[];
  };
  campaignChats: Record<string, Chat[]>;
  expandedCampaigns: Record<string, boolean>;
  expandedSection: string;
  toggleSection: (section: string) => void;
  toggleCampaignExpansion: (campaignId: string) => void;
  createNewChatForCampaign: (campaignId: string) => void;
  searchQuery: string;
  isOpen: boolean;
}

const CampaignList = ({
  campaigns,
  campaignChats,
  expandedCampaigns,
  expandedSection,
  toggleSection,
  toggleCampaignExpansion,
  createNewChatForCampaign,
  searchQuery,
  isOpen
}: CampaignListProps) => {
  
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

  const renderCampaignSection = (title: string, campaigns: Campaign[], sectionKey: string, icon: React.ReactNode, textColorClass: string) => {
    if (!hasMatchingCampaigns(campaigns) && searchQuery) return null;
    
    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md ${textColorClass} ${isOpen ? "hover:bg-adgentic-hover" : "justify-center"}`}
        >
          <div className="flex items-center gap-2">
            {icon}
            {isOpen && <span>{title}</span>}
          </div>
          {isOpen && campaigns.length > 0 && (
            <div className={`h-4 w-4 transition-transform ${expandedSection !== sectionKey && "rotate-[-90deg]"}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          )}
        </button>
        
        {isOpen && expandedSection === sectionKey && (
          <div className="mt-1 space-y-1">
            {filterCampaigns(campaigns).map(campaign => (
              <CampaignListItem
                key={campaign.id}
                campaign={campaign}
                isExpanded={expandedCampaigns[campaign.id]}
                campaignChats={campaignChats}
                onToggle={toggleCampaignExpansion}
                onCreateChat={createNewChatForCampaign}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {renderCampaignSection(
        "Live Campaigns", 
        campaigns.live, 
        "live", 
        <Play className="h-5 w-5" />, 
        "text-green-600"
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
        "text-adgentic-text-secondary"
      )}
    </div>
  );
};

export default CampaignList;
