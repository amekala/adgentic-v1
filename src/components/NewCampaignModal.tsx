
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { LightbulbIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: (data: { name: string; goals: string; notes: string }) => void;
}

const NewCampaignModal = ({ isOpen, onClose, onCreateCampaign }: NewCampaignModalProps) => {
  const [name, setName] = useState("");
  const [goals, setGoals] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([
          {
            campaign_name: name.trim() || 'Untitled Campaign', // Use provided name or default
            goals_description: goals.trim() || null,
            campaign_notes: notes.trim() || null,
            // All other fields will use database defaults
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign created successfully!",
      });

      // Call the onCreateCampaign prop with the form data
      onCreateCampaign({ name: name.trim(), goals: goals.trim(), notes: notes.trim() });

      // Reset form
      setName("");
      setGoals("");
      setNotes("");
      
      // Close modal
      onClose();

      // Navigate to the new campaign
      if (data?.id) {
        navigate(`/campaign/${data.id}`);
      }
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-[#2F2F2F] border border-[#383737]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Campaign name</DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-4">
          <Input
            placeholder="E.g., Holiday Season Campaign 2024"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg p-6 rounded-2xl border-2 border-[#383737] bg-[#212121] text-white placeholder-gray-400"
          />
          
          <Textarea
            placeholder="What are your campaign goals?"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="min-h-[100px] p-4 rounded-2xl border-2 border-[#383737] bg-[#212121] text-white placeholder-gray-400"
          />
          
          <Textarea
            placeholder="Additional notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px] p-4 rounded-2xl border-2 border-[#383737] bg-[#212121] text-white placeholder-gray-400"
          />

          <div className="bg-[#212121] p-6 rounded-2xl space-y-2 border border-[#383737]">
            <div className="flex items-center gap-2">
              <LightbulbIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">Getting Started</h3>
            </div>
            <p className="text-gray-400">
              After creating your campaign, you'll be guided through setting up your budget, targeting, and product selection through an interactive chat experience.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full px-6 bg-transparent border-[#383737] text-white hover:bg-[#383737]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Creating..." : "Create campaign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewCampaignModal;
