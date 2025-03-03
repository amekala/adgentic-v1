
import { Menu, Plus } from "lucide-react";

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewCampaign: () => void;
}

export const SidebarHeader = ({ isOpen, onToggle, onNewCampaign }: SidebarHeaderProps) => {
  return (
    <div className="flex h-[60px] items-center px-3">
      <div className="flex w-full justify-between items-center">
        <button 
          onClick={onToggle} 
          className="h-10 rounded-md px-2 text-adgentic-text-secondary hover:bg-adgentic-hover md:block"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        {isOpen && (
          <button 
            onClick={onNewCampaign}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-adgentic-accent hover:bg-blue-700 text-white"
            aria-label="Create new campaign"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Campaign</span>
          </button>
        )}
      </div>
    </div>
  );
};
