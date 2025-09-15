"use client";

import { EditablePledgeItem } from "@/components/board/editable-pledge-item";
import { IconSelector } from "@/components/board/icon-selector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { availableIcons } from "@/lib/available-icons";
import {
  Check,
  Edit3,
  Gift,
  type LucideIcon,
  Package,
  Plus,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

export type BoardItemData = {
  id: number;
  title: string;
  description: string;
  needed: number;
  volunteers: { name: string; details: string }[];
  icon: LucideIcon;
  category: "tasks" | "items";
};

export type BoardSectionData = {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  items: BoardItemData[];
};


export default function BoardEditor() {
  const [boardTitle, setBoardTitle] = useState("Community Event Pledge Board");
  const [boardDescription, setBoardDescription] = useState(
    "Join us in making our community event amazing! Sign up to volunteer for tasks or bring items. Every contribution makes a difference! 🌟"
  );
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [sections, setSections] = useState<BoardSectionData[]>([
    {
      id: 1,
      title: "Volunteer Tasks",
      description:
        "Help make our event run smoothly by volunteering for these tasks",
      icon: Users,
      items: [],
    },
    {
      id: 2,
      title: "Items to Bring",
      description:
        "Sign up to bring food, drinks, or other items for the event",
      icon: Gift,
      items: [],
    },
  ]);

  const [nextId, setNextId] = useState(100);

  const addSection = () => {
    const newSection: BoardSectionData = {
      id: nextId,
      title: "New Section",
      description: "Add a description for this section",
      icon: Package,
      items: [],
    };
    setNextId(nextId + 1);
    setSections([...sections, newSection]);
  };

  const addItem = (sectionId: number) => {
    const newItem: BoardItemData = {
      id: nextId,
      title: "New Item",
      description: "Add a description",
      needed: 1,
      volunteers: [],
      icon: Star,
      category: "items",
    };
    setNextId(nextId + 1);
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    );
  };

  const updateSection = (
    sectionId: number,
    updates: Partial<BoardSectionData>
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    );
  };

  const deleteSection = (sectionId: number) => {
    setSections(sections.filter((section) => section.id !== sectionId));
  };

  const updateItem = (
    sectionId: number,
    itemId: number,
    updates: Partial<BoardItemData>
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : section
      )
    );
  };

  const deleteItem = (sectionId: number, itemId: number) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== itemId),
            }
          : section
      )
    );
  };

  const handleVolunteerNameChange = (
    itemId: number,
    volunteerIndex: number,
    newName: string
  ) => {
    setSections(
      sections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id === itemId) {
            const newVolunteers = [...item.volunteers];
            while (newVolunteers.length <= volunteerIndex) {
              newVolunteers.push({ name: "", details: "" });
            }
            newVolunteers[volunteerIndex] = {
              ...newVolunteers[volunteerIndex],
              name: newName,
            };
            const filteredVolunteers = newVolunteers.filter(
              (v, i) => v.name.trim() !== "" || i < item.needed
            );
            return {
              ...item,
              volunteers: filteredVolunteers.slice(0, item.needed),
            };
          }
          return item;
        }),
      }))
    );
  };

  const handleVolunteerDetailsChange = (
    itemId: number,
    volunteerIndex: number,
    newDetails: string
  ) => {
    setSections(
      sections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id === itemId) {
            const newVolunteers = [...item.volunteers];
            while (newVolunteers.length <= volunteerIndex) {
              newVolunteers.push({ name: "", details: "" });
            }
            newVolunteers[volunteerIndex] = {
              ...newVolunteers[volunteerIndex],
              details: newDetails,
            };
            return { ...item, volunteers: newVolunteers.slice(0, item.needed) };
          }
          return item;
        }),
      }))
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <ThemeToggle />
        </div>

        <div className="space-y-4">
          {isEditingHeader ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  placeholder="Board title"
                  className="font-bold text-2xl"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditingHeader(false)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={boardDescription}
                onChange={(e) => setBoardDescription(e.target.value)}
                placeholder="Board description"
                className="min-h-[80px]"
              />
            </div>
          ) : (
            <div
              className="space-y-4 text-center cursor-pointer group"
              onClick={() => setIsEditingHeader(true)}
            >
              <h1 className="font-bold text-4xl text-card-foreground group-hover:text-primary transition-colors">
                {boardTitle}
                <Edit3 className="inline-block ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                {boardDescription}
              </p>
            </div>
          )}
        </div>

        {sections.map((section) => (
          <EditableSection
            key={section.id}
            section={section}
            onUpdate={(updates) => updateSection(section.id, updates)}
            onDelete={() => deleteSection(section.id)}
            onAddItem={() => addItem(section.id)}
            items={section.items}
            onUpdateItem={(itemId, updates) =>
              updateItem(section.id, itemId, updates)
            }
            onDeleteItem={(itemId) => deleteItem(section.id, itemId)}
            onVolunteerNameChange={handleVolunteerNameChange}
            onVolunteerDetailsChange={handleVolunteerDetailsChange}
          />
        ))}

        <div className="flex justify-center">
          <Button onClick={addSection} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Section
          </Button>
        </div>

      </div>
    </div>
  );
}

function EditableSection({
  section,
  onUpdate,
  onDelete,
  onAddItem,
  items,
  onUpdateItem,
  onDeleteItem,
  onVolunteerNameChange,
  onVolunteerDetailsChange,
}: {
  section: BoardSectionData;
  onUpdate: (updates: Partial<BoardSectionData>) => void;
  onDelete: () => void;
  onAddItem: () => void;
  items: BoardItemData[];
  onUpdateItem: (itemId: number, updates: Partial<BoardItemData>) => void;
  onDeleteItem: (itemId: number) => void;
  onVolunteerNameChange: (itemId: number, index: number, name: string) => void;
  onVolunteerDetailsChange: (
    itemId: number,
    index: number,
    details: string
  ) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(section.title);
  const [tempDescription, setTempDescription] = useState(section.description);

  const handleSave = () => {
    onUpdate({ title: tempTitle, description: tempDescription });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(section.title);
    setTempDescription(section.description);
    setIsEditing(false);
  };

  const SectionIcon = section.icon;

  return (
    <Card>
      <CardHeader>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <IconSelector
                currentIcon={section.icon}
                onIconSelect={(icon) => onUpdate({ icon })}
              />
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="Section title"
                className="font-semibold"
              />
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={handleSave}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Input
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              placeholder="Section description"
              className="text-sm"
            />
          </div>
        ) : (
          <div
            className="cursor-pointer group"
            onClick={() => setIsEditing(true)}
          >
            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
              <SectionIcon className="h-5 w-5 text-primary" />
              {section.title}
              <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <EditablePledgeItem
            key={item.id}
            item={item}
            onVolunteerNameChange={(index, name) =>
              onVolunteerNameChange(item.id, index, name)
            }
            onVolunteerDetailsChange={(index, details) =>
              onVolunteerDetailsChange(item.id, index, details)
            }
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onDelete={() => onDeleteItem(item.id)}
            isTask={section.title.toLowerCase().includes("task")}
          />
        ))}
        <Button onClick={onAddItem} variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  );
}
