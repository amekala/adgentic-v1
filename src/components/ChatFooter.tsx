
import ChatInput from './ChatInput';

interface ChatFooterProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const ChatFooter = ({ onSend, isLoading }: ChatFooterProps) => {
  return (
    <div className="space-y-4 mt-auto px-4">
      <div className="w-full max-w-3xl mx-auto">
        <ChatInput onSend={onSend} isLoading={isLoading} />
      </div>
      <div className="text-xs text-center text-adgentic-text-secondary">
        Adgentic can make mistakes. Check important info.
      </div>
    </div>
  );
};

export default ChatFooter;
