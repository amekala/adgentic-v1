
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, PenIcon, MessageSquare } from "lucide-react"; 

interface CampaignHeaderProps {
  campaignName: string;
  campaignStatus: string;
  createNewChat: () => void;
}

const CampaignHeader = ({ campaignName, campaignStatus, createNewChat }: CampaignHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-adgentic-border bg-white">
      <h1 className="text-xl font-semibold text-adgentic-text-primary flex items-center gap-2">
        {campaignName}
        <span className={`flex items-center gap-1 text-sm font-normal ${
          campaignStatus === 'live' ? 'text-green-500' : 
          campaignStatus === 'paused' ? 'text-yellow-500' : 'text-gray-400'
        }`}>
          {campaignStatus === 'live' ? <PlayCircle className="h-4 w-4" /> : null}
          {campaignStatus === 'paused' ? <PauseCircle className="h-4 w-4" /> : null}
          {campaignStatus === 'draft' ? <PenIcon className="h-4 w-4" /> : null}
          {campaignStatus.charAt(0).toUpperCase() + campaignStatus.slice(1)}
        </span>
      </h1>
      
      <Button 
        variant="outline" 
        onClick={createNewChat}
        className="flex items-center gap-2 text-sm border-adgentic-border hover:bg-adgentic-hover text-adgentic-text-primary"
      >
        <MessageSquare className="h-4 w-4" />
        New Chat
      </Button>
    </div>
  );
};

export default CampaignHeader;
