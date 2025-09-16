"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Check, Edit3 } from "lucide-react";
import { useState } from "react";

interface BoardHeaderProps {
  title: string;
  description: string;
  editable?: boolean;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

export function BoardHeader({
  title,
  description,
  editable = false,
  onTitleChange,
  onDescriptionChange,
}: BoardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempDescription, setTempDescription] = useState(description);

  const handleSave = () => {
    if (onTitleChange) onTitleChange(tempTitle);
    if (onDescriptionChange) onDescriptionChange(tempDescription);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(title);
    setTempDescription(description);
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Logo size="lg" />
        <ThemeToggle />
      </div>

      <div className="space-y-4">
        {editable && isEditing ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="Board title"
                className="font-bold text-2xl"
              />
              <Button size="icon" variant="ghost" onClick={handleSave}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              placeholder="Board description"
              className="min-h-[80px]"
            />
          </div>
        ) : (
          <div
            className={`space-y-4 text-center ${editable ? "group cursor-pointer" : ""}`}
            onClick={() => editable && setIsEditing(true)}
          >
            <h1
              className={`font-bold text-4xl text-card-foreground ${editable ? "transition-colors group-hover:text-primary" : ""}`}
            >
              {title}
              {editable && (
                <Edit3 className="ml-2 inline-block h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              {description}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
