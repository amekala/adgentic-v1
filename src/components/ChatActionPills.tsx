interface ChatActionPillsProps {
  onPillClick?: (action: string) => void;
  className?: string;
}

const ChatActionPills = ({ onPillClick, className = '' }: ChatActionPillsProps) => {
  // Empty implementation - we're removing the chat action pills as requested
  return null;
};

export default ChatActionPills;
