"use client";

import { BoardHeader } from "@/components/pledge-board/board-header";
import { PledgeSection } from "@/components/pledge-board/pledge-section";
import { api } from "@/trpc/react";
import { getIconByName } from "@/lib/available-icons";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";

type VolunteerUpdate = {
  itemId: number;
  volunteerIndex: number;
  name: string;
  details: string;
};

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  const { data: board, isLoading } = api.board.get.useQuery({ id: boardId });
  const [localBoard, setLocalBoard] = useState(board);
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, VolunteerUpdate>>(new Map());

  // Debounce the pending updates
  const debouncedUpdates = useDebounce(pendingUpdates, 500);

  const updateVolunteer = api.board.updateVolunteer.useMutation();

  // Update local board when server data changes
  useEffect(() => {
    if (board) {
      setLocalBoard(board);
    }
  }, [board]);

  // Process debounced updates
  useEffect(() => {
    if (debouncedUpdates.size > 0) {
      debouncedUpdates.forEach((update) => {
        updateVolunteer.mutate(update);
      });
      setPendingUpdates(new Map());
    }
  }, [debouncedUpdates]);

  const handleVolunteerNameChange = useCallback((
    itemId: number,
    volunteerIndex: number,
    newName: string
  ) => {
    // Update local state immediately for instant feedback
    setLocalBoard((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.id === itemId) {
              const newVolunteers = [...item.volunteers];
              while (newVolunteers.length <= volunteerIndex) {
                newVolunteers.push({
                  id: Date.now() + volunteerIndex,
                  itemId,
                  name: "",
                  details: null,
                  createdAt: new Date(),
                  updatedAt: null
                });
              }
              newVolunteers[volunteerIndex] = {
                ...newVolunteers[volunteerIndex],
                name: newName,
              };
              return { ...item, volunteers: newVolunteers };
            }
            return item;
          }),
        })),
      };
    });

    // Queue the update for the server
    const key = `${itemId}-${volunteerIndex}`;
    const existingUpdate = pendingUpdates.get(key);
    const details = existingUpdate?.details ||
      localBoard?.sections.find(s => s.items.some(i => i.id === itemId))
        ?.items.find(i => i.id === itemId)
        ?.volunteers[volunteerIndex]?.details || "";

    setPendingUpdates(new Map(pendingUpdates.set(key, {
      itemId,
      volunteerIndex,
      name: newName,
      details,
    })));
  }, [localBoard, pendingUpdates]);

  const handleVolunteerDetailsChange = useCallback((
    itemId: number,
    volunteerIndex: number,
    newDetails: string
  ) => {
    // Update local state immediately
    setLocalBoard((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.id === itemId) {
              const newVolunteers = [...item.volunteers];
              while (newVolunteers.length <= volunteerIndex) {
                newVolunteers.push({
                  id: Date.now() + volunteerIndex,
                  itemId,
                  name: "",
                  details: null,
                  createdAt: new Date(),
                  updatedAt: null
                });
              }
              newVolunteers[volunteerIndex] = {
                ...newVolunteers[volunteerIndex],
                details: newDetails,
              };
              return { ...item, volunteers: newVolunteers };
            }
            return item;
          }),
        })),
      };
    });

    // Queue the update for the server
    const key = `${itemId}-${volunteerIndex}`;
    const existingUpdate = pendingUpdates.get(key);
    const name = existingUpdate?.name ||
      localBoard?.sections.find(s => s.items.some(i => i.id === itemId))
        ?.items.find(i => i.id === itemId)
        ?.volunteers[volunteerIndex]?.name || "";

    setPendingUpdates(new Map(pendingUpdates.set(key, {
      itemId,
      volunteerIndex,
      name,
      details: newDetails,
    })));
  }, [localBoard, pendingUpdates]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!localBoard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Board not found</h1>
          <p className="text-muted-foreground mt-2">
            This board doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <BoardHeader
          title={localBoard.title}
          description={localBoard.description || ""}
        />

        {localBoard.sections.map((section) => {
          const sectionIcon = getIconByName(section.icon);
          if (!sectionIcon) return null;

          const items = section.items.map((item) => {
            const itemIcon = getIconByName(item.icon);
            return {
              id: item.id,
              title: item.title,
              description: item.description || "",
              needed: item.needed,
              volunteers: item.volunteers.map((v) => ({
                name: v.name,
                details: v.details || "",
              })),
              icon: itemIcon || getIconByName("Star")!,
              category: "items" as const,
            };
          });

          return (
            <PledgeSection
              key={section.id}
              title={section.title}
              description={section.description || ""}
              icon={sectionIcon}
              items={items}
              onPledge={() => {}}
              onVolunteerNameChange={handleVolunteerNameChange}
              onVolunteerDetailsChange={handleVolunteerDetailsChange}
              isTask={section.title.toLowerCase().includes("task")}
            />
          );
        })}
      </div>
    </div>
  );
}
