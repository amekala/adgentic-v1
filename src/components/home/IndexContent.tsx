import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from './ChatInterface';

interface IndexContentProps {
  isSidebarOpen: boolean;
  onNewCampaign: () => void;
}

const IndexContent = ({ isSidebarOpen, onNewCampaign }: IndexContentProps) => {
  const navigate = useNavigate();

  const handleActionClick = (action: string) => {
    if (action === 'Create Campaign') {
      onNewCampaign();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6 h-full pt-[60px]">
      <div className="flex flex-col">
        <ChatInterface onActionClick={handleActionClick} />
      </div>
    </div>
  );
};

export default IndexContent;
