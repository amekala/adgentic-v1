
import { Menu, Play, Pause, FilePen, Key, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onApiKeyChange: (apiKey: string) => void;
  onNewCampaign: () => void;
}

const Sidebar = ({ isOpen, onToggle, onApiKeyChange, onNewCampaign }: SidebarProps) => {
  const [apiKey, setApiKey] = useState("");
  const campaignGroups = [
    {
      title: "Live Campaigns",
      icon: <Play className="h-4 w-4 text-green-500" />,
      items: [] // Empty for now as placeholder
    },
    {
      title: "Paused Campaigns",
      icon: <Pause className="h-4 w-4 text-yellow-500" />,
      items: [] // Empty for now as placeholder
    },
    {
      title: "Draft Campaigns",
      icon: <FilePen className="h-4 w-4 text-gray-500" />,
      items: [] // Empty for now as placeholder
    }
  ];

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    onApiKeyChange(newApiKey);
  };

  return (
    <div className={cn(
      "fixed top-0 left-0 z-40 h-screen bg-chatgpt-sidebar transition-all duration-300",
      isOpen ? "w-64" : "w-0"
    )}>
      <nav className="flex h-full w-full flex-col px-3" aria-label="Campaign navigation">
        <div className="flex justify-between flex h-[60px] items-center">
          <button onClick={onToggle} className="h-10 rounded-lg px-2 text-token-text-secondary hover:bg-token-sidebar-surface-secondary">
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

        <div className="flex-col flex-1 transition-opacity duration-500 relative -mr-2 pr-2 overflow-y-auto">
          {isOpen && (
            <div className="p-2 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4" />
                <span className="text-sm">API Key</span>
              </div>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={handleApiKeyChange}
                className="bg-[#2F2F2F] border-none"
              />
            </div>
          )}

          <div className="bg-token-sidebar-surface-primary pt-0">
            <div className="mt-4 flex flex-col gap-4">
              {campaignGroups.map((group) => (
                <div key={group.title}>
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium">
                    {group.icon}
                    <span>{group.title}</span>
                  </div>
                  {group.items.map((item, index) => (
                    <div key={index} className="group flex h-10 items-center gap-2.5 rounded-lg px-2 hover:bg-token-sidebar-surface-secondary cursor-pointer">
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="flex flex-col py-2 border-t border-white/20">
            <button className="group flex gap-2 p-2.5 text-sm items-start hover:bg-token-sidebar-surface-secondary rounded-lg px-2 text-left w-full min-w-[200px]">
              <span className="flex w-full flex-row flex-wrap-reverse justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-token-border-light">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-sm">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12.5001 3.44338C12.1907 3.26474 11.8095 3.26474 11.5001 3.44338L4.83984 7.28868C4.53044 7.46731 4.33984 7.79744 4.33984 8.1547V15.8453C4.33984 16.2026 4.53044 16.5327 4.83984 16.7113L11.5001 20.5566C11.8095 20.7353 12.1907 20.7353 12.5001 20.5566L19.1604 16.7113C19.4698 16.5327 19.6604 16.2026 19.6604 15.8453V8.1547C19.6604 7.79744 19.4698 7.46731 19.1604 7.28868L12.5001 3.44338Z" fill="currentColor"/>
                    </svg>
                  </span>
                  <div className="flex flex-col">
                    <span>Upgrade plan</span>
                    <span className="line-clamp-1 text-xs text-token-text-tertiary">More access to the best models</span>
                  </div>
                </div>
              </span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
