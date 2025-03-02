
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { MessageProps } from './Message';

interface ActionHandlerProps {
  campaignId: string | null;
  onSendMessage: (message: string) => void;
}

const ActionHandler = ({ campaignId, onSendMessage }: ActionHandlerProps) => {
  const navigate = useNavigate();

  const handleActionClick = (action: string) => {
    if (action === "Apply Recommendations" || action === "Optimize Campaigns") {
      toast.success("Recommendations applied successfully!");
    } else if (action === "View Detailed Report") {
      navigate(`/campaign/${campaignId || 'new'}`);
    } else {
      onSendMessage(`Tell me more about ${action}`);
    }
  };

  const handlePillClick = (message: string) => {
    onSendMessage(message);
  };

  return {
    handleActionClick,
    handlePillClick
  };
};

export default ActionHandler;
