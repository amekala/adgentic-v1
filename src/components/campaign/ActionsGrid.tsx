
import React from 'react';
import { MessageSquare, BarChart2, Settings, FileText } from 'lucide-react';
import CampaignActionCard from './CampaignActionCard';

interface ActionsGridProps {
  onChatClick: () => void;
  onReportClick: () => void;
  onSettingsClick: () => void;
  onHistoryClick: () => void;
  chatsCount: number;
}

const ActionsGrid = ({ 
  onChatClick, 
  onReportClick, 
  onSettingsClick, 
  onHistoryClick,
  chatsCount 
}: ActionsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <CampaignActionCard
        title="Chat with AI"
        description="Ask me anything about your campaign"
        icon={<MessageSquare className="h-5 w-5" />}
        onClick={onChatClick}
      />
      
      <CampaignActionCard
        title="View Report"
        description="See detailed campaign performance"
        icon={<BarChart2 className="h-5 w-5" />}
        onClick={onReportClick}
      />
      
      <CampaignActionCard
        title="Campaign Settings"
        description="Update campaign configuration"
        icon={<Settings className="h-5 w-5" />}
        onClick={onSettingsClick}
      />
      
      <CampaignActionCard
        title="Past Conversations"
        description={`${chatsCount} chat${chatsCount !== 1 ? 's' : ''} in this campaign`}
        icon={<FileText className="h-5 w-5" />}
        onClick={onHistoryClick}
      />
    </div>
  );
};

export default ActionsGrid;
