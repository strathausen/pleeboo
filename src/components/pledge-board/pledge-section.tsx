"use client";

import { IconSelector } from "@/components/board/icon-selector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarkdownText } from "@/components/ui/markdown-text";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Edit3,
  type LucideIcon,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { PledgeItem, type PledgeItemData } from "./pledge-item";

interface PledgeSectionProps {
  sectionId?: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: PledgeItemData[];
  onPledge: (item: PledgeItemData) => void;
  onVolunteerNameChange: (
    itemId: string,
    volunteerIndex: number,
    newName: string,
  ) => void;
  onVolunteerDetailsChange: (
    itemId: string,
    volunteerIndex: number,
    newDetails: string,
  ) => void;
  isTask: boolean;
  editable?: boolean;
  onSectionUpdate?: (
    sectionId: string,
    updates: { title?: string; description?: string; icon?: LucideIcon },
  ) => void;
  onSectionDelete?: (sectionId: string) => void;
  onItemUpdate?: (itemId: string, updates: Partial<PledgeItemData>) => void;
  onItemDelete?: (itemId: string) => void;
  onItemAdd?: (sectionId: string) => void;
  onMoveUp?: (sectionId: string) => void;
  onMoveDown?: (sectionId: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function PledgeSection({
  sectionId,
  title,
  description,
  icon: Icon,
  items,
  onPledge,
  onVolunteerNameChange,
  onVolunteerDetailsChange,
  isTask,
  editable = false,
  onSectionUpdate,
  onSectionDelete,
  onItemUpdate,
  onItemDelete,
  onItemAdd,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: PledgeSectionProps) {
  // Start in edit mode if it's a new section (temp ID)
  const [isEditingSection, setIsEditingSection] = useState(
    sectionId && sectionId.startsWith("temp-"),
  );
  const [tempTitle, setTempTitle] = useState(title);
  const [tempDescription, setTempDescription] = useState(description);

  // Auto-add an empty item when section is saved and has no items
  React.useEffect(() => {
    if (
      editable &&
      sectionId &&
      !sectionId.startsWith("temp-") &&
      items.length === 0 &&
      onItemAdd
    ) {
      // Only add if the section has been saved (not a temp ID)
      onItemAdd(sectionId);
    }
  }, [editable, sectionId, items.length, onItemAdd]);

  const handleSaveSection = () => {
    // Require at least a title to save
    if (!tempTitle.trim()) {
      return;
    }

    if (onSectionUpdate && sectionId) {
      onSectionUpdate(sectionId, {
        title: tempTitle,
        description: tempDescription,
      });
    }
    setIsEditingSection(false);
  };

  const handleCancelSection = () => {
    // If this is a new unsaved section, delete it
    if (sectionId && sectionId.startsWith("temp-")) {
      if (onSectionDelete) {
        onSectionDelete(sectionId);
      }
    } else {
      // Otherwise just reset the values
      setTempTitle(title);
      setTempDescription(description);
      setIsEditingSection(false);
    }
  };
  return (
    <Card className={`relative ${editable && !isEditingSection ? "mt-3" : ""}`}>
      {editable && !isEditingSection && onMoveUp && onMoveDown && sectionId && (
        <div className="-top-5 -translate-x-1/2 absolute left-1/2 z-10 flex gap-1 opacity-50 transition-opacity hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => onMoveUp(sectionId)}
            disabled={isFirst}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => onMoveDown(sectionId)}
            disabled={isLast}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}
      <CardHeader>
        {isEditingSection && editable ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconSelector
                currentIcon={Icon}
                onIconSelect={(icon) =>
                  sectionId && onSectionUpdate?.(sectionId, { icon })
                }
              />
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tempTitle.trim()) {
                    e.preventDefault();
                    handleSaveSection();
                  }
                }}
                placeholder="e.g., Food & Drinks, Setup Crew, Activities"
                className="font-semibold text-base placeholder:font-normal placeholder:text-muted-foreground/50"
                autoFocus={!!sectionId && sectionId.startsWith("temp-")}
              />
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="default"
                  onClick={handleSaveSection}
                  className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  disabled={!tempTitle.trim()}
                  title={!tempTitle.trim() ? "Title is required" : "Save"}
                >
                  <Check className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancelSection}
                >
                  <X className="h-4 w-4" />
                </Button>
                {onSectionDelete && sectionId && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onSectionDelete(sectionId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <Input
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tempTitle.trim()) {
                  e.preventDefault();
                  handleSaveSection();
                }
              }}
              placeholder="Describe this category of tasks or items (optional)"
              className="text-sm placeholder:text-muted-foreground/50"
            />
          </div>
        ) : (
          <>
            <CardTitle className="group flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <div
                className="-underline-offset-1 underline decoration-[8px] decoration-yellow-200 dark:decoration-yellow-600"
                style={{ textDecorationSkipInk: "none" }}
              >
                {title}
              </div>
              {editable && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 opacity-50 transition-opacity group-hover:opacity-100"
                  onClick={() => setIsEditingSection(true)}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              <MarkdownText text={description} />
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <PledgeItem
            key={item.id}
            item={item}
            onPledge={onPledge}
            onVolunteerNameChange={onVolunteerNameChange}
            onVolunteerDetailsChange={onVolunteerDetailsChange}
            isTask={isTask}
            editable={editable}
            onItemUpdate={onItemUpdate}
            onItemDelete={onItemDelete}
          />
        ))}
        {editable &&
          onItemAdd &&
          sectionId &&
          !sectionId.startsWith("temp-") && (
            <Button
              onClick={() => onItemAdd(sectionId)}
              variant="outline"
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          )}
      </CardContent>
    </Card>
  );
}
