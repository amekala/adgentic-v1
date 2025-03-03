
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ChatActionsProps {
  onNewCampaign: () => void;
}

const ChatActions = ({ onNewCampaign }: ChatActionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleActionClick = (action: string) => {
    if (action === "Create Campaign") {
      // Call the onNewCampaign function passed from parent component
      onNewCampaign();
    } else if (action === "Apply Recommendations" || action === "Optimize Campaigns") {
      toast({
        title: "Success",
        description: "Recommendations applied successfully!",
      });
    } else if (action === "View Detailed Report") {
      navigate('/campaign/new');
    }
  };
  
  return { handleActionClick };
};

export default ChatActions;
