
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
  
  // Chat count for this campaign
  const chatCount = campaignChats[campaign.id]?.length || 0;

  // Status indicator color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  // Navigate to campaign page
  const handleCampaignClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/campaign/${campaign.id}`);
  };

  // Toggle campaign expansion
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(campaign.id);
  };

  // Navigate to chat page with campaign context
  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}?campaign_id=${campaign.id}`);
  };

  return (
    <div className="mb-2">
      {/* Campaign header row */}
      <div 
        className={`flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer text-sm 
                   ${isExpanded ? 'bg-adgentic-hover text-adgentic-text-primary' : 'hover:bg-adgentic-hover text-adgentic-text-secondary'}`}
      >
        {/* Campaign status indicator */}
        <div className={`w-2 h-2 rounded-full ${getStatusColor(campaign.campaign_status)}`}></div>
        
        {/* Campaign folder icon - clicking navigates to campaign */}
        <div 
          className="cursor-pointer p-1 rounded hover:bg-adgentic-hover"
          onClick={handleCampaignClick}
        >
          <FolderOpen className="h-4 w-4 min-w-4 text-adgentic-accent" />
        </div>
        
        {/* Campaign name - clicking navigates to campaign */}
        <span 
          className="truncate flex-1 cursor-pointer hover:text-adgentic-accent"
          onClick={handleCampaignClick}
        >
          {campaign.campaign_name}
        </span>
        
        {/* Chat count badge */}
        {chatCount > 0 && (
          <span className="text-xs bg-adgentic-lightGray text-adgentic-text-secondary px-1.5 py-0.5 rounded-full">
            {chatCount}
          </span>
        )}
        
        {/* Expand/collapse arrow - clicking toggles expansion */}
        <div 
          onClick={handleToggleClick} 
          className="p-1.5 rounded hover:bg-adgentic-hover"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? 
            <ChevronDown className="h-3 w-3 min-w-3 text-adgentic-text-light" /> : 
            <ChevronRight className="h-3 w-3 min-w-3 text-adgentic-text-light" />}
        </div>
      </div>
      
      {/* Expanded chats list */}
      {isExpanded && (
        <div className="ml-7 space-y-0.5 mt-1 border-l border-adgentic-border pl-2">
          {/* Only show existing chats if there are any */}
          {campaignChats[campaign.id]?.length > 0 ? (
            <>
              {/* Map through chats */}
              {campaignChats[campaign.id].map(chat => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-adgentic-hover cursor-pointer text-xs text-adgentic-text-light hover:text-adgentic-text-primary"
                >
                  <MessageSquare className="h-3.5 w-3.5 min-w-3.5" />
                  <span className="truncate">{chat.title}</span>
                </div>
              ))}
              
              {/* New chat button */}
              <div
                onClick={() => onCreateChat(campaign.id)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-adgentic-hover cursor-pointer text-xs text-adgentic-accent hover:text-blue-700"
              >
                <Plus className="h-3.5 w-3.5 min-w-3.5" />
                <span>New chat</span>
              </div>
            </>
          ) : (
            // No chats message with new chat button
            <div className="py-1 px-2">
              <div className="text-xs text-adgentic-text-light mb-1">No chats yet</div>
              <div
                onClick={() => onCreateChat(campaign.id)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-adgentic-hover cursor-pointer text-xs text-adgentic-accent hover:text-blue-700"
              >
                <Plus className="h-3.5 w-3.5 min-w-3.5" />
                <span>Start a conversation</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignListItem;
