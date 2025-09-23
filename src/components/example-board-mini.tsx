"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Car,
  ChefHat,
  Clock,
  Coffee,
  Gamepad2,
  Package,
  Pizza,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";

interface PledgeItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  needed: number;
  pledged: number;
  volunteers: string[];
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: PledgeItem[];
}

export function ExampleBoardMini() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [sections] = useState<Section[]>([
    {
      id: "food",
      title: "Food & Drinks",
      icon: <UtensilsCrossed className="h-4 w-4" />,
      items: [
        {
          id: "pizza",
          title: "Pizza (5 large)",
          icon: <Pizza className="h-4 w-4" />,
          needed: 1,
          pledged: 1,
          volunteers: ["Sarah M."],
        },
        {
          id: "drinks",
          title: "Soft drinks & water",
          icon: <Coffee className="h-4 w-4" />,
          needed: 2,
          pledged: 1,
          volunteers: ["Mike R."],
        },
        {
          id: "dessert",
          title: "Desserts",
          icon: <ChefHat className="h-4 w-4" />,
          needed: 3,
          pledged: 2,
          volunteers: ["Emma L.", "Alex K."],
        },
      ],
    },
    {
      id: "setup",
      title: "Setup & Cleanup",
      icon: <Package className="h-4 w-4" />,
      items: [
        {
          id: "tables",
          title: "Set up tables (3pm)",
          icon: <Clock className="h-4 w-4" />,
          needed: 2,
          pledged: 2,
          volunteers: ["John D.", "Lisa W."],
        },
        {
          id: "cleanup",
          title: "Cleanup crew",
          icon: <Trash2 className="h-4 w-4" />,
          needed: 3,
          pledged: 1,
          volunteers: ["Tom H."],
        },
      ],
    },
    {
      id: "activities",
      title: "Activities",
      icon: <Gamepad2 className="h-4 w-4" />,
      items: [
        {
          id: "games",
          title: "Kids games coordinator",
          icon: <Users className="h-4 w-4" />,
          needed: 1,
          pledged: 0,
          volunteers: [],
        },
        {
          id: "parking",
          title: "Parking helper",
          icon: <Car className="h-4 w-4" />,
          needed: 1,
          pledged: 1,
          volunteers: ["Ryan P."],
        },
      ],
    },
  ]);

  const totalNeeded = sections.reduce(
    (acc, section) =>
      acc + section.items.reduce((sum, item) => sum + item.needed, 0),
    0,
  );

  const totalPledged = sections.reduce(
    (acc, section) =>
      acc + section.items.reduce((sum, item) => sum + item.pledged, 0),
    0,
  );

  const progressPercentage = Math.round((totalPledged / totalNeeded) * 100);

  return (
    <div className="w-full space-y-4 rounded-lg border-2 bg-background p-4">
      {/* Mini Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="font-semibold">Summer Block Party</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          Live Example
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium">{progressPercentage}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-muted-foreground text-xs">
          {totalPledged} of {totalNeeded} items pledged
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            <div className="flex items-center gap-2 font-medium text-sm">
              {section.icon}
              <span>{section.title}</span>
            </div>
            <div className="ml-6 space-y-1">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={`group flex items-center justify-between rounded-md border px-3 py-2 transition-all ${
                    item.pledged >= item.needed
                      ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                      : hoveredItem === item.id
                        ? "border-primary/30 bg-muted/50"
                        : "border-border bg-background"
                  }`}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={
                        item.pledged >= item.needed
                          ? "text-green-600 dark:text-green-500"
                          : "text-muted-foreground"
                      }
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`text-sm ${
                        item.pledged >= item.needed
                          ? "text-green-700 line-through dark:text-green-400"
                          : ""
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.volunteers.length > 0 ? (
                      <span className="text-muted-foreground text-xs">
                        {item.volunteers[0]}
                        {item.volunteers.length > 1 &&
                          ` +${item.volunteers.length - 1}`}
                      </span>
                    ) : item.needed > 0 ? (
                      <Button
                        size="sm"
                        variant={hoveredItem === item.id ? "default" : "ghost"}
                        className="h-6 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        Pledge
                      </Button>
                    ) : null}
                    <Badge
                      variant={
                        item.pledged >= item.needed ? "default" : "outline"
                      }
                      className="min-w-[40px] justify-center text-xs"
                    >
                      {item.pledged}/{item.needed}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 border-t pt-3">
        <Button size="sm" className="flex-1">
          View Full Board
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          Create Your Own
        </Button>
      </div>
    </div>
  );
}
