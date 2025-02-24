
import { BarChart3, Lightbulb, Pause, Play } from 'lucide-react';

interface ChatActionPillsProps {
  onPillClick: (action: string) => void;
}

const ChatActionPills = ({ onPillClick }: ChatActionPillsProps) => {
  const pills = [
    {
      id: 'report',
      label: 'Get Report',
      icon: <BarChart3 className="h-4 w-4" />,
      message: 'You clicked \'Get Report\'. (Functionality to generate and display campaign reports will be implemented in future updates.)'
    },
    {
      id: 'keywords',
      label: 'Keywords',
      icon: <Lightbulb className="h-4 w-4" />,
      message: 'You clicked \'Keywords\'. (Functionality to get keyword ideas and manage keywords will be implemented in future updates.)'
    },
    {
      id: 'pause',
      label: 'Pause',
      icon: <Pause className="h-4 w-4" />,
      message: 'You clicked \'Pause Campaign\'. (Functionality to pause campaigns will be implemented in future updates.)'
    },
    {
      id: 'resume',
      label: 'Resume',
      icon: <Play className="h-4 w-4" />,
      message: 'You clicked \'Resume Campaign\'. (Functionality to resume paused campaigns will be implemented in future updates.)'
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="bg-[#2F2F2F] rounded-lg p-3 flex gap-2 overflow-x-auto">
        {pills.map((pill) => (
          <button
            key={pill.id}
            onClick={() => onPillClick(pill.message)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#383737] hover:bg-[#444444] transition-colors text-sm text-gray-300 hover:text-white whitespace-nowrap"
          >
            {pill.icon}
            <span>{pill.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatActionPills;
