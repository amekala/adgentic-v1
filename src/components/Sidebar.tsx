
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
            <PenSquare className="h-5 w-5" />
          </button>
        </div>
      )}
      <div className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-[#2F2F2F] transition-all duration-300",
        isOpen ? "w-64" : "w-0"
      )}>
        <nav className="flex h-full w-full flex-col px-3" aria-label="Campaign navigation">
          <div className="flex justify-between flex h-[60px] items-center">
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

          <div onClick={() => navigate('/account')} className="mt-4 p-4 bg-[#383737] rounded-lg cursor-pointer hover:bg-[#404040] transition-colors">
            <div className="flex items-center gap-3">
              <UserCircle2 className="h-8 w-8 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-white">Your Account</div>
                <div className="text-xs text-gray-400">Standard Tier</div>
              </div>
            </div>
          </div>

          <div className="flex-col flex-1 transition-opacity duration-500 relative -mr-2 pr-2 overflow-y-auto mt-4">
            <div className="bg-[#2F2F2F] pt-0">
              <div className="flex flex-col gap-1">
                <div onClick={() => toggleSection("live")} className="flex items-center gap-2 px-3 py-2 text-sm font-medium cursor-pointer hover:bg-[#383737] rounded-lg text-green-500">
                  <Play className="h-4 w-4" />
                  <span>Live Campaigns</span>
                </div>
                {renderCampaignList(campaigns.live, "live")}

                <div onClick={() => toggleSection("paused")} className="flex items-center gap-2 px-3 py-2 text-sm font-medium cursor-pointer hover:bg-[#383737] rounded-lg text-yellow-500">
                  <Pause className="h-4 w-4" />
                  <span>Paused Campaigns</span>
                </div>
                {renderCampaignList(campaigns.paused, "paused")}

                <div onClick={() => toggleSection("draft")} className="flex items-center gap-2 px-3 py-2 text-sm font-medium cursor-pointer hover:bg-[#383737] rounded-lg text-gray-400">
                  <FilePen className="h-4 w-4" />
                  <span>Draft Campaigns</span>
                </div>
                {renderCampaignList(campaigns.draft, "draft")}
              </div>
            </div>
          </div>

          <div className="mt-auto pb-4">
            <button
              onClick={() => navigate('/pricing')}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#383737] rounded-lg"
            >
              <DollarSign className="h-4 w-4" />
              <span>Pricing</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
