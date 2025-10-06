import { IconSelector } from "@/components/board/icon-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownText } from "@/components/ui/markdown-text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type IconName, getIcon } from "@/lib/available-icons";
import {
  Check,
  CheckCircle,
  Clock,
  Edit3,
  Minus,
  Package,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { VolunteerItem } from "./volunteer-item";

export interface Volunteer {
  id: string;
  name: string;
  slot: number;
  details: string;
  quantity?: number | null; // For cumulative items
}

export interface PledgeItemData {
  id: string;
  title: string;
  description: string;
  needed: number;
  volunteers: Volunteer[];
  icon: IconName;
  category: string;
  isTask?: boolean;
  itemType?: "slots" | "task" | "cumulative";
  unit?: string | null; // e.g., "kg", "litres"
}

interface PledgeItemProps {
  item: PledgeItemData;
  onPledge: (item: PledgeItemData) => void;
  onVolunteerNameChange?: (
    itemId: string,
    slot: number,
    newName: string,
  ) => void;
  onVolunteerDetailsChange?: (
    itemId: string,
    slot: number,
    newDetails: string,
  ) => void;
  onVolunteerQuantityChange?: (
    itemId: string,
    slot: number,
    newQuantity: number,
  ) => void;
  isTask?: boolean;
  editable?: boolean;
  onItemUpdate?: (itemId: string, updates: Partial<PledgeItemData>) => void;
  onItemDelete?: (itemId: string) => void;
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
  onVolunteerNameChange,
  onVolunteerDetailsChange,
  onVolunteerQuantityChange,
  isTask = false,
  editable = false,
  onItemUpdate,
  onItemDelete,
}: PledgeItemProps) {
  // Start in edit mode if it's a new item (temp ID)
  const [isEditing, setIsEditing] = useState(item.id.startsWith("temp-"));
  const [tempTitle, setTempTitle] = useState(item.title);
  const [tempDescription, setTempDescription] = useState(item.description);
  const [tempNeeded, setTempNeeded] = useState(item.needed);
  const [tempIsTask, setTempIsTask] = useState(item.isTask ?? isTask);
  const [tempItemType, setTempItemType] = useState<
    "slots" | "task" | "cumulative"
  >(item.itemType ?? (item.isTask ? "task" : "slots"));
  const [tempUnit, setTempUnit] = useState(item.unit || "");

  const IconComponent = getIcon(item.icon);

  const handleSave = () => {
    // Require at least a title to save
    if (!tempTitle.trim()) {
      return;
    }

    if (onItemUpdate) {
      onItemUpdate(item.id, {
        title: tempTitle,
        description: tempDescription,
        needed: tempNeeded,
        isTask: tempItemType === "task",
        itemType: tempItemType,
        unit: tempItemType === "cumulative" ? tempUnit : null,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    // If this is a new unsaved item, delete it
    if (item.id.startsWith("temp-")) {
      if (onItemDelete) {
        onItemDelete(item.id);
      }
    } else {
      // Otherwise just reset the values
      setTempTitle(item.title);
      setTempDescription(item.description);
      setTempNeeded(item.needed);
      setTempIsTask(item.isTask ?? isTask);
      setTempItemType(item.itemType ?? (item.isTask ? "task" : "slots"));
      setTempUnit(item.unit || "");
      setIsEditing(false);
    }
  };

  // For cumulative items, always show filled slots plus one empty row
  // For slot/task items, show all needed slots
  const isCumulative = item.itemType === "cumulative";
  const allSlots = [];

  if (isCumulative) {
    // Show all filled volunteers
    const filledVolunteers = item.volunteers.filter((v) => v.name.trim());
    filledVolunteers.forEach((v, index) => {
      allSlots.push({ ...v, slot: index });
    });
    // Always add one empty slot at the end
    allSlots.push({
      id: `empty-${allSlots.length}`,
      name: "",
      details: "",
      quantity: null,
      slot: allSlots.length,
    });
  } else {
    // Standard slot/task behavior - show all needed slots
    for (let slot = 0; slot < item.needed; slot++) {
      const volunteer = item.volunteers.find((v) => v.slot === slot) || {
        id: `empty-${slot}`,
        name: "",
        details: "",
        quantity: null,
        slot,
      };
      allSlots.push({ ...volunteer, slot });
    }
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tempTitle.trim()) {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                placeholder={
                  tempItemType === "task"
                    ? "e.g., Set up tables, Face painting"
                    : tempItemType === "cumulative"
                      ? "e.g., Sourdough bread, Paper plates"
                      : "e.g., Savoury foods, Drinks, Decorations"
                }
                className="font-semibold text-base placeholder:font-normal placeholder:text-muted-foreground/50"
                autoFocus={item.id.startsWith("temp-")}
              />
              <Input
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tempTitle.trim()) {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                placeholder={
                  tempItemType === "task"
                    ? "Add notes about availability, timing, or special requirements (optional)"
                    : tempItemType === "cumulative"
                      ? "Description or notes (optional)"
                      : "Specify what to bring, quantity, or dietary info (optional)"
                }
                className="text-sm placeholder:text-muted-foreground/50"
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {tempItemType === "cumulative" ? "Target:" : "Needed:"}
                  </span>
                  <Input
                    type="number"
                    min="1"
                    value={tempNeeded}
                    onChange={(e) =>
                      setTempNeeded(Number.parseInt(e.target.value) || 1)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tempTitle.trim()) {
                        e.preventDefault();
                        handleSave();
                      }
                    }}
                    className="w-20"
                  />
                  {tempItemType === "cumulative" && (
                    <Input
                      value={tempUnit}
                      onChange={(e) => setTempUnit(e.target.value)}
                      placeholder="kg, litres, etc."
                      className="w-32 placeholder:text-muted-foreground/50"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground text-sm">Type:</span>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={tempItemType === "slots" ? "default" : "outline"}
                          size="sm"
                          className="gap-2"
                          onClick={() => setTempItemType("slots")}
                        >
                          <Package className="h-4 w-4" /> Bring Items
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>People bring specific items (e.g., 3 salads, 2 drinks)</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={tempItemType === "task" ? "default" : "outline"}
                          size="sm"
                          className="gap-2"
                          onClick={() => setTempItemType("task")}
                        >
                          <Users className="h-4 w-4" /> Do Tasks
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>People volunteer for tasks or roles (e.g., 2 setup helpers)</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={
                            tempItemType === "cumulative" ? "default" : "outline"
                          }
                          size="sm"
                          className="gap-2"
                          onClick={() => setTempItemType("cumulative")}
                        >
                          <Plus className="h-4 w-4" /> Collect Amount
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Collect amounts until target reached (e.g., 5kg of sourdough)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="default"
                onClick={handleSave}
                className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                disabled={!tempTitle.trim()}
                title={!tempTitle.trim() ? "Title is required" : "Save"}
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
              <IconComponent className="h-5 w-5 text-primary" />
              {item.title}
              {editable && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-50 transition-opacity group-hover:opacity-100"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
            </h3>
          </div>
          <div className="text-muted-foreground text-sm">
            <MarkdownText text={item.description} />
          </div>
        </div>

        {/* Right column - All volunteer slots */}
        <div className="space-y-2 border-t-1 border-l-0 pt-4 pl-0 md:border-t-0 md:border-l-1 md:pt-0 md:pl-4">
          <div className="space-y-2">
            {allSlots.map((volunteer) => (
              <VolunteerItem
                key={`volunteer-${volunteer.slot}`}
                volunteer={volunteer}
                itemId={item.id}
                slot={volunteer.slot}
                isTask={item.isTask}
                isCumulative={isCumulative}
                unit={item.unit}
                onNameChange={onVolunteerNameChange}
                onDetailsChange={onVolunteerDetailsChange}
                onQuantityChange={onVolunteerQuantityChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress status at the bottom */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2 pt-1">
          {isCumulative ? (
            <>
              {getStatusBadge(
                item.needed,
                item.volunteers.reduce((sum, v) => sum + (v.quantity || 0), 0),
              )}
              <span className="text-muted-foreground text-sm">
                {item.volunteers.reduce((sum, v) => sum + (v.quantity || 0), 0)}{" "}
                of {item.needed} {item.unit || "units"}
              </span>
            </>
          ) : (
            <>
              {getStatusBadge(
                item.needed,
                item.volunteers.filter((v) => !!v.name.trim()).length,
              )}
              <span className="text-muted-foreground text-sm">
                {item.volunteers.filter((v) => !!v.name.trim()).length} of{" "}
                {item.needed}{" "}
                {(item.isTask ?? isTask) ? "volunteers" : "contributions"}
              </span>
            </>
          )}
        </div>
        {editable && onItemUpdate && (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => {
                if (item.needed > 1) {
                  onItemUpdate(item.id, { needed: item.needed - 1 });
                }
              }}
              disabled={item.needed <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-2 font-medium text-sm">{item.needed}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
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
