
import { BarChart3, Lightbulb, Target, PenSquare } from 'lucide-react';

interface ChatActionPillsProps {
  onPillClick?: (action: string) => void;
  className?: string;
}

const ChatActionPills = ({ onPillClick, className = '' }: ChatActionPillsProps) => {
  // Suggestions with rich styling and clear visual design
  const suggestions = [
    {
      id: 'analyze',
      label: 'Campaign Analysis',
      icon: <BarChart3 className="h-4 w-4" />,
      message: "Let's analyze your campaign performance and find opportunities for improvement.",
      color: "bg-blue-50 text-blue-900",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500"
    },
    {
      id: 'ideas',
      label: 'Get Ideas',
      icon: <Lightbulb className="h-4 w-4" />,
      message: "I'll help you brainstorm creative ideas to enhance your campaign.",
      color: "bg-amber-50 text-amber-900",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500"
    },
    {
      id: 'targeting',
      label: 'Targeting Strategy',
      icon: <Target className="h-4 w-4" />,
      message: "Let's optimize your campaign targeting strategy.",
      color: "bg-green-50 text-green-900",
      iconBg: "bg-green-100",
      iconColor: "text-green-500"
    },
    {
      id: 'optimize',
      label: 'Campaign Goals',
      icon: <PenSquare className="h-4 w-4" />,
      message: "Let's define clear goals and KPIs for your campaign.",
      color: "bg-purple-50 text-purple-900",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500"
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${suggestion.color || 'bg-white'} border border-transparent hover:border-adgentic-border shadow-sm transition-all text-sm`}
            >
              <div className={`p-2 rounded-md ${suggestion.iconBg || 'bg-white'} ${suggestion.iconColor || 'text-adgentic-accent'}`}>
                {suggestion.icon}
              </div>
              <span className="font-medium">{suggestion.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatActionPills;
