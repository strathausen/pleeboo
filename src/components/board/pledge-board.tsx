"use client";

import { AILoading } from "@/components/board/ai-loading";
import { ShareDialog } from "@/components/board/share-dialog";
import { BoardHeader } from "@/components/pledge-board/board-header";
import { PledgeSection } from "@/components/pledge-board/pledge-section";
import { Button } from "@/components/ui/button";
import { useBoardHistory } from "@/hooks/use-board-history";
import { useDebounce } from "@/hooks/use-debounce";
import { useToken } from "@/hooks/use-token";
import type { IconName } from "@/lib/available-icons";
import { api } from "@/trpc/react";
import { Edit3, Eye, Loader2, Plus, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type VolunteerUpdate = {
  itemId: string;
  slot: number;
  name: string;
  details: string;
  quantity?: number;
};

export type BoardData = {
  id?: string;
  title: string;
  description?: string | null;
  sections: Array<{
    id: string;
    title: string;
    description?: string | null;
    icon: IconName | string; // string for backward compatibility
    items: Array<{
      id: string;
      sectionId?: string;
      title: string;
      description?: string | null;
      icon: IconName | string; // string for backward compatibility
      needed: number;
      itemType?: "slots" | "task" | "cumulative";
      unit?: string | null;
      volunteers: Array<{
        id: string;
        slot: number;
        itemId?: string;
        name: string;
        details?: string | null;
        quantity?: number | null;
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
  boardId?: string;
  token?: string;
  startInEditMode?: boolean;
  initialData?: BoardData;
  editable?: boolean;
  isExample?: boolean;
  bare?: boolean; // Removes title, example banner, and background for embedding
  isGeneratingAI?: boolean;
}

export function PledgeBoard({
  boardId,
  token: propToken,
  startInEditMode = false,
  initialData,
  editable,
  isExample = false,
  bare = false,
  isGeneratingAI = false,
}: PledgeBoardProps) {
  const { addToHistory } = useBoardHistory();
  const hookToken = useToken();
  const token = propToken || hookToken || undefined;
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);

  // State
  const [localBoard, setLocalBoard] = useState<BoardData | null>(
    initialData || null,
  );

  const [pendingUpdates, setPendingUpdates] = useState<
    Map<string, VolunteerUpdate>
  >(new Map());
  const [editMode, setEditMode] = useState(startInEditMode);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [accessLevel, setAccessLevel] = useState<"admin" | "view" | "none">(
    "none",
  );
  const [nextTempId, setNextTempId] = useState(1);

  // API hooks - only fetch if boardId is provided (not for example board)
  const {
    data: board,
    isLoading,
    refetch,
  } = api.board.get.useQuery(
    { id: boardId! },
    { enabled: !!boardId && !initialData },
  );

  const { data: tokenData } = api.board.auth.validateToken.useQuery(
    { boardId: boardId!, token: token || undefined },
    { enabled: !!boardId && !initialData },
  );

  // Debounced updates
  const debouncedUpdates = useDebounce(pendingUpdates, 500);

  // Mutations
  const updateBoard = api.board.update.useMutation({
    onSuccess: () => void refetch(),
  });
  const upsertVolunteer = api.pledge.upsertVolunteer.useMutation();
  const updateSection = api.board.sections.update.useMutation({
    onSuccess: () => void refetch(),
  });
  const updateItem = api.board.items.update.useMutation({
    onSuccess: () => void refetch(),
  });
  const deleteSection = api.board.sections.delete.useMutation({
    onSuccess: () => void refetch(),
  });
  const deleteItem = api.board.items.delete.useMutation({
    onSuccess: () => void refetch(),
  });
  const reorderSections = api.board.sections.reorder.useMutation({
    onSuccess: () => void refetch(),
  });
  const generateSuggestions = api.board.ai.generateSuggestions.useMutation({
    onSuccess: async (data) => {
      if (data.success && data.sections) {
        // toast.success(`Generated ${data.sections.length} new sections!`);
        // Refresh the board to show new sections
        await refetch();
      }
    },
    onError: (error) => {
      // toast.error(error.message || "Failed to generate suggestions");
    },
    onSettled: () => {
      setIsWaitingForAI(false);
    },
  });
  const addSection = api.board.sections.add.useMutation({
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

  const addItem = api.board.items.add.useMutation({
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
    if (board && !initialData && boardId) {
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

      // If we were waiting for AI and now have sections, stop waiting
      if (isWaitingForAI && board.sections && board.sections.length > 0) {
        setIsWaitingForAI(false);
      }
    }
  }, [
    board,
    boardId,
    token,
    accessLevel,
    addToHistory,
    initialData,
    isWaitingForAI,
  ]);

  // initially generate sections if AI generation was requested
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (
      isGeneratingAI &&
      !isWaitingForAI &&
      !generateSuggestions.isPending &&
      !generateSuggestions.isError &&
      boardId &&
      !initialData &&
      !isExample &&
      !board?.sections.length
    ) {
      setIsWaitingForAI(true);
      generateSuggestions.mutate({
        boardId,
        token,
      });
    }
  }, [
    isGeneratingAI,
    isWaitingForAI,
    generateSuggestions.isPending,
    boardId,
    initialData,
    isExample,
    board?.sections.length,
  ]);

  // Process debounced updates
  // TODO check if this is working as intended
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (debouncedUpdates.size > 0 && !isExample) {
      for (const update of debouncedUpdates.values()) {
        upsertVolunteer.mutate({ ...update, token });
      }
      setPendingUpdates(new Map());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUpdates, isExample]);

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
    (itemId: string, slot: number, newName: string) => {
      setLocalBoard((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          sections: prev.sections.map((section) => ({
            ...section,
            items: section.items.map((item) => {
              if (item.id === itemId) {
                // Find if volunteer already exists in this slot
                const existingVolIndex = item.volunteers.findIndex(
                  (v) => v.slot === slot,
                );

                const newVolunteers = [...item.volunteers];

                if (newName.trim()) {
                  // Add or update volunteer
                  const volunteer = {
                    id:
                      newVolunteers[existingVolIndex]?.id ??
                      `temp-volunteer-${Date.now()}-${slot}`,
                    itemId,
                    slot,
                    name: newName,
                    details:
                      existingVolIndex >= 0
                        ? newVolunteers[existingVolIndex]?.details
                        : "",
                    createdAt:
                      existingVolIndex >= 0
                        ? newVolunteers[existingVolIndex]?.createdAt
                        : new Date(),
                    updatedAt: new Date(),
                  };

                  if (existingVolIndex >= 0) {
                    newVolunteers[existingVolIndex] = volunteer;
                  } else {
                    newVolunteers.push(volunteer);
                  }
                } else if (existingVolIndex >= 0) {
                  // Remove volunteer if name is empty
                  newVolunteers.splice(existingVolIndex, 1);
                }

                return { ...item, volunteers: newVolunteers };
              }
              return item;
            }),
          })),
        };
      });

      // Only queue updates if not a temp item and not an example board
      if (!itemId.startsWith("temp-") && !isExample) {
        const key = `${itemId}-${slot}`;
        const existingUpdate = pendingUpdates.get(key);
        const details =
          existingUpdate?.details ||
          localBoard?.sections
            .find((s) => s.items.some((i) => i.id === itemId))
            ?.items.find((i) => i.id === itemId)
            ?.volunteers.find((v) => v.slot === slot)?.details ||
          "";

        setPendingUpdates(
          new Map(
            pendingUpdates.set(key, {
              itemId,
              slot,
              name: newName,
              details,
            }),
          ),
        );
      }
    },
    [localBoard, pendingUpdates, isExample],
  );

  const handleVolunteerDetailsChange = useCallback(
    (itemId: string, slot: number, newDetails: string) => {
      setLocalBoard((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          sections: prev.sections.map((section) => ({
            ...section,
            items: section.items.map((item) => {
              if (item.id === itemId) {
                // Find volunteer in this slot
                const volIndex = item.volunteers.findIndex(
                  (v) => v.slot === slot,
                );

                if (volIndex >= 0) {
                  const newVolunteers = [...item.volunteers];
                  if (!newVolunteers[volIndex]) return item;
                  newVolunteers[volIndex] = {
                    ...newVolunteers[volIndex],
                    details: newDetails,
                  };
                  return { ...item, volunteers: newVolunteers };
                }
              }
              return item;
            }),
          })),
        };
      });

      // Only queue updates if not a temp item and not an example board
      if (!itemId.startsWith("temp-") && !isExample) {
        const key = `${itemId}-${slot}`;
        const existingUpdate = pendingUpdates.get(key);
        const name =
          existingUpdate?.name ||
          localBoard?.sections
            .find((s) => s.items.some((i) => i.id === itemId))
            ?.items.find((i) => i.id === itemId)
            ?.volunteers.find((v) => v.slot === slot)?.name ||
          "";

        setPendingUpdates(
          new Map(
            pendingUpdates.set(key, {
              itemId,
              slot,
              name,
              details: newDetails,
            }),
          ),
        );
      }
    },
    [localBoard, pendingUpdates, isExample],
  );

  const handleVolunteerQuantityChange = useCallback(
    (itemId: string, slot: number, newQuantity: number) => {
      setLocalBoard((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          sections: prev.sections.map((section) => ({
            ...section,
            items: section.items.map((item) => {
              if (item.id === itemId) {
                // Find volunteer in this slot
                const volIndex = item.volunteers.findIndex(
                  (v) => v.slot === slot,
                );

                if (volIndex >= 0) {
                  const newVolunteers = [...item.volunteers];
                  if (!newVolunteers[volIndex]) return item;
                  newVolunteers[volIndex] = {
                    ...newVolunteers[volIndex],
                    quantity: newQuantity,
                  };
                  return { ...item, volunteers: newVolunteers };
                }
              }
              return item;
            }),
          })),
        };
      });

      // Only queue updates if not a temp item and not an example board
      if (!itemId.startsWith("temp-") && !isExample) {
        const key = `${itemId}-${slot}`;
        const existingUpdate = pendingUpdates.get(key);
        const volunteer = localBoard?.sections
          .find((s) => s.items.some((i) => i.id === itemId))
          ?.items.find((i) => i.id === itemId)
          ?.volunteers.find((v) => v.slot === slot);

        setPendingUpdates(
          new Map(
            pendingUpdates.set(key, {
              itemId,
              slot,
              name: existingUpdate?.name || volunteer?.name || "",
              details: existingUpdate?.details || volunteer?.details || "",
              quantity: newQuantity,
            }),
          ),
        );
      }
    },
    [localBoard, pendingUpdates, isExample],
  );

  const handleSectionUpdate = (
    sectionId: string,
    updates: { title?: string; description?: string; icon?: IconName },
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
          icon: updates.icon || section.icon || "Star",
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
                  icon: updates.icon || s.icon,
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
      return {
        ...prev,
        sections: prev.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              ...updates,
              icon: updates.icon || section.icon,
            };
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
        icon: updates.icon,
        token,
      });
    }
  };

  const handleItemUpdate = (
    itemId: string,
    updates: Partial<{
      title: string;
      description: string;
      icon: IconName;
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

      if (section && item && !section.id.startsWith("temp-") && boardId) {
        const icon = updates.icon || item.icon || "Star";
        // Save the new item to the database
        addItem.mutate({
          boardId,
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
                  return { ...i, ...updates, icon: updates.icon || i.icon };
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
      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, ...updates, icon: updates.icon || item.icon };
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
        icon: updates.icon,
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
      icon: "Star" as IconName,
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
  const canEdit =
    accessLevel === "admin" || (editable !== false && !!initialData);

  // Loading state - don't show loading if we have initialData (example board)
  if (isLoading && !initialData) {
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

  // Use conditional classes based on bare mode
  const containerClasses = bare ? "" : "min-h-screen bg-background p-4 md:p-8";
  const wrapperClasses = bare ? "space-y-8" : "mx-auto max-w-6xl space-y-8";

  return (
    <div className={containerClasses}>
      <div className={wrapperClasses}>
        {!bare && (
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
        )}

        {/* Example banner */}
        {isExample && !bare && (
          <div className="rounded-lg bg-yellow-50 px-4 py-3 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              👀 This is an example board to show you how it works. Your entries
              here won't be saved.{" "}
              <a
                href="/board"
                className="font-medium underline hover:no-underline"
              >
                Create your own board
              </a>
            </p>
          </div>
        )}

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
                  disabled={isWaitingForAI}
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

        {/* Show AI loading state if waiting for generation */}
        {isWaitingForAI && (
          <div className="rounded-lg border-2 border-primary/30 border-dashed bg-muted/10">
            <AILoading />
          </div>
        )}

        {/* Show sections if not waiting for AI or if sections exist */}
        {!isWaitingForAI &&
          localBoard?.sections.map((section, sectionIndex) => {
            const items = section.items.map((item) => {
              return {
                id: item.id,
                title: item.title,
                description: item.description || "",
                needed: item.needed,
                volunteers: item.volunteers.map((v) => ({
                  id: v.id,
                  slot: v.slot,
                  name: v.name,
                  details: v.details || "",
                  quantity: v.quantity,
                })),
                icon: item.icon as IconName,
                category: "items" as const,
                itemType: item.itemType,
                unit: item.unit,
              };
            });

            return (
              <PledgeSection
                key={section.id}
                sectionId={section.id}
                title={section.title}
                description={section.description || ""}
                icon={section.icon as IconName}
                items={items}
                onPledge={() => {}}
                onVolunteerNameChange={handleVolunteerNameChange}
                onVolunteerDetailsChange={handleVolunteerDetailsChange}
                onVolunteerQuantityChange={handleVolunteerQuantityChange}
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

        {editMode && canEdit && !isWaitingForAI && (
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
          token={token}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          boardTitle={localBoard?.title}
        />
      )}
    </div>
  );
}
