import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import NewCampaignModal from '@/components/NewCampaignModal';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import IndexContent from '@/components/home/IndexContent';

export default function Index() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if device is mobile for initial sidebar state
  useEffect(() => {
    const checkIsMobile = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    
    // Set initial state
    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleNewCampaign = () => {
    setIsNewCampaignModalOpen(true);
  };

  const handleCreateCampaign = async (data: { name: string; goals: string; notes: string }) => {
    setIsLoading(true);
    
    try {
      // Create new campaign with user reference
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          campaign_name: data.name.trim(),
          goals_description: data.goals.trim() || null,
          campaign_notes: data.notes.trim() || null,
          campaign_status: 'draft',
          created_by: user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Campaign created successfully!');
      
      // Navigate to campaign page
      setIsNewCampaignModalOpen(false);
      navigate(`/campaign/${campaign.id}`);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast.error(error.message || "Failed to create campaign. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#212121]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={handleNewCampaign}
      />
      
      <IndexContent 
        isSidebarOpen={isSidebarOpen} 
        onNewCampaign={handleNewCampaign} 
      />
      
      <NewCampaignModal
        isOpen={isNewCampaignModalOpen}
        onClose={() => setIsNewCampaignModalOpen(false)}
        onCreateCampaign={handleCreateCampaign}
      />
    </div>
  );
}
