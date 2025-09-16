"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Check, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";

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

  // Keep temp values in sync with props when not editing
  useEffect(() => {
    if (!isEditing) {
      setTempTitle(title);
      setTempDescription(description);
    }
  }, [title, description, isEditing]);

  const handleSave = () => {
    // Update the parent state first
    if (onTitleChange && tempTitle !== title) {
      onTitleChange(tempTitle);
    }
    if (onDescriptionChange && tempDescription !== description) {
      onDescriptionChange(tempDescription);
    }
    // Then exit edit mode
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                placeholder="Board title"
                className="font-bold text-2xl"
              />
              <Button
                size="icon"
                variant="default"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-5 w-5" />
              </Button>
            </div>
            <Textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
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
              className={`relative inline-block font-bold text-4xl text-card-foreground ${editable ? "transition-colors group-hover:text-primary" : ""}`}
            >
              {title}
              {editable && (
                <Edit3 className="absolute -right-8 top-1/2 -translate-y-1/2 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground whitespace-pre-wrap">
              {description}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
