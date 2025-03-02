
import React from 'react';

interface CampaignActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
  primary?: boolean;
}

const CampaignActionCard = ({ 
  title, 
  description, 
  icon, 
  onClick,
  badge,
  primary = false
}: CampaignActionCardProps) => {
  return (
    <div 
      className={`group relative bg-white rounded-xl border overflow-hidden p-6 hover:shadow-md transition-all duration-200 cursor-pointer
        ${primary ? 'border-adgentic-accent/30 hover:border-adgentic-accent' : 'border-adgentic-border hover:border-adgentic-border/80'}`}
      onClick={onClick}
    >
      {/* Color accent on hover */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${primary ? 'bg-adgentic-accent' : 'bg-gray-200 group-hover:bg-adgentic-accent/40'}`}></div>
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg transition-colors ${
          primary ? 
          'bg-adgentic-accent/10 text-adgentic-accent' : 
          'bg-gray-100 text-adgentic-text-secondary group-hover:bg-adgentic-accent/5 group-hover:text-adgentic-accent/80'
        }`}>
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-adgentic-text-primary">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-adgentic-accent/10 text-adgentic-accent">
              {badge}
            </span>
          )}
        </div>
      </div>
      <p className="text-adgentic-text-secondary">{description}</p>
    </div>
  );
};

export default CampaignActionCard;
