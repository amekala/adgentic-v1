
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import NewCampaignModal from '@/components/NewCampaignModal';
import IndexContent from '@/components/home/IndexContent';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartNewCampaign = () => {
    setIsNewCampaignModalOpen(true);
  };

  const handleCreateCampaign = async (data: { name: string; goals: string; notes: string }) => {
    setIsNewCampaignModalOpen(false);
    // Navigate to the new campaign page with the data
    navigate('/campaign/new', { state: { campaignData: data } });
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
