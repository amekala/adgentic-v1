
import { User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SidebarFooterProps {
  isOpen: boolean;
}

const SidebarFooter = ({ isOpen }: SidebarFooterProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const handleAccountClick = () => {
    navigate('/account');
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  const displayName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : user?.email;

  return (
    <div className={`mt-auto p-3 border-t border-adgentic-border ${!isOpen ? 'flex justify-center' : ''}`}>
      {isOpen && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-adgentic-accent text-white flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="truncate">
              <div className="text-sm font-medium text-adgentic-text-primary truncate" title={displayName}>
                {displayName}
              </div>
              <div className="text-xs text-adgentic-text-secondary truncate" title={user?.email}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`flex ${isOpen ? 'gap-2' : 'flex-col gap-3'}`}>
        <Button
          onClick={handleAccountClick}
          variant="ghost"
          size="sm"
          className={`text-adgentic-text-secondary hover:text-adgentic-accent hover:bg-adgentic-hover ${
            !isOpen ? 'w-8 h-8 p-0 flex justify-center' : 'w-full justify-start'
          }`}
        >
          <Settings className="h-4 w-4 min-w-4" />
          {isOpen && <span className="ml-2">Settings</span>}
        </Button>
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className={`text-adgentic-text-secondary hover:text-red-500 hover:bg-adgentic-hover ${
            !isOpen ? 'w-8 h-8 p-0 flex justify-center' : 'w-full justify-start'
          }`}
        >
          <LogOut className="h-4 w-4 min-w-4" />
          {isOpen && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default SidebarFooter;
