"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { MarkdownText } from "@/components/ui/markdown-text";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Check, Edit3, Info } from "lucide-react";
import { useEffect, useState } from "react";

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
            <div className="mx-auto max-w-3xl">
              <div className="relative">
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
                  className="h-auto border-0 bg-transparent p-0 pr-12 text-center font-bold text-4xl text-card-foreground placeholder:font-normal placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  size="icon"
                  variant="default"
                  onClick={handleSave}
                  className="-translate-y-1/2 absolute top-1/2 right-0 bg-green-600 text-white hover:bg-green-700"
                >
                  <Check className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="mx-auto max-w-3xl space-y-2">
              <Textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                placeholder="Board description (supports markdown)"
                className="min-h-[120px] resize-none border-0 bg-transparent p-0 text-lg text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Info className="h-3 w-3" />
                <span>
                  Supports **bold**, *italic*, [links](url), and lists •
                  Cmd/Ctrl+Enter to save
                </span>
              </div>
            </div>
          </div>
        ) : (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <div
            className={`space-y-4 ${editable ? "group cursor-pointer" : ""}`}
            onClick={() => editable && setIsEditing(true)}
          >
            <div className="text-center">
              <h1
                className={`relative inline-block font-bold text-4xl text-card-foreground ${
                  editable ? "transition-colors group-hover:text-primary" : ""
                }`}
              >
                {title}
                {editable && (
                  <Edit3 className="-right-8 -translate-y-1/2 absolute top-1/2 h-5 w-5 opacity-50 transition-opacity group-hover:opacity-100" />
                )}
              </h1>
            </div>
            <div className="mx-auto max-w-3xl text-left text-lg text-muted-foreground">
              <MarkdownText text={description} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
