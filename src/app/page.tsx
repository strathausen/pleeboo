"use client";

import { PledgeDialog } from "@/components/pledge-board/pledge-dialog";
import {
  PledgeItem,
  type PledgeItemData,
} from "@/components/pledge-board/pledge-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Book as Broom,
  Camera,
  Gift,
  Heart,
  Music,
  Users,
  Utensils,
} from "lucide-react";
import { useState } from "react";

// Mock data for demonstration
const initialTasks = [
  {
    id: 1,
    title: "Setup & Cleanup Crew",
    description: "Help set up tables, chairs, and clean up after the event",
    needed: 4,
    volunteers: [
      { name: "Sarah Johnson", details: "Can bring cleaning supplies" },
      { name: "Mike Chen", details: "Available all day" },
    ],
    icon: Broom,
    category: "tasks",
  },
  {
    id: 2,
    title: "Photography Team",
    description: "Capture memories throughout the event",
    needed: 2,
    volunteers: [
      { name: "Alex Rivera", details: "Professional camera equipment" },
    ],
    icon: Camera,
    category: "tasks",
  },
  {
    id: 3,
    title: "Music & Entertainment",
    description: "DJ or live music for the event",
    needed: 1,
    volunteers: [],
    icon: Music,
    category: "tasks",
  },
];

const initialItems = [
  {
    id: 4,
    title: "Savory Dishes",
    description: "Main courses, appetizers, or side dishes",
    needed: 6,
    volunteers: [
      { name: "Emma Davis", details: "Bringing lasagna for 12 people" },
      { name: "James Wilson", details: "Homemade tacos and fixings" },
      { name: "Lisa Park", details: "Vegetarian spring rolls" },
    ],
    icon: Utensils,
    category: "items",
  },
  {
    id: 5,
    title: "Desserts & Sweets",
    description: "Cakes, cookies, pies, or other sweet treats",
    needed: 4,
    volunteers: [
      { name: "Maria Garcia", details: "Chocolate chip cookies" },
      { name: "Tom Anderson", details: "Apple pie" },
    ],
    icon: Gift,
    category: "items",
  },
  {
    id: 6,
    title: "Beverages",
    description: "Soft drinks, juices, coffee, or water",
    needed: 3,
    volunteers: [{ name: "Rachel Kim", details: "Coffee and tea station" }],
    icon: Heart,
    category: "items",
  },
];

export default function PledgeBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [items, setItems] = useState(initialItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<PledgeItemData | null>(
    null
  );
  const [formData, setFormData] = useState({ name: "", details: "" });

  const handlePledge = (pledgeItem: PledgeItemData) => {
    setSelectedPledge(pledgeItem);
    setIsDialogOpen(true);
  };

  const submitPledge = () => {
    if (!selectedPledge) return;
    if (!formData.name.trim()) return;

    const newVolunteer = {
      name: formData.name,
      details: formData.details || "No additional details",
    };

    if (selectedPledge.category === "tasks") {
      setTasks(
        tasks.map((task) =>
          task.id === selectedPledge.id
            ? { ...task, volunteers: [...task.volunteers, newVolunteer] }
            : task
        )
      );
    } else {
      setItems(
        items.map((item) =>
          item.id === selectedPledge.id
            ? { ...item, volunteers: [...item.volunteers, newVolunteer] }
            : item
        )
      );
    }

    setFormData({ name: "", details: "" });
    setIsDialogOpen(false);
    setSelectedPledge(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header with logo and theme toggle */}
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <ThemeToggle />
        </div>

        {/* Main Header */}
        <div className="space-y-4 text-center">
          <h1 className="font-bold text-4xl text-card-foreground">
            Community Event Pledge Board
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Join us in making our community event amazing! Sign up to volunteer
            for tasks or bring items. Every contribution makes a difference! 🌟
          </p>
        </div>

        {/* Tasks Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Volunteer Tasks
            </CardTitle>
            <CardDescription>
              Help make our event run smoothly by volunteering for these tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <PledgeItem
                key={task.id}
                item={task}
                onPledge={handlePledge}
                isTask={true}
              />
            ))}
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Items to Bring
            </CardTitle>
            <CardDescription>
              Sign up to bring food, drinks, or other items for the event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <PledgeItem
                key={item.id}
                item={item}
                onPledge={handlePledge}
                isTask={false}
              />
            ))}
          </CardContent>
        </Card>

        {/* Success Message */}
        <Alert className="border-accent bg-accent/10">
          <Heart className="h-4 w-4 text-accent-foreground" />
          <AlertTitle className="text-accent-foreground">Thank You!</AlertTitle>
          <AlertDescription className="text-accent-foreground">
            Your participation makes our community stronger. Every contribution,
            big or small, is deeply appreciated!
          </AlertDescription>
        </Alert>

        {/* Pledge Dialog */}
        <PledgeDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedPledge={selectedPledge}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={submitPledge}
        />
      </div>
    </div>
  );
}
