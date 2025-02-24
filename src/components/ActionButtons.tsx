
import { BarChart3, Plus, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onActionClick: (action: string) => void;
}

const ActionButtons = ({ onActionClick }: ActionButtonsProps) => {
  const actions = [
    {
      id: 'create',
      label: 'Create Campaign',
      icon: <Plus className="h-5 w-5" />,
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      id: 'analyze',
      label: 'Analyze Campaigns',
      icon: <BarChart3 className="h-5 w-5" />,
      message: "Let's analyze your campaigns performance and identify opportunities for improvement. I can help you look at metrics like CTR, conversion rates, and ROI.",
      className: 'bg-[#2F2F2F] hover:bg-[#383737] text-white'
    },
    {
      id: 'keywords',
      label: 'Get Keyword Ideas',
      icon: <Lightbulb className="h-5 w-5" />,
      message: "I can help you discover high-performing keywords for your campaigns. What product or service are you advertising?",
      className: 'bg-[#2F2F2F] hover:bg-[#383737] text-white'
    },
    {
      id: 'optimize',
      label: 'Optimize Campaigns',
      icon: <RefreshCw className="h-5 w-5" />,
      message: "I'll help you optimize your campaigns for better performance. Let's review your current settings and identify areas for improvement.",
      className: 'bg-[#2F2F2F] hover:bg-[#383737] text-white'
    }
  ];

  const handleClick = (action: typeof actions[0]) => {
    if (action.id === 'create') {
      onActionClick('Create Campaign');
    } else if (action.message) {
      onActionClick(action.message);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {actions.map((action) => (
        <Button
          key={action.id}
          onClick={() => handleClick(action)}
          className={`flex items-center gap-2 px-6 py-4 rounded-full text-base ${action.className}`}
        >
          {action.icon}
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default ActionButtons;
