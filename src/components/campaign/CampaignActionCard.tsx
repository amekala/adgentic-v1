
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CampaignActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const CampaignActionCard = ({ title, description, icon, onClick }: CampaignActionCardProps) => {
  return (
    <div 
      className="bg-white rounded-xl border border-adgentic-border p-6 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="text-adgentic-accent">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-adgentic-text-primary">{title}</h3>
      </div>
      <p className="text-adgentic-text-secondary">{description}</p>
    </div>
  );
};

export default CampaignActionCard;
