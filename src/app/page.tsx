"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Book as Broom,
  Camera,
  CheckCircle,
  Clock,
  Gift,
  Heart,
  Music,
  Plus,
  UserPlus,
  Users,
  Utensils,
} from "lucide-react";
import { useState } from "react";

interface Volunteer {
  name: string;
  details: string;
}

interface PledgeItem {
  id: number;
  title: string;
  description: string;
  needed: number;
  volunteers: Volunteer[];
  icon:
    | typeof Broom
    | typeof Camera
    | typeof Music
    | typeof Gift
    | typeof Heart
    | typeof Utensils;
  category: string;
}

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
  const [selectedPledge, setSelectedPledge] = useState<PledgeItem | null>(null);
  const [formData, setFormData] = useState({ name: "", details: "" });

  const handlePledge = (pledgeItem: PledgeItem) => {
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

  const getStatusBadge = (needed: number, current: number) => {
    if (current >= needed) {
      return (
        <Badge className="bg-accent text-accent-foreground">
          <CheckCircle className="mr-1 h-3 w-3" />
          Complete
        </Badge>
      );
    }
    if (current > 0) {
      return (
        <Badge className="bg-secondary text-secondary-foreground">
          <Clock className="mr-1 h-3 w-3" />
          In Progress
        </Badge>
      );
    }
    return <Badge variant="outline">Needed</Badge>;
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
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className="space-y-3 rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <Icon className="mt-1 h-5 w-5 text-primary" />
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-card-foreground">
                          {task.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(task.needed, task.volunteers.length)}
                          <span className="text-muted-foreground text-sm">
                            {task.volunteers.length} of {task.needed} volunteers
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePledge(task)}
                      disabled={task.volunteers.length >= task.needed}
                      className="shrink-0"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Volunteer
                    </Button>
                  </div>

                  {task.volunteers.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-medium text-card-foreground text-sm">
                          Current Volunteers:
                        </h4>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {task.volunteers.map((volunteer, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {volunteer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">
                                  {volunteer.name}
                                </span>
                                {volunteer.details && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    - {volunteer.details}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
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
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="space-y-3 rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <Icon className="mt-1 h-5 w-5 text-primary" />
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-card-foreground">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.needed, item.volunteers.length)}
                          <span className="text-muted-foreground text-sm">
                            {item.volunteers.length} of {item.needed}{" "}
                            contributions
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePledge(item)}
                      disabled={item.volunteers.length >= item.needed}
                      className="shrink-0"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      I'll Bring This
                    </Button>
                  </div>

                  {item.volunteers.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-medium text-card-foreground text-sm">
                          Who's Bringing:
                        </h4>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {item.volunteers.map((volunteer, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {volunteer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">
                                  {volunteer.name}
                                </span>
                                {volunteer.details && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    - {volunteer.details}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedPledge?.category === "tasks"
                  ? "Volunteer for"
                  : "Sign up to bring"}
                : {selectedPledge?.title}
              </DialogTitle>
              <DialogDescription>
                {selectedPledge?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Additional Details (Optional)</Label>
                <Textarea
                  id="details"
                  placeholder={
                    selectedPledge?.category === "tasks"
                      ? "Any special skills, availability, or equipment you can bring..."
                      : "What specifically will you bring? How many people will it serve?..."
                  }
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitPledge} disabled={!formData.name.trim()}>
                {selectedPledge?.category === "tasks"
                  ? "Sign Me Up!"
                  : "I'll Bring This!"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
