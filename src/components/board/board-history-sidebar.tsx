"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useBoardHistory } from "@/hooks/use-board-history";
import { formatDistanceToNow } from "date-fns";
import { History, Shield, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BoardHistorySidebar() {
  const { getUniqueBoards, removeFromHistory, clearHistory } =
    useBoardHistory();
  const router = useRouter();
  const boards = getUniqueBoards();
  const [open, setOpen] = useState(false);

  const navigateToBoard = (id: string, token?: string) => {
    const url = token ? `/board/${id}?token=${token}` : `/board/${id}`;
    router.push(url);
    setOpen(false);
  };

  // Don't show the button if there's no history
  if (boards.length === 0) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 bottom-4 z-50 h-14 w-14 rounded-full border-2 shadow-lg transition-transform hover:scale-110"
          title="Recent Boards"
        >
          <History className="h-6 w-6" />
          {boards.length > 0 && (
            <span className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              {boards.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Recent Boards</SheetTitle>
          <SheetDescription>
            Quick access to your recently visited boards
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex items-center justify-between p-4">
          <p className="text-muted-foreground text-sm">
            {boards.length} board{boards.length !== 1 ? "s" : ""} in history
          </p>
          {boards.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>
        <ScrollArea className="mt-4 h-[calc(100vh-200px)] px-6 py-4">
          <div className="space-y-2">
            {boards.map((board) => (
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              <div
                key={`${board.id}-${board.token}`}
                className="group cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent"
                onClick={() => navigateToBoard(board.id, board.token)}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <h4 className="line-clamp-1 font-medium text-sm group-hover:text-primary">
                      {board.title}
                    </h4>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 shrink-0 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(board.id, board.token);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {board.accessLevel === "admin" ? (
                      <Badge variant="outline" className="gap-1 py-0">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    ) : board.accessLevel === "view" ? (
                      <Badge variant="outline" className="gap-1 py-0">
                        <Users className="h-3 w-3" />
                        Volunteer
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="py-0">
                        View
                      </Badge>
                    )}
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(board.lastVisited), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {board.description && (
                    <p className="line-clamp-2 text-muted-foreground text-xs">
                      {board.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
