import ChatActionPills from './ChatActionPills';

interface ChatEmptyStateProps {
  onPillClick: (message: string) => void;
}

const ChatEmptyState = ({ onPillClick }: ChatEmptyStateProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-adspirer-text-primary mb-8">Adspirer Chat Assistant</h2>
      <ChatActionPills onPillClick={onPillClick} className="mb-8" />
    </div>
  );
};

export default ChatEmptyState;
