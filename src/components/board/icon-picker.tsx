"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

interface IconPickerProps {
  icons: { icon: LucideIcon; name: string }[];
  onSelect: (icon: LucideIcon) => void;
  onClose: () => void;
}

export function IconPicker({ icons, onSelect, onClose }: IconPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-2 w-80 rounded-lg border bg-popover p-2 shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Choose an icon</span>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-8 gap-1 max-h-60 overflow-y-auto">
        {icons.map(({ icon: Icon, name }) => (
          <Button
            key={name}
            size="icon"
            variant="ghost"
            onClick={() => onSelect(Icon)}
            className="h-8 w-8 hover:bg-primary/10"
            title={name}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  );
}