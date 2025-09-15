import { useState } from "react";
import type { Volunteer } from "./pledge-item";

interface VolunteerItemProps {
  volunteer: Volunteer;
  itemId: number;
  volunteerIndex: number;
  onNameChange?: (itemId: number, volunteerIndex: number, newName: string) => void;
  onDetailsChange?: (itemId: number, volunteerIndex: number, newDetails: string) => void;
}

export function VolunteerItem({
  volunteer,
  itemId,
  volunteerIndex,
  onNameChange,
  onDetailsChange,
}: VolunteerItemProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const isEmpty = !volunteer.name.trim();

  return (
    <div className="flex items-start gap-2 text-sm">
      <div className="flex-1 space-y-1">
        <div className={isEmpty ? "border border-dashed border-muted-foreground/30 rounded px-1" : ""}>
          <input
            type="text"
            value={volunteer.name}
            onChange={(e) => {
              if (onNameChange) {
                onNameChange(itemId, volunteerIndex, e.target.value);
              }
            }}
            onFocus={() => setIsEditingName(true)}
            onBlur={() => setIsEditingName(false)}
            placeholder="Enter name..."
            className={`font-medium bg-transparent border-0 outline-none p-0 w-full ${
              isEditingName
                ? "ring-2 ring-primary ring-offset-1 rounded px-1"
                : isEmpty 
                  ? "placeholder:text-muted-foreground/50 placeholder:italic"
                  : "cursor-text hover:bg-muted/50 rounded px-1"
            }`}
            style={{ minWidth: "100px" }}
          />
        </div>
        {(volunteer.details || !isEmpty) && (
          <input
            type="text"
            value={volunteer.details}
            onChange={(e) => {
              if (onDetailsChange) {
                onDetailsChange(itemId, volunteerIndex, e.target.value);
              }
            }}
            onFocus={() => setIsEditingDetails(true)}
            onBlur={() => setIsEditingDetails(false)}
            placeholder="Add details..."
            className={`block text-muted-foreground text-xs bg-transparent border-0 outline-none p-0 w-full ${
              isEditingDetails
                ? "ring-2 ring-primary ring-offset-1 rounded px-1"
                : "cursor-text hover:bg-muted/50 rounded px-1 placeholder:text-muted-foreground/50 placeholder:italic"
            }`}
            style={{ minWidth: "150px" }}
          />
        )}
      </div>
    </div>
  );
}