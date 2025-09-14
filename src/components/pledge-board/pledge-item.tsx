import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  type LucideIcon,
  Plus,
  UserPlus,
} from "lucide-react";

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
  isTask = false,
}: PledgeItemProps) {
  const Icon = item.icon;

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
          <Icon className="h-5 w-5 text-primary" />
          {item.title}
        </h3>
        <Button
          onClick={() => onPledge(item)}
          disabled={item.volunteers.length >= item.needed}
          className="shrink-0"
        >
          {isTask ? (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Volunteer
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              I'll Bring This
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left column - Description and status */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">{item.description}</p>
          <div className="flex items-center gap-2">
            {getStatusBadge(item.needed, item.volunteers.length)}
            <span className="text-muted-foreground text-sm">
              {item.volunteers.length} of {item.needed}{" "}
              {isTask ? "volunteers" : "contributions"}
            </span>
          </div>
        </div>

        {/* Right column - Volunteers/Contributors list */}
        <div className="space-y-2">
          {item.volunteers.length > 0 ? (
            <>
              <h4 className="font-medium text-card-foreground text-sm">
                {isTask ? "Current Volunteers:" : "Who's Bringing:"}
              </h4>
              <div className="space-y-2">
                {item.volunteers.map((volunteer, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{volunteer.name}</span>
                      {volunteer.details && (
                        <span className="block text-muted-foreground text-xs">
                          {volunteer.details}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground text-sm italic">
              {isTask ? "No volunteers yet" : "No one signed up yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
