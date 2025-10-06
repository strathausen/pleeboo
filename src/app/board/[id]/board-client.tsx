"use client";

import { PledgeBoard } from "@/components/board/pledge-board";
import { useParams, useSearchParams } from "next/navigation";

export default function BoardClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = params.id as string;

  // Extract actual board ID from slug format (title--id or just id)
  const boardId = rawId.includes("--")
    ? rawId.substring(rawId.lastIndexOf("--") + 2)
    : rawId;

  const token = searchParams.get("token");
  const isNew = searchParams.get("new") === "true";
  const isGenerating = searchParams.get("generating") === "true";

  return (
    <PledgeBoard
      boardId={boardId}
      token={token || undefined}
      startInEditMode={isNew}
      isGeneratingAI={isGenerating}
    />
  );
}
