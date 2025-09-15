"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { PledgeItem, type PledgeItemData } from "./pledge-item";

interface PledgeSectionProps {
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
}

export function PledgeSection({
  title,
  description,
  icon: Icon,
  items,
  onPledge,
  onVolunteerNameChange,
  onVolunteerDetailsChange,
  isTask,
}: PledgeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
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
          />
        ))}
      </CardContent>
    </Card>
  );
}