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
import { ArrowUp, ArrowDown, Check, Edit3, type LucideIcon, Plus, Trash2, X } from "lucide-react";
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
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempDescription, setTempDescription] = useState(description);

  const handleSaveSection = () => {
    if (onSectionUpdate && sectionId) {
      onSectionUpdate(sectionId, {
        title: tempTitle,
        description: tempDescription,
      });
    }
    setIsEditingSection(false);
  };

  const handleCancelSection = () => {
    setTempTitle(title);
    setTempDescription(description);
    setIsEditingSection(false);
  };
  return (
    <Card className={`relative ${editable && !isEditingSection ? 'mt-3' : ''}`}>
      {editable && !isEditingSection && onMoveUp && onMoveDown && sectionId && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 shadow-sm border bg-background hover:bg-accent"
            onClick={() => onMoveUp(sectionId)}
            disabled={isFirst}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 shadow-sm border bg-background hover:bg-accent"
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
                placeholder="Section title"
                className="font-semibold"
              />
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="default"
                  onClick={handleSaveSection}
                  className="bg-green-600 hover:bg-green-700 text-white"
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
              placeholder="Section description (supports markdown)"
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
        {editable && onItemAdd && sectionId && (
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
