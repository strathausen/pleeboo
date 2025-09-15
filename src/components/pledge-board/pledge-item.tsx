import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { VolunteerItem } from "./volunteer-item";

export interface Volunteer {
  name: string;
  details: string;
}

export interface PledgeItemData {
  id: number;
  title: string;
  description: string;
  needed: number;
  volunteers: Volunteer[];
  icon: LucideIcon;
  category: string;
}

interface PledgeItemProps {
  item: PledgeItemData;
  onPledge: (item: PledgeItemData) => void;
  onVolunteerNameChange?: (itemId: number, volunteerIndex: number, newName: string) => void;
  onVolunteerDetailsChange?: (itemId: number, volunteerIndex: number, newDetails: string) => void;
  isTask?: boolean;
}

function getStatusBadge(needed: number, current: number) {
  if (current >= needed) {
    return (
      <Badge className="bg-accent text-accent-foreground">
        <CheckCircle className="mr-1 h-3 w-3" />
        Complete
      </Badge>
    );
  }
  if (current > 0) {
    return (
      <Badge className="bg-secondary text-secondary-foreground">
        <Clock className="mr-1 h-3 w-3" />
        In Progress
      </Badge>
    );
  }
  return <Badge variant="outline">Needed</Badge>;
}

export function PledgeItem({
  item,
  onPledge,
  onVolunteerNameChange,
  onVolunteerDetailsChange,
  isTask = false,
}: PledgeItemProps) {
  const Icon = item.icon;
  
  // Create array with empty slots for remaining needed volunteers
  const allSlots = [...item.volunteers];
  while (allSlots.length < item.needed) {
    allSlots.push({ name: "", details: "" });
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3">
        <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
          <Icon className="h-5 w-5 text-primary" />
          {item.title}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-3">
        {/* Left column - Description */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">{item.description}</p>
        </div>

        {/* Right column - All volunteer slots */}
        <div className="space-y-2">
          <h4 className="font-medium text-card-foreground text-sm">
            {isTask ? "Volunteers:" : "Contributors:"} ({item.volunteers.length}/{item.needed})
          </h4>
          <div className="space-y-2">
            {allSlots.map((volunteer, index) => (
              <VolunteerItem
                key={index}
                volunteer={volunteer}
                itemId={item.id}
                volunteerIndex={index}
                onNameChange={onVolunteerNameChange}
                onDetailsChange={onVolunteerDetailsChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress status at the bottom */}
      <div className="flex items-center gap-2 pt-3 border-t">
        {getStatusBadge(item.needed, item.volunteers.length)}
        <span className="text-muted-foreground text-sm">
          {item.volunteers.length} of {item.needed}{" "}
          {isTask ? "volunteers" : "contributions"}
        </span>
      </div>
    </div>
  );
}
