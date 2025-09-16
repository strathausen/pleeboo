"use client";

import { BoardHeader } from "@/components/pledge-board/board-header";
import { PledgeSection } from "@/components/pledge-board/pledge-section";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { getIconByName, getIconName } from "@/lib/available-icons";
import { api } from "@/trpc/react";
import { Edit3, Eye, Loader2, Share2, Check } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type VolunteerUpdate = {
  itemId: number;
  volunteerIndex: number;
  name: string;
  details: string;
};

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  const {
    data: board,
    isLoading,
    refetch,
  } = api.board.get.useQuery({ id: boardId });
  const [localBoard, setLocalBoard] = useState(board);
  const [pendingUpdates, setPendingUpdates] = useState<
    Map<string, VolunteerUpdate>
  >(new Map());
  const [editMode, setEditMode] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  // Debounce the pending updates
  const debouncedUpdates = useDebounce(pendingUpdates, 500);

  const updateVolunteer = api.board.updateVolunteer.useMutation();
  const updateSection = api.board.updateSection.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  const updateItem = api.board.updateItem.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  const deleteSection = api.board.deleteSection.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  const deleteItem = api.board.deleteItem.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  const addItem = api.board.addItem.useMutation({
    onSuccess: (newItem) => {
      // Update local state with the new item from server
      if (localBoard) {
        setLocalBoard({
          ...localBoard,
          sections: localBoard.sections.map((section) => {
            if (section.items.some((item) => item.id === newItem.id)) {
              // Replace the temporary item with the real one from server
              return {
                ...section,
                items: section.items.map((item) =>
                  item.id < 0 && item.sectionId === newItem.sectionId
                    ? { ...newItem, volunteers: [] }
                    : item
                ),
              };
            }
            return section;
          }),
        });
      }
      void refetch();
    },
  });

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

  const handleVolunteerNameChange = useCallback(
    (itemId: number, volunteerIndex: number, newName: string) => {
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
                    updatedAt: null,
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
      const details =
        existingUpdate?.details ||
        localBoard?.sections
          .find((s) => s.items.some((i) => i.id === itemId))
          ?.items.find((i) => i.id === itemId)?.volunteers[volunteerIndex]
          ?.details ||
        "";

      setPendingUpdates(
        new Map(
          pendingUpdates.set(key, {
            itemId,
            volunteerIndex,
            name: newName,
            details,
          })
        )
      );
    },
    [localBoard, pendingUpdates]
  );

  const handleVolunteerDetailsChange = useCallback(
    (itemId: number, volunteerIndex: number, newDetails: string) => {
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
                    updatedAt: null,
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
      const name =
        existingUpdate?.name ||
        localBoard?.sections
          .find((s) => s.items.some((i) => i.id === itemId))
          ?.items.find((i) => i.id === itemId)?.volunteers[volunteerIndex]
          ?.name ||
        "";

      setPendingUpdates(
        new Map(
          pendingUpdates.set(key, {
            itemId,
            volunteerIndex,
            name,
            details: newDetails,
          })
        )
      );
    },
    [localBoard, pendingUpdates]
  );

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

  const handleSectionUpdate = (sectionId: number, updates: any) => {
    // Update local state immediately
    setLocalBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((section) => {
          if (section.id === sectionId) {
            return { ...section, ...updates };
          }
          return section;
        }),
      };
    });

    // Send to server in background
    updateSection.mutate({
      id: sectionId,
      ...updates,
      icon: updates.icon ? getIconName(updates.icon) : undefined,
    });
  };

  const handleItemUpdate = (itemId: number, updates: any) => {
    // Update local state immediately
    setLocalBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, ...updates };
            }
            return item;
          }),
        })),
      };
    });

    // Send to server in background
    updateItem.mutate({
      id: itemId,
      ...updates,
      icon: updates.icon ? getIconName(updates.icon) : undefined,
    });
  };

  const handleItemAdd = (sectionId: number) => {
    // Add item to local state immediately with a temporary ID
    const tempId = -Date.now(); // Negative ID to distinguish from real IDs
    const newItem = {
      id: tempId,
      sectionId,
      title: "New Item",
      description: "Add a description",
      icon: getIconByName("Star")!,
      needed: 1,
      volunteers: [],
      sortOrder: 999,
      createdAt: new Date(),
      updatedAt: null,
    };

    // Update local state immediately for instant feedback
    setLocalBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              items: [...section.items, newItem],
            };
          }
          return section;
        }),
      };
    });

    // Send to server in background
    addItem.mutate({
      sectionId,
      title: "New Item",
      description: "Add a description",
      icon: "Star",
      needed: 1,
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
          <BoardHeader
            title={localBoard.title}
            description={localBoard.description || ""}
          />
        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handleShare}
              variant="default"
              className="gap-2"
            >
              {justCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "default" : "outline"}
              className="gap-2"
            >
            {editMode ? (
              <>
                <Eye className="h-4 w-4" />
                View Mode
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                Edit Mode
              </>
            )}
            </Button>
          </div>
        </div>

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
              sectionId={section.id}
              title={section.title}
              description={section.description || ""}
              icon={sectionIcon}
              items={items}
              onPledge={() => {}}
              onVolunteerNameChange={handleVolunteerNameChange}
              onVolunteerDetailsChange={handleVolunteerDetailsChange}
              isTask={section.title.toLowerCase().includes("task")}
              editable={editMode}
              onSectionUpdate={handleSectionUpdate}
              onSectionDelete={(id) => {
                // Update local state immediately
                setLocalBoard((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    sections: prev.sections.filter((s) => s.id !== id),
                  };
                });
                // Send to server in background
                deleteSection.mutate({ id });
              }}
              onItemUpdate={handleItemUpdate}
              onItemDelete={(id) => {
                // Update local state immediately
                setLocalBoard((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    sections: prev.sections.map((section) => ({
                      ...section,
                      items: section.items.filter((item) => item.id !== id),
                    })),
                  };
                });
                // Send to server in background
                deleteItem.mutate({ id });
              }}
              onItemAdd={handleItemAdd}
            />
          );
        })}
      </div>
    </div>
  );
}
