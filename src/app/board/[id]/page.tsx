"use client";

import { BoardHeader } from "@/components/pledge-board/board-header";
import { PledgeSection } from "@/components/pledge-board/pledge-section";
import { api } from "@/trpc/react";
import { getIconByName } from "@/lib/available-icons";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  const { data: board, isLoading, refetch } = api.board.get.useQuery({ id: boardId });
  const updateVolunteer = api.board.updateVolunteer.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleVolunteerNameChange = async (
    itemId: number,
    volunteerIndex: number,
    newName: string
  ) => {
    await updateVolunteer.mutateAsync({
      itemId,
      volunteerIndex,
      name: newName,
      details: "",
    });
  };

  const handleVolunteerDetailsChange = async (
    itemId: number,
    volunteerIndex: number,
    newDetails: string
  ) => {
    // Get the current volunteer name from the board data
    const section = board?.sections.find((s) =>
      s.items.some((i) => i.id === itemId)
    );
    const item = section?.items.find((i) => i.id === itemId);
    const volunteer = item?.volunteers[volunteerIndex];

    await updateVolunteer.mutateAsync({
      itemId,
      volunteerIndex,
      name: volunteer?.name || "",
      details: newDetails,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!board) {
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
          title={board.title}
          description={board.description || ""}
        />

        {board.sections.map((section) => {
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
