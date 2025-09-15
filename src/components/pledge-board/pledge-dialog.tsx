import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PledgeItemData } from "./pledge-item";

interface PledgeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPledge: PledgeItemData | null;
  formData: {
    name: string;
    details: string;
  };
  onFormDataChange: (data: { name: string; details: string }) => void;
  onSubmit: () => void;
}

export function PledgeDialog({
  isOpen,
  onOpenChange,
  selectedPledge,
  formData,
  onFormDataChange,
  onSubmit,
}: PledgeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedPledge?.category === "tasks"
              ? "Volunteer for"
              : "Sign up to bring"}
            : {selectedPledge?.title}
          </DialogTitle>
          <DialogDescription>{selectedPledge?.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              placeholder={
                selectedPledge?.category === "tasks"
                  ? "Any special skills, availability, or equipment you can bring..."
                  : "What specifically will you bring? How many people will it serve?..."
              }
              value={formData.details}
              onChange={(e) =>
                onFormDataChange({ ...formData, details: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!formData.name.trim()}>
            {selectedPledge?.category === "tasks"
              ? "Sign Me Up!"
              : "I'll Bring This!"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
