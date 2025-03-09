
import React from 'react';
import { ArrowLeft, MoreVertical, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash2 } from 'lucide-react';
import { ChatData } from '@/hooks/useCurrentChat';
import { Link } from 'react-router-dom';

interface ChatPageHeaderProps {
  chatData: ChatData | null;
  onBackClick: () => void;
  onDeleteChat: () => void;
  isSidebarOpen: boolean;
}

const ChatPageHeader: React.FC<ChatPageHeaderProps> = ({ 
  chatData, 
  onBackClick, 
  onDeleteChat,
  isSidebarOpen
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 h-[60px] border-b border-adspirer-border bg-white bg-opacity-80 backdrop-blur-md px-4">
      <div className={`flex items-center justify-between h-full transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackClick}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Link to="/">
            <Button 
              variant="ghost"
              className="flex items-center mr-2 px-3 text-sm font-medium"
            >
              <Home className="h-5 w-5 mr-1.5" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
          
          <h1 className="text-lg font-semibold text-adspirer-text-primary truncate">
            {chatData?.title || 'New Chat'}
          </h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDeleteChat} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ChatPageHeader;
