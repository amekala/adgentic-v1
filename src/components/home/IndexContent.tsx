
import ChatInterface from './ChatInterface';
import ChatActions from './ChatActions';

interface IndexContentProps {
  isSidebarOpen: boolean;
  onNewCampaign: () => void;
}

const IndexContent = ({ isSidebarOpen, onNewCampaign }: IndexContentProps) => {
  const { handleActionClick } = ChatActions({ onNewCampaign });

  return (
    <div className={`flex h-full flex-col`}>
      <ChatInterface onActionClick={handleActionClick} />
    </div>
  );
};

export default IndexContent;
