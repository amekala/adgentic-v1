import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';

interface EmptyStateProps {
  onSendMessage: (content: string) => void;
  onActionClick: (action: string) => void;
  isLoading: boolean;
}

const EmptyState = ({ onSendMessage, onActionClick, isLoading }: EmptyStateProps) => {
  return (
    <div className="w-full max-w-3xl px-4 flex flex-col h-full justify-center">
      <div className="flex flex-col items-center justify-center gap-8 mb-12">
        <h1 className="text-4xl font-semibold text-center">What can I help with?</h1>
        <ActionButtons onActionClick={onActionClick} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-10 min-h-[76px]">
        <div className="w-full max-w-3xl mx-auto">
          <ChatInput onSend={onSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
