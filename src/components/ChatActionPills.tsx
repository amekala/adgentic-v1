
import { BarChart3, Lightbulb, Target, PenSquare } from 'lucide-react';

interface ChatActionPillsProps {
  onPillClick?: (action: string) => void;
  className?: string;
}

const ChatActionPills = ({ onPillClick, className = '' }: ChatActionPillsProps) => {
  const suggestions = [
    {
      id: 'analyze',
      label: 'Campaign Analysis',
      icon: <BarChart3 className="h-4 w-4" />,
      message: "Let's analyze your campaign performance and find opportunities for improvement."
    },
    {
      id: 'ideas',
      label: 'Get Ideas',
      icon: <Lightbulb className="h-4 w-4" />,
      message: "I'll help you brainstorm creative ideas to enhance your campaign."
    },
    {
      id: 'targeting',
      label: 'Targeting Strategy',
      icon: <Target className="h-4 w-4" />,
      message: "Let's optimize your campaign targeting strategy."
    },
    {
      id: 'optimize',
      label: 'Campaign Goals',
      icon: <PenSquare className="h-4 w-4" />,
      message: "Let's define clear goals and KPIs for your campaign."
    }
  ];

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <div className="space-y-3">
        <p className="text-sm text-adgentic-text-secondary">
          Get started with one of these topics, or ask me anything about your campaign:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => onPillClick?.(suggestion.message)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-adgentic-lightGray hover:bg-gray-200 transition-colors text-sm text-adgentic-text-primary"
            >
              <div className="p-2 rounded-md bg-white border border-adgentic-border text-adgentic-accent">
                {suggestion.icon}
              </div>
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatActionPills;
