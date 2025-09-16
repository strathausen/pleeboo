import { IconSelector } from "@/components/board/icon-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  CheckCircle,
  Clock,
  Edit3,
  type LucideIcon,
  Minus,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  Package,
  X,
} from "lucide-react";
import { useState } from "react";
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
  isTask?: boolean;
}

interface PledgeItemProps {
  item: PledgeItemData;
  onPledge: (item: PledgeItemData) => void;
  onVolunteerNameChange?: (
    itemId: number,
    volunteerIndex: number,
    newName: string,
  ) => void;
  onVolunteerDetailsChange?: (
    itemId: number,
    volunteerIndex: number,
    newDetails: string,
  ) => void;
  isTask?: boolean;
  editable?: boolean;
  onItemUpdate?: (itemId: number, updates: Partial<PledgeItemData>) => void;
  onItemDelete?: (itemId: number) => void;
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
  editable = false,
  onItemUpdate,
  onItemDelete,
}: PledgeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(item.title);
  const [tempDescription, setTempDescription] = useState(item.description);
  const [tempNeeded, setTempNeeded] = useState(item.needed);
  const [tempIsTask, setTempIsTask] = useState(item.isTask ?? isTask);

  const Icon = item.icon;

  const handleSave = () => {
    if (onItemUpdate) {
      onItemUpdate(item.id, {
        title: tempTitle,
        description: tempDescription,
        needed: tempNeeded,
        isTask: tempIsTask,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(item.title);
    setTempDescription(item.description);
    setTempNeeded(item.needed);
    setTempIsTask(item.isTask ?? isTask);
    setIsEditing(false);
  };

  // Create array with empty slots for remaining needed volunteers
  const allSlots = [...item.volunteers];
  while (allSlots.length < item.needed) {
    allSlots.push({ name: "", details: "" });
  }

  if (editable && isEditing) {
    return (
      <div className="rounded-lg border border-border p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <IconSelector
              currentIcon={item.icon}
              onIconSelect={(icon) => onItemUpdate?.(item.id, { icon })}
            />
            <div className="flex-1 space-y-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="Item title"
                className="font-medium"
              />
              <Input
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                placeholder="Item description"
                className="text-sm"
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Needed:</span>
                  <Input
                    type="number"
                    min="1"
                    value={tempNeeded}
                    onChange={(e) =>
                      setTempNeeded(Number.parseInt(e.target.value) || 1)
                    }
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => setTempIsTask(!tempIsTask)}
                  >
                    {tempIsTask ? (
                      <><Users className="h-4 w-4" /> Task</>
                    ) : (
                      <><Package className="h-4 w-4" /> Item</>
                    )}
                    {tempIsTask ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="default"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
              {onItemDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onItemDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 grid gap-4 md:grid-cols-2">
        {/* Left column - Description */}
        <div className="space-y-2">
          <div className="mb-3">
            <h3 className="group flex items-center gap-2 font-semibold text-card-foreground">
              <Icon className="h-5 w-5 text-primary" />
              {item.title}
              {editable && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{item.description}</p>
        </div>

        {/* Right column - All volunteer slots */}
        <div className="space-y-2 border-0 pl-0 md:border-l-1 md:pl-4">
          <div className="space-y-2">
            {allSlots.map((volunteer, index) => (
              <VolunteerItem
                key={`volunteer-${index}`}
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
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2">
          {getStatusBadge(item.needed, item.volunteers.length)}
          <span className="text-muted-foreground text-sm">
            {item.volunteers.length} of {item.needed}{" "}
            {(item.isTask ?? isTask) ? "volunteers" : "contributions"}
          </span>
        </div>
        {editable && onItemUpdate && (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                if (item.needed > 1) {
                  onItemUpdate(item.id, { needed: item.needed - 1 });
                }
              }}
              disabled={item.needed <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-2 text-sm font-medium">{item.needed}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                onItemUpdate(item.id, { needed: item.needed + 1 });
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
