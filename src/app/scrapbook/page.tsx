"use client";

import { IconPicker } from "@/components/board/icon-picker";
import { IconSelector } from "@/components/board/icon-selector";
import { BoardHeader } from "@/components/pledge-board/board-header";
import { PledgeDialog } from "@/components/pledge-board/pledge-dialog";
import { PledgeItem } from "@/components/pledge-board/pledge-item";
import { PledgeSection } from "@/components/pledge-board/pledge-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Progress } from "@/components/ui/progress";
import { Stats } from "@/components/ui/stats";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { availableIcons } from "@/lib/available-icons";
import {
  ArrowRight,
  Book as Broom,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Gift,
  Heart,
  Info,
  Loader2,
  Music,
  Plus,
  Settings,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

export default function ScrapbookPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(Star);

  const mockPledgeItem = {
    id: 1,
    title: "Setup & Cleanup Crew",
    description: "Help set up tables, chairs, and clean up after the event",
    needed: 4,
    volunteers: [
      { name: "Sarah Johnson", details: "Can bring cleaning supplies" },
      { name: "Mike Chen", details: "Available all day" },
    ],
    icon: Broom,
    category: "tasks" as const,
  };

  const mockEditableItem = {
    id: 2,
    title: "Photography Team",
    description: "Capture memories throughout the event",
    needed: 2,
    volunteers: [
      { name: "Alex Rivera", details: "Professional camera equipment" },
    ],
    icon: Camera,
    category: "tasks" as const,
  };

  const mockStats = [
    { label: "Total Tasks", value: 12 },
    { label: "Completed", value: 8, className: "text-green-500" },
    { label: "Volunteers", value: 15 },
  ];

  const mockSectionItems = [
    {
      id: 3,
      title: "Music & Entertainment",
      description: "DJ or live music for the event",
      needed: 1,
      volunteers: [],
      icon: Music,
      category: "tasks" as const,
    },
    {
      id: 4,
      title: "Decorations",
      description: "Set up and take down decorations",
      needed: 3,
      volunteers: [{ name: "Emma Davis", details: "Has party supplies" }],
      icon: Gift,
      category: "tasks" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Page Header */}
        <div className="space-y-4">
          <h1 className="font-bold text-4xl">UI Component Scrapbook</h1>
          <p className="text-lg text-muted-foreground">
            A showcase of all UI components used in Pleeboo
          </p>
        </div>

        {/* Logos */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Logos</h2>
          <div className="flex flex-wrap items-center gap-8 rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Small</p>
              <Logo size="sm" />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Medium</p>
              <Logo size="md" />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Large</p>
              <Logo size="lg" />
            </div>
          </div>
        </section>

        {/* Headers */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Headers</h2>
          <div className="space-y-4">
            <div className="rounded-lg border">
              <Header />
            </div>
            <div className="rounded-lg border p-6">
              <BoardHeader
                title="Community Event Pledge Board"
                description="Join us in making our community event amazing! Sign up to volunteer for tasks or bring items."
              />
            </div>
            <div className="rounded-lg border p-6">
              <BoardHeader
                title="Editable Board Header"
                description="Click to edit this header"
                editable={true}
                onTitleChange={(title) => console.log("Title:", title)}
                onDescriptionChange={(desc) =>
                  console.log("Description:", desc)
                }
              />
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Buttons</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  With Icon
                </Button>
                <Button>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Elements */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Form Elements</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Input placeholder="Default input" />
              <Input placeholder="With value" value="Example text" readOnly />
              <Input placeholder="Disabled input" disabled />
              <Textarea placeholder="Enter your message here..." />
              <Textarea
                placeholder="With value"
                value="This is a longer text that spans multiple lines to show how the textarea component handles content."
                readOnly
              />
            </CardContent>
          </Card>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Cards</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>
                  Card with title and description
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  This is the card content area where you can place any content.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  With Icon
                </CardTitle>
                <CardDescription>
                  Card with an icon in the title
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Icons help identify content quickly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle>Custom Border</CardTitle>
                <CardDescription>Card with dashed border</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Action Button</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Alerts */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Alerts</h2>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>
                This is a default alert with an icon, title, and description.
              </AlertDescription>
            </Alert>

            <Alert className="border-accent bg-accent/10">
              <Heart className="h-4 w-4 text-accent-foreground" />
              <AlertTitle className="text-accent-foreground">
                Thank You!
              </AlertTitle>
              <AlertDescription className="text-accent-foreground">
                Your participation makes our community stronger. Every
                contribution, big or small, is deeply appreciated!
              </AlertDescription>
            </Alert>

            <Alert className="border-destructive bg-destructive/10">
              <X className="h-4 w-4 text-destructive" />
              <AlertTitle className="text-destructive">Error</AlertTitle>
              <AlertDescription className="text-destructive">
                Something went wrong. Please try again later.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Progress */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Progress Bars</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">0% Progress</p>
                <Progress value={0} />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">25% Progress</p>
                <Progress value={25} />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">50% Progress</p>
                <Progress value={50} />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">75% Progress</p>
                <Progress value={75} />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">100% Progress</p>
                <Progress value={100} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Stats Component</h2>
          <Card>
            <CardContent className="pt-6">
              <Stats stats={mockStats} />
            </CardContent>
          </Card>
        </section>

        {/* Pledge Items */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Pledge Items</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Regular Pledge Item
              </p>
              <PledgeItem
                item={mockPledgeItem}
                onPledge={() => setIsDialogOpen(true)}
                onVolunteerNameChange={(id, index, name) =>
                  console.log("Name change:", id, index, name)
                }
                onVolunteerDetailsChange={(id, index, details) =>
                  console.log("Details change:", id, index, details)
                }
                isTask={true}
              />
            </div>
          </div>
        </section>

        {/* Pledge Section */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Pledge Section</h2>
          <PledgeSection
            title="Volunteer Tasks"
            description="Help make our event run smoothly by volunteering for these tasks"
            icon={Users}
            items={mockSectionItems}
            onPledge={() => setIsDialogOpen(true)}
            onVolunteerNameChange={(id, index, name) =>
              console.log("Name change:", id, index, name)
            }
            onVolunteerDetailsChange={(id, index, details) =>
              console.log("Details change:", id, index, details)
            }
            isTask={true}
          />
        </section>

        {/* Icon Components */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Icon Components</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Icon Selector</CardTitle>
                <CardDescription>
                  Click the button to select an icon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IconSelector
                  currentIcon={selectedIcon}
                  onIconSelect={setSelectedIcon}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Icon Picker (Open State)</CardTitle>
                <CardDescription>
                  Icon picker component in open state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Button onClick={() => setShowIconPicker(!showIconPicker)}>
                    Toggle Icon Picker
                  </Button>
                  {showIconPicker && (
                    <IconPicker
                      icons={availableIcons}
                      onSelect={(icon) => {
                        setSelectedIcon(icon);
                        setShowIconPicker(false);
                      }}
                      onClose={() => setShowIconPicker(false)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Loading States</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">
                  Small spinner
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-muted-foreground text-sm">
                  Medium spinner
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-muted-foreground text-sm">
                  Large colored spinner
                </span>
              </div>
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Theme Toggle */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Theme Toggle</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <span className="text-muted-foreground text-sm">
                  Toggle between light and dark themes
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dialog */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Dialog</h2>
          <Card>
            <CardContent className="pt-6">
              <Button onClick={() => setIsDialogOpen(true)}>
                Open Pledge Dialog
              </Button>
              <PledgeDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                selectedPledge={mockPledgeItem}
                formData={{ name: "", details: "" }}
                onFormDataChange={(data) => console.log("Form data:", data)}
                onSubmit={() => {
                  console.log("Submit pledge");
                  setIsDialogOpen(false);
                }}
              />
            </CardContent>
          </Card>
        </section>

        {/* Icon Showcase */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Available Icons</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-8 gap-4 sm:grid-cols-12 md:grid-cols-16">
                {availableIcons.map(({ icon: Icon, name }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-1 rounded p-2 hover:bg-muted"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="w-full truncate text-center text-muted-foreground text-xs">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Utility Icons */}
        <section className="space-y-4">
          <h2 className="font-semibold text-2xl">Utility Icons</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Plus</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  <span className="text-sm">X</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Check</span>
                </div>
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  <span className="text-sm">Edit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Trash</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronUp className="h-4 w-4" />
                  <span className="text-sm">ChevronUp</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4" />
                  <span className="text-sm">ChevronDown</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-sm">ArrowRight</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="border-t pt-8 pb-4">
          <p className="text-center text-muted-foreground text-sm">
            End of UI Component Scrapbook
          </p>
        </div>
      </div>
    </div>
  );
}
