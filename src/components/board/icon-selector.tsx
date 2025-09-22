"use client";

import { Button } from "@/components/ui/button";
import { type IconName, getIcon } from "@/lib/available-icons";
import { useState } from "react";
import { IconPicker } from "./icon-picker";

interface IconSelectorProps {
  currentIcon: IconName;
  onIconSelect: (icon: IconName) => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

export function IconSelector({
  currentIcon,
  onIconSelect,
  size = "icon",
  variant = "outline",
  className,
}: IconSelectorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const CurrentIcon = getIcon(currentIcon);

  return (
    <div className="relative">
      <Button
        size={size}
        variant={variant}
        onClick={() => setShowIconPicker(!showIconPicker)}
        className={className}
        type="button"
      >
        <CurrentIcon className="h-4 w-4" />
      </Button>
      {showIconPicker && (
        <IconPicker
          onSelect={(icon) => {
            onIconSelect(icon);
            setShowIconPicker(false);
          }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}
