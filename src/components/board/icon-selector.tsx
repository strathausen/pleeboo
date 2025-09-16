"use client";

import { Button } from "@/components/ui/button";
import { availableIcons as defaultIcons } from "@/lib/available-icons";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { IconPicker } from "./icon-picker";

interface IconSelectorProps {
  currentIcon: LucideIcon;
  availableIcons?: { icon: LucideIcon; name: string }[];
  onIconSelect: (icon: LucideIcon) => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

export function IconSelector({
  currentIcon: CurrentIcon,
  availableIcons,
  onIconSelect,
  size = "icon",
  variant = "outline",
  className,
}: IconSelectorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const icons = availableIcons || defaultIcons;

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
          icons={icons}
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
