"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconSelector } from "@/components/board/icon-selector";
import { type LucideIcon, Edit3, Plus, Trash2, Check, X } from "lucide-react";
import { PledgeItem, type PledgeItemData } from "./pledge-item";
import { useState } from "react";

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
    newName: string
  ) => void;
  onVolunteerDetailsChange: (
    itemId: number,
    volunteerIndex: number,
    newDetails: string
  ) => void;
  isTask: boolean;
  editable?: boolean;
  onSectionUpdate?: (sectionId: number, updates: { title?: string; description?: string; icon?: LucideIcon }) => void;
  onSectionDelete?: (sectionId: number) => void;
  onItemUpdate?: (itemId: number, updates: Partial<PledgeItemData>) => void;
  onItemDelete?: (itemId: number) => void;
  onItemAdd?: (sectionId: number) => void;
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
    <Card>
      <CardHeader>
        {isEditingSection && editable ? (
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <IconSelector
                currentIcon={Icon}
                onIconSelect={(icon) => onSectionUpdate?.(sectionId!, { icon })}
              />
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="Section title"
                className="font-semibold"
              />
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={handleSaveSection}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelSection}>
                  <X className="h-4 w-4" />
                </Button>
                {onSectionDelete && sectionId && (
                  <Button size="icon" variant="ghost" onClick={() => onSectionDelete(sectionId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <Input
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              placeholder="Section description"
              className="text-sm"
            />
          </div>
        ) : (
          <>
            <CardTitle className="flex items-center gap-2 group">
              <Icon className="h-5 w-5 text-primary" />
              {title}
              {editable && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsEditingSection(true)}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
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