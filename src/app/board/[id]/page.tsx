import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import BoardClient from "./board-client";

export default function BoardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <BoardClient />
    </Suspense>
  );
}
