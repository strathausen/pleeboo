"use client";

import { PledgeBoard } from "@/components/board/pledge-board";
import { useParams, useSearchParams } from "next/navigation";

export default function BoardClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const boardId = params.id as string;
  const token = searchParams.get("token");

  return (
    <PledgeBoard mode="view" boardId={boardId} token={token || undefined} />
  );
}
