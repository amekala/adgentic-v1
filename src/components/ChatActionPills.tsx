
import { BarChart3, Lightbulb, Target, PenSquare } from 'lucide-react';

interface ChatActionPillsProps {
  onPillClick?: (action: string) => void;
  className?: string;
}

const ChatActionPills = ({ onPillClick, className = '' }: ChatActionPillsProps) => {
  // Empty component - pills removed as requested
  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      {/* Pills have been removed as requested */}
    </div>
  );
};

export default ChatActionPills;
