"use client";

import { ShareDialog } from "@/components/board/share-dialog";
import { BoardHeader } from "@/components/pledge-board/board-header";
import { PledgeSection } from "@/components/pledge-board/pledge-section";
import { Button } from "@/components/ui/button";
import { useBoardHistory } from "@/hooks/use-board-history";
import { useDebounce } from "@/hooks/use-debounce";
import { getIconByName, getIconName } from "@/lib/available-icons";
import { api } from "@/trpc/react";
import {
  Edit3,
  Eye,
  Gift,
  Loader2,
  Package,
  Plus,
  Save,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type VolunteerUpdate = {
  itemId: number;
  volunteerIndex: number;
  name: string;
  details: string;
};

export type BoardData = {
  id?: string;
  title: string;
  description?: string | null;
  sections: Array<{
    id: number;
    title: string;
    description?: string | null;
    icon: string;
    items: Array<{
      id: number;
      sectionId?: number;
      title: string;
      description?: string | null;
      icon: string;
      needed: number;
      volunteers: Array<{
        id?: number;
        itemId?: number;
        name: string;
        details?: string | null;
        createdAt?: Date;
        updatedAt?: Date | null;
      }>;
      sortOrder?: number;
      createdAt?: Date;
      updatedAt?: Date | null;
    }>;
  }>;
};

interface PledgeBoardProps {
  mode: "create" | "view";
  boardId?: string;
  token?: string;
  initialData?: BoardData;
}

export function PledgeBoard({
  mode,
  boardId,
  token,
  initialData,
}: PledgeBoardProps) {
  const router = useRouter();
  const { addToHistory } = useBoardHistory();

  // State
  const [localBoard, setLocalBoard] = useState<BoardData>(
    initialData || {
      title: "Community Event Pledge Board",
      description:
        "Join us in making our community event amazing! Sign up to volunteer for tasks or bring items. Every contribution makes a difference! 🌟",
      sections: [
        {
          id: -1,
          title: "Volunteer Tasks",
          description:
            "Help make our event run smoothly by volunteering for these tasks",
          icon: "Users",
          items: [],
        },
        {
          id: -2,
          title: "Items to Bring",
          description:
            "Sign up to bring food, drinks, or other items for the event",
          icon: "Gift",
          items: [],
        },
      ],
    },
  );

  const [pendingUpdates, setPendingUpdates] = useState<
    Map<string, VolunteerUpdate>
  >(new Map());
  const [editMode, setEditMode] = useState(mode === "create");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [accessLevel, setAccessLevel] = useState<"admin" | "view" | "none">(
    mode === "create" ? "admin" : "none",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [nextTempId, setNextTempId] = useState(-1000);

  // API hooks
  const {
    data: board,
    isLoading,
    refetch,
  } = api.board.get.useQuery(
    { id: boardId! },
    { enabled: mode === "view" && !!boardId },
  );

  const { data: tokenData } = api.board.validateToken.useQuery(
    { boardId: boardId!, token: token || undefined },
    { enabled: mode === "view" && !!boardId },
  );

  // Debounced updates
  const debouncedUpdates = useDebounce(pendingUpdates, 500);

  // Mutations
  const createBoard = api.board.create.useMutation();
  const updateBoard = api.board.update.useMutation({
    onSuccess: () => void refetch(),
  });
  const updateVolunteer = api.board.updateVolunteer.useMutation();
  const updateSection = api.board.updateSection.useMutation({
    onSuccess: () => void refetch(),
  });
  const updateItem = api.board.updateItem.useMutation({
    onSuccess: () => void refetch(),
  });
  const deleteSection = api.board.deleteSection.useMutation({
    onSuccess: () => void refetch(),
  });
  const deleteItem = api.board.deleteItem.useMutation({
    onSuccess: () => void refetch(),
  });
  const reorderSections = api.board.reorderSections.useMutation({
    onSuccess: () => void refetch(),
  });
  const addItem = api.board.addItem.useMutation({
    onSuccess: (newItem) => {
      if (localBoard) {
        setLocalBoard({
          ...localBoard,
          sections: localBoard.sections.map((section) => {
            if (section.items.some((item) => item.id === newItem?.id)) {
              return {
                ...section,
                items: section.items.map((item) =>
                  item.id < 0 && item.sectionId === newItem?.sectionId
                    ? { ...newItem!, volunteers: [] }
                    : item,
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

  // Update access level from token validation
  useEffect(() => {
    if (tokenData) {
      setAccessLevel(tokenData.access);
    }
  }, [tokenData]);

  // Update local board when server data changes
  useEffect(() => {
    if (board && mode === "view") {
      setLocalBoard(board);
      // Save to board history
      addToHistory({
        id: boardId!,
        title: board.title,
        description: board.description || undefined,
        token: token || undefined,
        accessLevel,
        lastVisited: new Date().toISOString(),
      });
    }
  }, [board, boardId, token, accessLevel, addToHistory, mode]);

  // Process debounced updates
  useEffect(() => {
    if (debouncedUpdates.size > 0) {
      for (const update of debouncedUpdates.values()) {
        updateVolunteer.mutate(update);
      }
      setPendingUpdates(new Map());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUpdates]);

  const handleVolunteerNameChange = useCallback(
    (itemId: number, volunteerIndex: number, newName: string) => {
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

      // Only queue updates in view mode
      if (mode === "view" && itemId > 0) {
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
            }),
          ),
        );
      }
    },
    [localBoard, pendingUpdates, mode],
  );

  const handleVolunteerDetailsChange = useCallback(
    (itemId: number, volunteerIndex: number, newDetails: string) => {
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

      // Only queue updates in view mode
      if (mode === "view" && itemId > 0) {
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
            }),
          ),
        );
      }
    },
    [localBoard, pendingUpdates, mode],
  );

  const handleSectionUpdate = (sectionId: number, updates: any) => {
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

    // Send to server in view mode
    if (mode === "view" && sectionId > 0) {
      updateSection.mutate({
        id: sectionId,
        ...updates,
        icon: updates.icon ? getIconName(updates.icon) : undefined,
      });
    }
  };

  const handleItemUpdate = (itemId: number, updates: any) => {
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

    // Send to server in view mode
    if (mode === "view" && itemId > 0) {
      updateItem.mutate({
        id: itemId,
        ...updates,
        icon: updates.icon ? getIconName(updates.icon) : undefined,
      });
    }
  };

  const handleItemAdd = (sectionId: number) => {
    const tempId = nextTempId;
    setNextTempId(nextTempId - 1);

    const newItem = {
      id: tempId,
      sectionId,
      title: "New Item",
      description: "Add a description",
      icon: "Star" as string,
      needed: 1,
      volunteers: [],
      sortOrder: 999,
      createdAt: new Date(),
      updatedAt: null,
    };

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

    // Send to server in view mode
    if (mode === "view" && sectionId > 0) {
      addItem.mutate({
        sectionId,
        title: "New Item",
        description: "Add a description",
        icon: "Star",
        needed: 1,
      });
    }
  };

  const handleSectionMoveUp = (sectionId: number) => {
    setLocalBoard((prev) => {
      if (!prev) return prev;
      const index = prev.sections.findIndex((s) => s.id === sectionId);
      if (index <= 0) return prev;

      const newSections = [...prev.sections];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];

      // Update server if in view mode
      if (mode === "view" && boardId) {
        const sectionIds = newSections.map((s) => s.id).filter((id) => id > 0);
        reorderSections.mutate({ boardId, sectionIds });
      }

      return {
        ...prev,
        sections: newSections,
      };
    });
  };

  const handleSectionMoveDown = (sectionId: number) => {
    setLocalBoard((prev) => {
      if (!prev) return prev;
      const index = prev.sections.findIndex((s) => s.id === sectionId);
      if (index < 0 || index >= prev.sections.length - 1) return prev;

      const newSections = [...prev.sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];

      // Update server if in view mode
      if (mode === "view" && boardId) {
        const sectionIds = newSections.map((s) => s.id).filter((id) => id > 0);
        reorderSections.mutate({ boardId, sectionIds });
      }

      return {
        ...prev,
        sections: newSections,
      };
    });
  };

  const handleSectionAdd = () => {
    const tempId = nextTempId;
    setNextTempId(nextTempId - 1);

    const newSection = {
      id: tempId,
      title: "New Section",
      description: "Add a description for this section",
      icon: "Package",
      items: [],
    };

    setLocalBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: [...prev.sections, newSection],
      };
    });
  };

  const handleSectionDelete = (sectionId: number) => {
    setLocalBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
      };
    });

    // Send to server in view mode
    if (mode === "view" && sectionId > 0) {
      deleteSection.mutate({ id: sectionId });
    }
  };

  const handleItemDelete = (itemId: number) => {
    setLocalBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: section.items.filter((item) => item.id !== itemId),
        })),
      };
    });

    // Send to server in view mode
    if (mode === "view" && itemId > 0) {
      deleteItem.mutate({ id: itemId });
    }
  };

  const handleSaveBoard = async () => {
    if (!localBoard.title.trim()) {
      toast.error("Please add a board title");
      return;
    }

    if (localBoard.sections.length === 0) {
      toast.error("Please add at least one section");
      return;
    }

    setIsSaving(true);

    try {
      const boardData = {
        title: localBoard.title,
        description: localBoard.description || undefined,
        sections: localBoard.sections.map((section) => ({
          title: section.title,
          description: section.description || undefined,
          icon:
            typeof section.icon === "string"
              ? section.icon
              : getIconName(section.icon),
          items: section.items.map((item) => ({
            title: item.title,
            description: item.description || undefined,
            icon:
              typeof item.icon === "string"
                ? item.icon
                : getIconName(item.icon),
            needed: item.needed,
            volunteers: item.volunteers
              .filter((v) => v.name.trim() !== "")
              .map((v) => ({
                name: v.name,
                details: v.details || undefined,
              })),
          })),
        })),
      };

      const result = await createBoard.mutateAsync(boardData);

      toast.success("Board created successfully!");
      // Redirect with admin token (returned from create)
      router.push(`/board/${result.boardId}?token=${result.adminToken}`);
    } catch (error) {
      toast.error("Failed to create board");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Determine if we can edit
  const canEdit = mode === "create" || accessLevel === "admin";

  if (mode === "view" && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mode === "view" && !localBoard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-bold text-2xl">Board not found</h1>
          <p className="mt-2 text-muted-foreground">
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
          editable={canEdit && editMode}
          onTitleChange={(title) => {
            setLocalBoard({ ...localBoard, title });
            if (mode === "view" && boardId) {
              updateBoard.mutate({ id: boardId, title });
            }
          }}
          onDescriptionChange={(description) => {
            setLocalBoard({ ...localBoard, description });
            if (mode === "view" && boardId) {
              updateBoard.mutate({ id: boardId, description });
            }
          }}
        />

        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            {mode === "create" && (
              <Button
                onClick={handleSaveBoard}
                disabled={isSaving || localBoard.sections.length === 0}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Creating..." : "Create Board"}
              </Button>
            )}
            {mode === "view" && canEdit && (
              <>
                <Button
                  onClick={() => setShareDialogOpen(true)}
                  variant="default"
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
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
              </>
            )}
          </div>
        </div>

        {localBoard.sections.map((section, sectionIndex) => {
          const sectionIcon =
            typeof section.icon === "string"
              ? getIconByName(section.icon)
              : section.icon;

          if (!sectionIcon) return null;

          const items = section.items.map((item) => {
            const itemIcon =
              typeof item.icon === "string"
                ? getIconByName(item.icon)
                : item.icon;

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
              editable={editMode && canEdit}
              onSectionUpdate={handleSectionUpdate}
              onSectionDelete={handleSectionDelete}
              onItemUpdate={handleItemUpdate}
              onItemDelete={handleItemDelete}
              onItemAdd={handleItemAdd}
              onMoveUp={handleSectionMoveUp}
              onMoveDown={handleSectionMoveDown}
              isFirst={sectionIndex === 0}
              isLast={sectionIndex === localBoard.sections.length - 1}
            />
          );
        })}

        {editMode && canEdit && (
          <div className="flex justify-center">
            <Button
              onClick={handleSectionAdd}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Section
            </Button>
          </div>
        )}
      </div>

      {mode === "view" && canEdit && boardId && (
        <ShareDialog
          boardId={boardId}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      )}
    </div>
  );
}
