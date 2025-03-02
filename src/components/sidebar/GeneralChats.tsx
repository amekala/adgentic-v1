
import { MessageSquare, Plus, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  chat_type: string;
  created_at: string;
  campaign_id: string | null;
}

interface GeneralChatsProps {
  isOpen: boolean;
  expandedSection: string;
  toggleSection: (section: string) => void;
  chats: Chat[];
}

const GeneralChats = ({ isOpen, expandedSection, toggleSection, chats }: GeneralChatsProps) => {
  const navigate = useNavigate();
  
  return (
    <div>
      <button 
        onClick={() => toggleSection("chats")}
        className={cn(
          "flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md text-adgentic-accent hover:bg-adgentic-hover",
          !isOpen && "justify-center"
        )}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {isOpen && <span>General Chats</span>}
        </div>
        {isOpen && chats.length > 0 && (
          <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSection !== "chats" && "rotate-[-90deg]")} />
        )}
      </button>
      
      {isOpen && expandedSection === "chats" && (
        <div className="mt-1 space-y-0.5">
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-adgentic-hover cursor-pointer text-sm text-adgentic-text-secondary hover:text-adgentic-text-primary ml-1"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="truncate">{chat.title}</span>
            </div>
          ))}
          <div
            onClick={() => navigate('/chat/new')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-adgentic-hover cursor-pointer text-sm text-adgentic-accent hover:text-blue-700 ml-1"
          >
            <Plus className="h-4 w-4" />
            <span>New chat</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralChats;
