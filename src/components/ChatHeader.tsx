
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu } from "lucide-react";
import { Link } from "react-router-dom";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  title?: string;
  campaignId?: string;
  campaignName?: string;
}

const ChatHeader = ({ 
  isSidebarOpen, 
  title = "New Chat", 
  campaignId, 
  campaignName 
}: ChatHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 h-[60px] border-b border-[#383737] bg-[#212121] bg-opacity-80 backdrop-blur-md px-4">
      <div className={`flex items-center gap-3 h-full transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {campaignId && campaignName && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link to={`/campaign/${campaignId}`} className="hover:text-white">
              {campaignName}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </div>
        )}
        <h1 className="text-lg font-semibold text-white truncate">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default ChatHeader;
