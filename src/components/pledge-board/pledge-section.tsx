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
import { useState } from "react";
import { PledgeItem, type PledgeItemData } from "./pledge-item";

interface PledgeSectionProps {
  sectionId?: number;
  title: string;
  description: string;
  icon: LucideIcon;
  items: PledgeItemData[];
  onPledge: (item: PledgeItemData) => void;
  onVolunteerNameChange: (
    itemId: number,
    volunteerIndex: number,
    newName: string,
  ) => void;
  onVolunteerDetailsChange: (
    itemId: number,
    volunteerIndex: number,
    newDetails: string,
  ) => void;
  isTask: boolean;
  editable?: boolean;
  onSectionUpdate?: (
    sectionId: number,
    updates: { title?: string; description?: string; icon?: LucideIcon },
  ) => void;
  onSectionDelete?: (sectionId: number) => void;
  onItemUpdate?: (itemId: number, updates: Partial<PledgeItemData>) => void;
  onItemDelete?: (itemId: number) => void;
  onItemAdd?: (sectionId: number) => void;
  onMoveUp?: (sectionId: number) => void;
  onMoveDown?: (sectionId: number) => void;
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
  // Start in edit mode if it's a new section (negative ID)
  const [isEditingSection, setIsEditingSection] = useState(
    sectionId ? sectionId < 0 : false,
  );
  const [tempTitle, setTempTitle] = useState(title);
  const [tempDescription, setTempDescription] = useState(description);

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
    if (sectionId && sectionId < 0) {
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
        <div className="-top-5 -translate-x-1/2 absolute left-1/2 z-10 flex gap-1">
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
                placeholder="Section title (required)"
                className="font-semibold"
                autoFocus={sectionId ? sectionId < 0 : false}
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
              placeholder="Section description (optional, supports markdown)"
              className="text-sm"
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
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
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
        {editable && onItemAdd && sectionId && sectionId > 0 && (
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
