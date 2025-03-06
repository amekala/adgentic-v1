
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import NewCampaignModal from '@/components/NewCampaignModal';
import IndexContent from '@/components/home/IndexContent';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartNewCampaign = () => {
    setIsNewCampaignModalOpen(true);
  };

  const handleCreateCampaign = async (data: { name: string; goals: string; notes: string }) => {
    setIsNewCampaignModalOpen(false);
    // Navigate to the new campaign page with the data
    navigate('/campaign/new', { state: { campaignData: data } });
  };

  const handleResetData = async () => {
    if (!user) return;
    
    try {
      setIsResetting(true);
      
      // Step 1: Get all chats for the current user
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('id')
        .eq('created_by', user.id);
        
      if (chatsError) throw chatsError;
      
      // Step 2: Delete all chat messages
      if (chats && chats.length > 0) {
        const chatIds = chats.map(chat => chat.id);
        
        const { error: messagesError } = await supabase
          .from('chat_messages')
          .delete()
          .in('chat_id', chatIds);
          
        if (messagesError) throw messagesError;
      }
      
      // Step 3: Delete all chats
      const { error: deleteChatsError } = await supabase
        .from('chats')
        .delete()
        .eq('created_by', user.id);
        
      if (deleteChatsError) throw deleteChatsError;
      
      // Step 4: Delete all campaigns
      const { error: campaignsError } = await supabase
        .from('campaigns')
        .delete()
        .eq('created_by', user.id);
        
      if (campaignsError) throw campaignsError;
      
      toast.success('All data has been reset successfully');
      
      // Force a reload to refresh the page and sidebar data
      window.location.reload();
      
    } catch (error: any) {
      console.error('Error resetting data:', error);
      toast.error(`Failed to reset data: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={handleStartNewCampaign}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} />
        
        <div className="px-6 py-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mb-4">
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your campaigns and chats. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleResetData}
                  disabled={isResetting}
                >
                  {isResetting ? 'Resetting...' : 'Reset Data'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <IndexContent 
          isSidebarOpen={isSidebarOpen} 
          onNewCampaign={handleStartNewCampaign} 
        />
      </main>

      <NewCampaignModal
        isOpen={isNewCampaignModalOpen}
        onClose={() => setIsNewCampaignModalOpen(false)}
        onCreateCampaign={handleCreateCampaign}
      />
    </div>
  );
};

export default Index;
