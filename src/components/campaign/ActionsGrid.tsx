
import React from 'react';
import { MessageSquare, BarChart2, Settings, FileText, Zap, Target, ShoppingCart, Lightbulb } from 'lucide-react';
import CampaignActionCard from './CampaignActionCard';

interface ActionsGridProps {
  onChatClick: () => void;
  onReportClick: () => void;
  onSettingsClick: () => void;
  onHistoryClick: () => void;
  chatsCount: number;
  campaignStatus: string;
}

const ActionsGrid = ({ 
  onChatClick, 
  onReportClick, 
  onSettingsClick, 
  onHistoryClick,
  chatsCount,
  campaignStatus
}: ActionsGridProps) => {
  // Determine if the campaign is active
  const isActive = campaignStatus === 'live';
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-adgentic-text-primary mb-4">Campaign Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Primary actions */}
        <CampaignActionCard
          title="Chat with AI Assistant"
          description="Get insights and optimize your campaign with AI"
          icon={<MessageSquare className="h-5 w-5" />}
          onClick={onChatClick}
          primary={true}
        />
        
        <CampaignActionCard
          title="Performance Dashboard"
          description="Analytics and performance metrics"
          icon={<BarChart2 className="h-5 w-5" />}
          onClick={onReportClick}
          badge={isActive ? "Live" : ""}
        />
        
        <CampaignActionCard
          title="Campaign Settings"
          description="Configure budget, schedule, and targeting"
          icon={<Settings className="h-5 w-5" />}
          onClick={onSettingsClick}
        />
        
        {/* Secondary actions */}
        <CampaignActionCard
          title="Past Conversations"
          description={`${chatsCount} conversation${chatsCount !== 1 ? 's' : ''} history`}
          icon={<FileText className="h-5 w-5" />}
          onClick={onHistoryClick}
          badge={chatsCount > 0 ? `${chatsCount}` : ""}
        />
        
        <CampaignActionCard
          title="Optimization Ideas"
          description="AI-powered suggestions to improve performance"
          icon={<Lightbulb className="h-5 w-5" />}
          onClick={onChatClick}
        />
        
        <CampaignActionCard
          title="Audience Targeting"
          description="Review and refine your audience segments"
          icon={<Target className="h-5 w-5" />}
          onClick={() => onChatClick()}
        />
      </div>
    </div>
  );
};

export default ActionsGrid;
