
import { useState } from "react";
import { FolderOpen, ChevronDown, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Chat } from "@/types/chat";

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_status: 'draft' | 'live' | 'paused';
}

interface CampaignListItemProps {
  campaign: Campaign;
  isExpanded: boolean;
  campaignChats: Record<string, Chat[]>;
  onToggle: (id: string) => void;
  onCreateChat: (campaignId: string) => void;
}

const CampaignListItem = ({ 
  campaign, 
  isExpanded, 
  campaignChats, 
  onToggle,
  onCreateChat
}: CampaignListItemProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-1">
      <div 
        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-adgentic-hover cursor-pointer text-sm text-adgentic-text-secondary"
      >
        <div 
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/campaign/${campaign.id}`);
          }}
        >
          <FolderOpen className="h-4 w-4 min-w-4 text-adgentic-text-secondary" />
        </div>
        <span 
          className="truncate flex-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/campaign/${campaign.id}`);
          }}
        >
          {campaign.campaign_name}
        </span>
        <div 
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(campaign.id);
          }}
        >
          {isExpanded ? 
            <ChevronDown className="h-3 w-3 min-w-3 text-adgentic-text-light" /> : 
            <ChevronRight className="h-3 w-3 min-w-3 text-adgentic-text-light" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="ml-5 space-y-0.5 mt-0.5">
          {campaignChats[campaign.id]?.map(chat => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-adgentic-hover cursor-pointer text-xs text-adgentic-text-light hover:text-adgentic-text-primary"
            >
              <MessageSquare className="h-3.5 w-3.5 min-w-3.5" />
              <span className="truncate">{chat.title}</span>
            </div>
          ))}
          <div
            onClick={() => onCreateChat(campaign.id)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-adgentic-hover cursor-pointer text-xs text-adgentic-accent hover:text-blue-700"
          >
            <Plus className="h-3.5 w-3.5 min-w-3.5" />
            <span>New chat</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignListItem;
