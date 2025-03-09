
import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';

interface EmptyStateProps {
  onSendMessage: (content: string) => void;
  onActionClick: (action: string) => void;
  isLoading: boolean;
}

const EmptyState = ({ onSendMessage, onActionClick, isLoading }: EmptyStateProps) => {
  return (
    <div className="w-full max-w-3xl px-4 space-y-4">
      <div>
        <h1 className="mb-8 text-4xl font-semibold text-center">What can I help with?</h1>
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
      <div className="mt-4">
        <ActionButtons onActionClick={onActionClick} />
      </div>
    </div>
  );
};

export default EmptyState;
