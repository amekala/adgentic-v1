
import { UserCircle2, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SidebarFooter = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mt-auto px-3 pb-4 space-y-2">
      <button
        onClick={() => navigate('/account')}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-adgentic-text-secondary hover:bg-adgentic-hover rounded-md"
      >
        <UserCircle2 className="h-5 w-5" />
        <div className="text-left">
          <div className="text-adgentic-text-primary">Your Account</div>
          <div className="text-xs">Standard Tier</div>
        </div>
      </button>

      <button
        onClick={() => navigate('/pricing')}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-adgentic-text-secondary hover:bg-adgentic-hover rounded-md"
      >
        <DollarSign className="h-5 w-5" />
        <span>Pricing</span>
      </button>
    </div>
  );
};

export default SidebarFooter;
