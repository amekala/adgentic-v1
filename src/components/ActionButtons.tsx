import { useState, useEffect } from "react";
import { Plus, BarChart2, Lightbulb, RotateCw, TrendingUp, Target, DollarSign, Settings } from "lucide-react";

interface ActionButtonsProps {
  onActionClick?: (action: string) => void;
}

// Define all possible action buttons
const allActions = [
  { 
    id: 'create_campaign',
    icon: <Plus className="h-4 w-4 text-white" />, 
    label: "Create Campaign",
    primary: true,
    message: null // No message since this opens modal
  },
  { 
    id: 'analyze_campaigns',
    icon: <BarChart2 className="h-4 w-4 text-blue-400" />, 
    label: "Analyze Campaigns",
    message: "Let's analyze your campaign performance and identify opportunities for improvement. I can help you look at metrics like CTR, conversion rates, and ROI."
  },
  { 
    id: 'keyword_ideas',
    icon: <Lightbulb className="h-4 w-4 text-yellow-400" />, 
    label: "Get Keyword Ideas",
    message: "I can help you discover high-performing keywords for your campaigns. What product or service are you advertising?"
  },
  { 
    id: 'optimize_campaigns',
    icon: <RotateCw className="h-4 w-4 text-green-400" />, 
    label: "Optimize Campaigns",
    message: "I'll help you optimize your campaigns for better performance. Let's review your current settings and identify areas for improvement."
  },
  {
    id: 'performance_analysis',
    icon: <TrendingUp className="h-4 w-4 text-purple-400" />,
    label: "Performance Analysis",
    message: "I'll analyze your campaign performance data to identify trends, strengths, and areas for improvement."
  },
  {
    id: 'targeting_strategy',
    icon: <Target className="h-4 w-4 text-red-400" />,
    label: "Targeting Strategy",
    message: "Let's review and optimize your audience targeting to reach the most relevant customers."
  },
  {
    id: 'budget_allocation',
    icon: <DollarSign className="h-4 w-4 text-emerald-400" />,
    label: "Budget Allocation",
    message: "I'll help you allocate your advertising budget more effectively across campaigns and ad groups."
  },
  {
    id: 'campaign_settings',
    icon: <Settings className="h-4 w-4 text-gray-400" />,
    label: "Campaign Settings",
    message: "Let's review your campaign settings to ensure they're optimized for your goals."
  }
];

const ActionButtons = ({ onActionClick }: ActionButtonsProps) => {
  // State to keep track of which actions to show
  const [actions, setActions] = useState(allActions.slice(0, 4));

  // Function to rotate the available actions (except Create Campaign)
  useEffect(() => {
    // This simulates the action rotation based on user interaction
    // In a real implementation, this would use actual conversation context
    const intervalId = setInterval(() => {
      // Keep Create Campaign as the first action
      const createCampaign = allActions.find(a => a.id === 'create_campaign');
      
      // Randomly select 3 other actions for variation
      const otherActions = allActions
        .filter(a => a.id !== 'create_campaign')
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      // Combine and set the actions
      if (createCampaign) {
        setActions([createCampaign, ...otherActions]);
      }
    }, 60000); // Rotate options every minute

    return () => clearInterval(intervalId);
  }, []);

  const handleClick = async (action: typeof actions[0]) => {
    if (action.label === "Create Campaign") {
      // Just call the action handler with the action label
      onActionClick?.(action.label);
      return;
    }

    if (action.message) {
      // Directly send the message instead of just creating a chat
      onActionClick?.(action.message);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {actions.map((action) => (
        <button 
          key={action.id} 
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
