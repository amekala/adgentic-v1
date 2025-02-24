
import { BarChart3, Lightbulb, Target, Sparkles } from 'lucide-react';

interface ChatActionPillsProps {
  onPillClick: (action: string) => void;
}

const ChatActionPills = ({ onPillClick }: ChatActionPillsProps) => {
  const suggestions = [
    {
      id: 'analyze',
      label: 'Analyze Performance',
      icon: <BarChart3 className="h-4 w-4" />,
      message: "Can you analyze my campaign's performance and suggest improvements?"
    },
    {
      id: 'ideas',
      label: 'Get Ideas',
      icon: <Lightbulb className="h-4 w-4" />,
      message: "What are some creative ideas to improve my campaign?"
    },
    {
      id: 'targeting',
      label: 'Targeting Help',
      icon: <Target className="h-4 w-4" />,
      message: "Help me optimize my campaign targeting strategy"
    },
    {
      id: 'optimize',
      label: 'Optimization Tips',
      icon: <Sparkles className="h-4 w-4" />,
      message: "What are the best practices for optimizing my campaign?"
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="space-y-3">
        <p className="text-sm text-gray-400">
          Ask me anything about your campaign, or try these suggestions:
        </p>
        <div className="bg-[#2F2F2F] rounded-lg p-3 flex gap-2 overflow-x-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => onPillClick(suggestion.message)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#383737] hover:bg-[#444444] transition-colors text-sm text-gray-300 hover:text-white whitespace-nowrap"
            >
              {suggestion.icon}
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatActionPills;
