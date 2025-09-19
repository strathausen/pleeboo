"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  type LucideIcon,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { IconSelector } from "./icon-selector";

// Define BoardItemData type locally since the page was refactored
interface BoardItemData {
  id: number;
  title: string;
  description: string;
  needed: number;
  volunteers: { name: string; details: string }[];
  icon: LucideIcon;
  category: "tasks" | "items";
}

interface EditablePledgeItemProps {
  item: BoardItemData;
  onVolunteerNameChange: (index: number, name: string) => void;
  onVolunteerDetailsChange: (index: number, details: string) => void;
  onUpdate: (updates: Partial<BoardItemData>) => void;
  onDelete: () => void;
  availableIcons?: { icon: LucideIcon; name: string }[];
  isTask: boolean;
}

export function EditablePledgeItem({
  item,
  onVolunteerNameChange,
  onVolunteerDetailsChange,
  onUpdate,
  onDelete,
  availableIcons,
  isTask,
}: EditablePledgeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(item.title);
  const [tempDescription, setTempDescription] = useState(item.description);
  const [tempNeeded, setTempNeeded] = useState(item.needed);

  const filledCount = item.volunteers.length;
  const progressPercentage = (filledCount / item.needed) * 100;
  const isFull = filledCount >= item.needed;

  const Icon = item.icon;

  const handleSave = () => {
    onUpdate({
      title: tempTitle,
      description: tempDescription,
      needed: tempNeeded,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(item.title);
    setTempDescription(item.description);
    setTempNeeded(item.needed);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-start gap-2">
          <IconSelector
            currentIcon={item.icon}
            availableIcons={availableIcons}
            onIconSelect={(icon) => onUpdate({ icon })}
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
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="default"
              onClick={handleSave}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Check className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-card transition-all",
        isFull && "border-primary/50 bg-primary/5",
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <div
              className={cn(
                "rounded-lg bg-primary/10 p-2",
                isFull && "bg-primary/20",
              )}
            >
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div
              className="group cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <h3 className="font-medium text-card-foreground transition-colors group-hover:text-primary">
                {item.title}
                <Edit3 className="ml-2 inline-block h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Progress value={progressPercentage} className="h-2 w-24" />
                <span className="text-muted-foreground text-sm">
                  {filledCount}/{item.needed}{" "}
                  {isTask ? "volunteers" : "pledged"}
                </span>
                {isFull && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs">
                    Full
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 ml-12 space-y-2">
            {Array.from({ length: item.needed }).map((_, index) => {
              const volunteer = item.volunteers[index];
              return (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      type="text"
                      placeholder={
                        index < filledCount ? "Name" : "Available slot"
                      }
                      value={volunteer?.name || ""}
                      onChange={(e) =>
                        onVolunteerNameChange(index, e.target.value)
                      }
                      className="h-8 text-sm"
                    />
                    <Input
                      type="text"
                      placeholder="Details (optional)"
                      value={volunteer?.details || ""}
                      onChange={(e) =>
                        onVolunteerDetailsChange(index, e.target.value)
                      }
                      className="h-8 text-muted-foreground text-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
