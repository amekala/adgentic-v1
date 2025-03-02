
import { useNavigate } from "react-router-dom";
import { FileText, MessageSquare, BarChart, Settings } from "lucide-react";
import CampaignMetrics from "./CampaignMetrics";

interface CampaignContentProps {
  campaignId: string;
  chats: any[];
}

const CampaignContent = ({ campaignId, chats }: CampaignContentProps) => {
  const navigate = useNavigate();
  
  // Sample metrics
  const metrics = [
    { id: '1', label: 'Impressions', value: '143,892', timeframe: 'Last 30 days' },
    { id: '2', label: 'Clicks', value: '12,453', timeframe: 'Last 30 days' },
    { id: '3', label: 'CTR', value: '8.65%', timeframe: 'Last 30 days' },
    { id: '4', label: 'ACOS', value: '15.2%', timeframe: 'Last 30 days' }
  ];

  // Action cards
  const actionCards = [
    {
      id: "chat",
      title: "Chat with AI",
      description: "Ask me anything about your campaign",
      icon: <MessageSquare className="h-6 w-6 text-adgentic-accent" />,
      action: () => navigate(`/chat/new?campaign_id=${campaignId}`)
    },
    {
      id: "report",
      title: "View Report",
      description: "See detailed campaign performance",
      icon: <BarChart className="h-6 w-6 text-adgentic-accent" />,
      action: () => console.log("View report")
    },
    {
      id: "settings",
      title: "Campaign Settings",
      description: "Update campaign configuration",
      icon: <Settings className="h-6 w-6 text-adgentic-accent" />,
      action: () => console.log("Campaign settings")
    },
    {
      id: "history",
      title: "Past Conversations",
      description: `${chats.length} chat${chats.length !== 1 ? 's' : ''} in this campaign`,
      icon: <FileText className="h-6 w-6 text-adgentic-accent" />,
      action: () => console.log("View history")
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {actionCards.map((card) => (
            <div 
              key={card.id}
              onClick={card.action}
              className="bg-white rounded-xl border border-adgentic-border p-6 shadow-sm hover:bg-adgentic-hover cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{card.icon}</div>
                <div>
                  <h3 className="font-semibold text-adgentic-text-primary mb-1">{card.title}</h3>
                  <p className="text-sm text-adgentic-text-secondary">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <CampaignMetrics metrics={metrics} />
      </div>
    </div>
  );
};

export default CampaignContent;
