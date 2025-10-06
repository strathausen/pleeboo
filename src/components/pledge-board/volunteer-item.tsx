import { useState } from "react";
import type { Volunteer } from "./pledge-item";

interface VolunteerItemProps {
  volunteer: Volunteer;
  itemId: string;
  slot: number;
  isTask?: boolean;
  isCumulative?: boolean;
  unit?: string | null;
  onNameChange?: (itemId: string, slot: number, newName: string) => void;
  onDetailsChange?: (itemId: string, slot: number, newDetails: string) => void;
  onQuantityChange?: (
    itemId: string,
    slot: number,
    newQuantity: number,
  ) => void;
}

export function VolunteerItem({
  volunteer,
  itemId,
  slot,
  isTask = false,
  isCumulative = false,
  unit = null,
  onNameChange,
  onDetailsChange,
  onQuantityChange,
}: VolunteerItemProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const isEmpty = !volunteer.name.trim();

  return (
    <div className="flex items-start gap-2 text-sm">
      {isCumulative && (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            value={volunteer.quantity || ""}
            onChange={(e) => {
              if (onQuantityChange) {
                onQuantityChange(
                  itemId,
                  slot,
                  Number.parseInt(e.target.value) || 0,
                );
              }
            }}
            onFocus={() => setIsEditingQuantity(true)}
            onBlur={() => setIsEditingQuantity(false)}
            placeholder="0"
            disabled={isEmpty}
            className={`w-20 border-0 bg-transparent py-0 pr-1 pl-2 text-right outline-none ${
              isEmpty
                ? "cursor-not-allowed opacity-50"
                : isEditingQuantity
                  ? "rounded ring-2 ring-primary ring-offset-1"
                  : "cursor-text rounded hover:bg-muted/50"
            }`}
          />
          <span className="text-muted-foreground text-xs">
            {unit || "unit"}
          </span>
        </div>
      )}
      <div className="flex-1 space-y-1">
        <div
          className={
            isEmpty
              ? "rounded border border-muted-foreground/30 border-dashed "
              : ""
          }
        >
          <input
            type="text"
            value={volunteer.name}
            onChange={(e) => {
              if (onNameChange) {
                onNameChange(itemId, slot, e.target.value);
              }
            }}
            onFocus={() => setIsEditingName(true)}
            onBlur={() => setIsEditingName(false)}
            placeholder="Enter name..."
            className={`w-full border-0 bg-transparent p-0 font-medium outline-none ${
              isEditingName
                ? "rounded px-1 ring-2 ring-primary ring-offset-1"
                : isEmpty
                  ? "px-1 placeholder:text-muted-foreground/50 placeholder:italic"
                  : "cursor-text rounded px-1 hover:bg-muted/50"
            }`}
            style={{ minWidth: "100px" }}
          />
        </div>
        {(volunteer.details || !isEmpty) && !isCumulative && (
          <input
            type="text"
            value={volunteer.details}
            onChange={(e) => {
              if (onDetailsChange) {
                onDetailsChange(itemId, slot, e.target.value);
              }
            }}
            onFocus={() => setIsEditingDetails(true)}
            onBlur={() => setIsEditingDetails(false)}
            placeholder={
              isTask
                ? "Add availability or notes..."
                : "Add quantity or what you'll bring..."
            }
            className={`block w-full border-0 bg-transparent p-0 text-muted-foreground text-xs outline-none ${
              isEditingDetails
                ? "rounded px-1 ring-2 ring-primary ring-offset-1"
                : "cursor-text rounded px-1 placeholder:text-muted-foreground/50 placeholder:italic hover:bg-muted/50"
            }`}
            style={{ minWidth: "150px" }}
          />
        )}
      </div>
    </div>
  );
}
