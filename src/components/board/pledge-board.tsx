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
  Loader2,
  type LucideIcon,
  Plus,
  Share2,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type VolunteerUpdate = {
  itemId: string;
  volunteerIndex: number;
  name: string;
  details: string;
};

export type BoardData = {
  id?: string;
  title: string;
  description?: string | null;
  sections: Array<{
    id: string;
    title: string;
    description?: string | null;
    icon: string;
    items: Array<{
      id: string;
      sectionId?: string;
      title: string;
      description?: string | null;
      icon: string;
      needed: number;
      volunteers: Array<{
        id: string;
        itemId?: string;
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
  boardId: string;
  token?: string;
  startInEditMode?: boolean;
}

export function PledgeBoard({
  boardId,
  token,
  startInEditMode = false,
}: PledgeBoardProps) {
  const router = useRouter();
  const { addToHistory } = useBoardHistory();

  // State
  const [localBoard, setLocalBoard] = useState<BoardData | null>(null);

  const [pendingUpdates, setPendingUpdates] = useState<
    Map<string, VolunteerUpdate>
  >(new Map());
  const [editMode, setEditMode] = useState(startInEditMode);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [accessLevel, setAccessLevel] = useState<"admin" | "view" | "none">(
    "none",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [nextTempId, setNextTempId] = useState(1);

  // API hooks
  const {
    data: board,
    isLoading,
    refetch,
  } = api.board.get.useQuery({ id: boardId }, { enabled: !!boardId });

  const { data: tokenData } = api.board.validateToken.useQuery(
    { boardId, token: token || undefined },
    { enabled: !!boardId },
  );

  // Debounced updates
  const debouncedUpdates = useDebounce(pendingUpdates, 500);

  // Mutations
  const createBoard = api.board.create.useMutation();
  const updateBoard = api.board.update.useMutation({
    onSuccess: () => void refetch(),
  });
  const upsertVolunteer = api.board.upsertVolunteer.useMutation();
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
  const addSection = api.board.addSection.useMutation({
    onSuccess: (newSection) => {
      if (localBoard && newSection) {
        // Replace the temporary section with the server-saved section
        setLocalBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map((section) =>
              // Replace temp section with the real one from server
              section.id.startsWith("temp-")
                ? { ...newSection, items: [] }
                : section,
            ),
          };
        });

        // Auto-add an empty item to the new section if in edit mode
        if (editMode && newSection.id) {
          handleItemAdd(newSection.id);
        }
      }
      // void refetch();
    },
  });

  const addItem = api.board.addItem.useMutation({
    onSuccess: (newItem) => {
      if (localBoard && newItem) {
        // Replace the temporary item with the server-saved item
        setLocalBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map((section) => {
              if (section.id === newItem.sectionId) {
                return {
                  ...section,
                  items: section.items.map((item) =>
                    // Replace temp item with the real one from server
                    item.id.startsWith("temp-")
                      ? { ...newItem, volunteers: [] }
                      : item,
                  ),
                };
              }
              return section;
            }),
          };
        });
      }
      void refetch();
    },
  });

  // Update access level from token validation
  useEffect(() => {
    if (tokenData) {
      setAccessLevel(tokenData.access);
      // If it's a new board and we have admin access, start in edit mode
      if (startInEditMode && tokenData.access === "admin") {
        setEditMode(true);
      }
    }
  }, [tokenData, startInEditMode]);

  // Update local board when server data changes
  useEffect(() => {
    if (board) {
      setLocalBoard(board);
      // Save to board history
      addToHistory({
        id: boardId,
        title: board.title,
        description: board.description || undefined,
        token: token || undefined,
        accessLevel,
        lastVisited: new Date().toISOString(),
      });
    }
  }, [board, boardId, token, accessLevel, addToHistory]);

  // Process debounced updates
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (debouncedUpdates.size > 0) {
      for (const update of debouncedUpdates.values()) {
        upsertVolunteer.mutate({ ...update, token });
      }
      setPendingUpdates(new Map());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUpdates]);

  // Ensure there's always an empty section when in edit mode and board is empty
  useEffect(() => {
    if (editMode && localBoard && localBoard.sections.length === 0) {
      const tempId = `temp-section-${nextTempId}`;
      setNextTempId(nextTempId + 1);

      setLocalBoard((prev) => {
        if (!prev || prev.sections.length > 0) return prev;
        return {
          ...prev,
          sections: [
            {
              id: tempId,
              title: "",
              description: "",
              icon: "Package",
              items: [],
            },
          ],
        };
      });
    }
  }, [editMode, localBoard, nextTempId]);

  const handleVolunteerNameChange = useCallback(
    (itemId: string, volunteerIndex: number, newName: string) => {
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
                    id: `temp-volunteer-${Date.now()}-${volunteerIndex}`,
                    itemId,
                    name: "",
                    details: null,
                    createdAt: new Date(),
                    updatedAt: null,
                  });
                }
                if (newVolunteers[volunteerIndex])
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

      // Only queue updates if not a temp item
      if (!itemId.startsWith("temp-")) {
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
    [localBoard, pendingUpdates],
  );

  const handleVolunteerDetailsChange = useCallback(
    (itemId: string, volunteerIndex: number, newDetails: string) => {
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
                    id: `temp-volunteer-${Date.now()}-${volunteerIndex}`,
                    itemId,
                    name: "",
                    details: null,
                    createdAt: new Date(),
                    updatedAt: null,
                  });
                }
                if (newVolunteers[volunteerIndex])
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

      // Only queue updates if not a temp item
      if (!itemId.startsWith("temp-")) {
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
    [localBoard, pendingUpdates],
  );

  const handleSectionUpdate = (
    sectionId: string,
    updates: { title?: string; description?: string; icon?: LucideIcon },
  ) => {
    // Handle new sections (temp IDs)
    if (sectionId.startsWith("temp-")) {
      const section = localBoard?.sections.find((s) => s.id === sectionId);

      if (section && boardId) {
        // Save the new section to the database
        addSection.mutate({
          boardId,
          title: updates.title || section.title,
          description: updates.description || undefined,
          icon:
            typeof section.icon === "string"
              ? section.icon
              : updates.icon
                ? getIconName(updates.icon)
                : getIconName(getIconByName("Star") || Star),
          token,
        });
        // Update local state with the new values
        setLocalBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map((s) => {
              if (s.id === sectionId) {
                return {
                  ...s,
                  title: updates.title ?? s.title,
                  description:
                    updates.description !== undefined
                      ? updates.description
                      : s.description,
                  icon: updates.icon ? getIconName(updates.icon) : s.icon,
                };
              }
              return s;
            }),
          };
        });
      }
      return;
    }

    // Update existing section
    setLocalBoard((prev) => {
      if (!prev) return prev;
      const icon =
        updates.icon && getIconName(updates.icon)
          ? getIconName(updates.icon)
          : undefined;
      return {
        ...prev,
        sections: prev.sections.map((section) => {
          if (section.id === sectionId) {
            return { ...section, ...updates, icon: icon || section.icon };
          }
          return section;
        }),
      };
    });

    // Send to server if not a temp section
    if (!sectionId.startsWith("temp-")) {
      updateSection.mutate({
        id: sectionId,
        ...updates,
        icon: updates.icon ? getIconName(updates.icon) : undefined,
        token,
      });
    }
  };

  const handleItemUpdate = (
    itemId: string,
    updates: Partial<{
      title: string;
      description: string;
      icon: LucideIcon;
      needed: number;
      isTask?: boolean;
    }>,
  ) => {
    // If this is a new item (temp ID) being saved for the first time
    if (itemId.startsWith("temp-")) {
      const section = localBoard?.sections.find((s) =>
        s.items.some((item) => item.id === itemId),
      );
      const item = section?.items.find((i) => i.id === itemId);

      if (section && item && !section.id.startsWith("temp-")) {
        const iconObj = updates.icon || item.icon;
        const icon =
          typeof iconObj === "string" ? iconObj : getIconName(iconObj);
        // Save the new item to the database
        addItem.mutate({
          sectionId: section.id,
          title: updates.title || item.title,
          description: updates.description || item.description || undefined,
          icon,
          needed: updates.needed || item.needed,
          token,
        });
        // Update local state with the new values
        setLocalBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map((s) => ({
              ...s,
              items: s.items.map((i) => {
                if (i.id === itemId) {
                  return { ...i, ...updates, icon };
                }
                return i;
              }),
            })),
          };
        });
        return;
      }
    }

    // Update local state
    setLocalBoard((prev) => {
      if (!prev) return prev;
      const icon =
        updates.icon && getIconName(updates.icon)
          ? getIconName(updates.icon)
          : undefined;
      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, ...updates, icon: icon || item.icon };
            }
            return item;
          }),
        })),
      };
    });

    // Send to server for existing items
    if (!itemId.startsWith("temp-")) {
      updateItem.mutate({
        id: itemId,
        ...updates,
        icon: updates.icon ? getIconName(updates.icon) : undefined,
        token,
      });
    }
  };

  const handleItemAdd = (sectionId: string) => {
    const tempId = `temp-item-${nextTempId}`;
    setNextTempId(nextTempId + 1);

    const newItem = {
      id: tempId,
      sectionId,
      title: "",
      description: "",
      icon: "Star" as string,
      needed: 1,
      volunteers: [],
      sortOrder: 999,
      createdAt: new Date(),
      updatedAt: null,
      isNew: true, // Mark as new so it stays in edit mode
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

    // Don't save to server immediately - wait for user to save
  };

  const handleSectionMoveUp = (sectionId: string) => {
    setLocalBoard((prev) => {
      if (!prev) return prev;
      const index = prev.sections.findIndex((s) => s.id === sectionId);
      if (index <= 0) return prev;

      const newSections = [...prev.sections];
      if (newSections[index - 1] && newSections[index]) {
        const temp = newSections[index];
        const prev = newSections[index - 1];
        if (temp && prev) {
          newSections[index] = prev;
          newSections[index - 1] = temp;
        }
      }

      // Update server if we have a boardId
      if (boardId) {
        const sectionIds = newSections
          .map((s) => s.id)
          .filter((id) => !id.startsWith("temp-"));
        reorderSections.mutate({ boardId, sectionIds, token });
      }

      return {
        ...prev,
        sections: newSections,
      };
    });
  };

  const handleSectionMoveDown = (sectionId: string) => {
    setLocalBoard((prev) => {
      if (!prev) return prev;
      const index = prev.sections.findIndex((s) => s.id === sectionId);
      if (index < 0 || index >= prev.sections.length - 1) return prev;

      const newSections = [...prev.sections];
      if (newSections[index + 1] && newSections[index]) {
        const temp = newSections[index];
        const next = newSections[index + 1];
        if (temp && next) {
          newSections[index] = next;
          newSections[index + 1] = temp;
        }
      }

      // Update server if we have a boardId
      if (boardId) {
        const sectionIds = newSections
          .map((s) => s.id)
          .filter((id) => !id.startsWith("temp-"));
        reorderSections.mutate({ boardId, sectionIds, token });
      }

      return {
        ...prev,
        sections: newSections,
      };
    });
  };

  const handleSectionAdd = () => {
    const tempId = `temp-section-${nextTempId}`;
    setNextTempId(nextTempId + 1);

    const newSection: BoardData["sections"][number] = {
      id: tempId,
      title: "",
      description: "",
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

  const handleSectionDelete = (sectionId: string) => {
    setLocalBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
      };
    });

    // Send to server if not a temp section
    if (!sectionId.startsWith("temp-")) {
      deleteSection.mutate({ id: sectionId, token });
    }
  };

  const handleItemDelete = (itemId: string) => {
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

    // Send to server if not a temp item
    if (!itemId.startsWith("temp-")) {
      deleteItem.mutate({ id: itemId, token });
    }
  };

  // Determine if we can edit
  const canEdit = accessLevel === "admin";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!localBoard) {
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
          title={localBoard?.title || ""}
          description={localBoard?.description || ""}
          editable={canEdit && editMode}
          onTitleChange={(title) => {
            if (localBoard) {
              setLocalBoard({ ...localBoard, title });
              if (boardId) {
                updateBoard.mutate({ id: boardId, title, token });
              }
            }
          }}
          onDescriptionChange={(description) => {
            if (localBoard) {
              setLocalBoard({ ...localBoard, description });
              if (boardId) {
                updateBoard.mutate({ id: boardId, description, token });
              }
            }
          }}
        />

        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            {canEdit && (
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

        {localBoard?.sections.map((section, sectionIndex) => {
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
                id: v.id,
                name: v.name,
                details: v.details || "",
              })),
              icon: itemIcon || getIconByName("Star") || Star,
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
              isLast={sectionIndex === (localBoard?.sections.length || 0) - 1}
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

      {canEdit && boardId && (
        <ShareDialog
          boardId={boardId}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      )}
    </div>
  );
}
