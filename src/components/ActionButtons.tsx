
import { Plus, BarChart2, Lightbulb, RotateCw } from "lucide-react";

interface ActionButtonsProps {
  onActionClick?: (action: string) => void;
}

const ActionButtons = ({ onActionClick }: ActionButtonsProps) => {
  const actions = [
    { 
      icon: <Plus className="h-4 w-4 text-white" />, 
      label: "Create Campaign",
      primary: true 
    },
    { 
      icon: <BarChart2 className="h-4 w-4 text-blue-400" />, 
      label: "Analyze Campaigns" 
    },
    { 
      icon: <Lightbulb className="h-4 w-4 text-yellow-400" />, 
      label: "Get Keyword Ideas" 
    },
    { 
      icon: <RotateCw className="h-4 w-4 text-green-400" />, 
      label: "Optimize Campaigns" 
    },
  ];

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {actions.map((action) => (
        <button 
          key={action.label} 
          onClick={() => onActionClick?.(action.label)}
          className={`
            relative flex h-[42px] items-center gap-1.5 rounded-full 
            px-3 py-2 text-start text-[13px] shadow-xxs transition 
            enabled:hover:bg-token-main-surface-secondary 
            disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]
            ${action.primary 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border border-[#383737]'
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
