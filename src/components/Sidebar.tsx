
import { Menu, Play, Pause, FilePen, Plus, PenSquare, UserCircle2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onApiKeyChange: (apiKey: string) => void;
  onNewCampaign: () => void;
}

// Example static campaign data
const campaigns = {
  live: [
    { id: 1, name: "New Product Launch" },
    { id: 2, name: "Holiday Season Campaign" }
  ],
  paused: [
    { id: 3, name: "Summer Sale" }
  ],
  draft: [
    { id: 4, name: "Black Friday 2024" }
  ]
};

const Sidebar = ({ isOpen, onToggle, onApiKeyChange, onNewCampaign }: SidebarProps) => {
  const [expandedSection, setExpandedSection] = useState<string>("live");
  const navigate = useNavigate();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const renderCampaignList = (items: typeof campaigns.live, sectionKey: string) => (
    <div className={cn("space-y-1", expandedSection === sectionKey ? "block" : "hidden")}>
      {items.map(campaign => (
        <div
          key={campaign.id}
          className="group flex h-9 items-center gap-2.5 rounded-lg px-2 hover:bg-[#383737] cursor-pointer text-sm text-gray-400 hover:text-white ml-8"
        >
          {campaign.name}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {!isOpen && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={onToggle}
            className="h-10 w-10 rounded-lg flex items-center justify-center bg-[#2F2F2F] hover:bg-[#383737]"
          >
            <Menu className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      )}
      <div className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-[#2F2F2F] transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-16"
      )}>
        <div className="flex h-[60px] items-center px-3">
          {isOpen ? (
            <div className="flex w-full justify-between items-center">
              <button onClick={onToggle} className="h-10 rounded-lg px-2 text-gray-400 hover:bg-[#383737]">
                <Menu className="h-5 w-5" />
              </button>
              <button 
                onClick={onNewCampaign}
                className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm hover:bg-blue-600 bg-blue-500 text-white"
              >
                <Plus className="h-4 w-4" />
                <span>New Campaign</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onNewCampaign}
              className="w-full flex justify-center items-center h-10 rounded-lg hover:bg-[#383737]"
            >
              <Plus className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <div className="space-y-1">
            <button onClick={() => toggleSection("live")} 
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-green-500 hover:bg-[#383737]",
                !isOpen && "justify-center px-2"
              )}
            >
              <Play className="h-5 w-5" />
              {isOpen && <span>Live Campaigns</span>}
            </button>
            {isOpen && renderCampaignList(campaigns.live, "live")}

            <button onClick={() => toggleSection("paused")}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-yellow-500 hover:bg-[#383737]",
                !isOpen && "justify-center px-2"
              )}
            >
              <Pause className="h-5 w-5" />
              {isOpen && <span>Paused Campaigns</span>}
            </button>
            {isOpen && renderCampaignList(campaigns.paused, "paused")}

            <button onClick={() => toggleSection("draft")}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-400 hover:bg-[#383737]",
                !isOpen && "justify-center px-2"
              )}
            >
              <FilePen className="h-5 w-5" />
              {isOpen && <span>Draft Campaigns</span>}
            </button>
            {isOpen && renderCampaignList(campaigns.draft, "draft")}
          </div>
        </div>

        <div className="mt-auto px-3 pb-4 space-y-2">
          <button
            onClick={() => navigate('/account')}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#383737] rounded-lg",
              !isOpen && "justify-center px-2"
            )}
          >
            <UserCircle2 className="h-5 w-5" />
            {isOpen && (
              <div className="text-left">
                <div className="text-white">Your Account</div>
                <div className="text-xs">Standard Tier</div>
              </div>
            )}
          </button>

          <button
            onClick={() => navigate('/pricing')}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#383737] rounded-lg",
              !isOpen && "justify-center px-2"
            )}
          >
            <DollarSign className="h-5 w-5" />
            {isOpen && <span>Pricing</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
