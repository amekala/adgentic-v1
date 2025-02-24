
import { Plus, BarChart2, Lightbulb, RotateCw } from "lucide-react";

interface ActionButtonsProps {
  onActionClick?: (action: string) => void;
}

const ActionButtons = ({ onActionClick }: ActionButtonsProps) => {
  const actions = [
    { 
      icon: <Plus className="h-4 w-4 text-white" />, 
      label: "Create Campaign",
      primary: true,
      message: null // No message since this opens modal
    },
    { 
      icon: <BarChart2 className="h-4 w-4 text-blue-400" />, 
      label: "Analyze Campaigns",
      message: "Let's analyze your campaign performance and identify opportunities for improvement. I can help you look at metrics like CTR, conversion rates, and ROI."
    },
    { 
      icon: <Lightbulb className="h-4 w-4 text-yellow-400" />, 
      label: "Get Keyword Ideas",
      message: "I can help you discover high-performing keywords for your campaigns. What product or service are you advertising?"
    },
    { 
      icon: <RotateCw className="h-4 w-4 text-green-400" />, 
      label: "Optimize Campaigns",
      message: "I'll help you optimize your campaigns for better performance. Let's review your current settings and identify areas for improvement."
    },
  ];

  const handleClick = (action: typeof actions[0]) => {
    if (action.label === "Create Campaign") {
      onActionClick?.(action.label);
    } else if (action.message) {
      onActionClick?.(action.message);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {actions.map((action) => (
        <button 
          key={action.label} 
          onClick={() => handleClick(action)}
          className={`
            relative flex h-[42px] items-center gap-1.5 rounded-full 
            px-3 py-2 text-start text-[13px] shadow-xxs transition 
            enabled:hover:bg-token-main-surface-secondary 
            disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]
            ${action.primary 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border border-[#383737] hover:bg-[#383737]'
            }
          `}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
