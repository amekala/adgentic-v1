
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  title?: string;
}

const ChatHeader = ({ isSidebarOpen, title = "New Chat" }: ChatHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 h-[60px] border-b border-[#383737] bg-[#212121] bg-opacity-80 backdrop-blur-md px-4">
      <div className={`flex items-center gap-4 h-full transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <h1 className="text-lg font-semibold text-white truncate">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default ChatHeader;
