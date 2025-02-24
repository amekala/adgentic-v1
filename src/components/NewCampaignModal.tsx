
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { LightbulbIcon } from "lucide-react";

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: (data: { name: string; goals: string }) => void;
}

const NewCampaignModal = ({ isOpen, onClose, onCreateCampaign }: NewCampaignModalProps) => {
  const [name, setName] = useState("");
  const [goals, setGoals] = useState("");

  const handleSubmit = () => {
    onCreateCampaign({ name, goals });
    setName("");
    setGoals("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-[#2F2F2F] border border-[#383737]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Project name</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <Input
            placeholder="E.g., Birthday Party Planning"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg p-6 rounded-2xl border-2 border-[#383737] bg-[#212121] text-white placeholder-gray-400"
          />
          <div className="mt-6 bg-[#212121] p-6 rounded-2xl space-y-2 border border-[#383737]">
            <div className="flex items-center gap-2">
              <LightbulbIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">What's a project?</h3>
            </div>
            <p className="text-gray-400">
              Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to keep things tidy.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full px-6 bg-transparent border-[#383737] text-white hover:bg-[#383737]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewCampaignModal;
