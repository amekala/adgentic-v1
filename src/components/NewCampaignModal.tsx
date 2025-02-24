
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: (data: { name: string; goals: string; notes: string }) => void;
}

const NewCampaignModal = ({ isOpen, onClose, onCreateCampaign }: NewCampaignModalProps) => {
  const [name, setName] = useState("");
  const [goals, setGoals] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onCreateCampaign({ name, goals, notes });
    setName("");
    setGoals("");
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
          <DialogDescription>
            Campaigns help you organize and manage your retail media advertising efforts effectively.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Campaign Name
            </label>
            <Input
              id="name"
              placeholder="E.g., Summer Dresses - Amazon SP"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="goals" className="text-sm font-medium">
              Campaign Goals
            </label>
            <Textarea
              id="goals"
              placeholder="E.g., Drive Sales for Summer Dresses on Amazon, Increase Brand Awareness, Achieve 20% ACoS"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Campaign Notes (Optional)
            </label>
            <Textarea
              id="notes"
              placeholder="E.g., Promotion: Back to School Sale, Targeting: Health-Conscious Consumers, Special Instructions for Ad Copy"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewCampaignModal;
