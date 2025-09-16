"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBoardHistory } from "@/hooks/use-board-history";
import { formatDistanceToNow } from "date-fns";
import { Clock, ExternalLink, Shield, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export function BoardHistory() {
  const { getUniqueBoards, removeFromHistory, clearHistory } =
    useBoardHistory();
  const router = useRouter();
  const boards = getUniqueBoards();

  const navigateToBoard = (id: string, token?: string) => {
    const url = token ? `/board/${id}?token=${token}` : `/board/${id}`;
    router.push(url);
  };

  if (boards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Boards
          </CardTitle>
          <CardDescription>
            Your recently visited boards will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No boards visited yet. Create or visit a board to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Boards
            </CardTitle>
            <CardDescription>
              Quick access to your recently visited boards
            </CardDescription>
          </div>
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
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 p-4">
            {boards.map((board) => (
              <div
                key={`${board.id}-${board.token}`}
                className="group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                onClick={() => navigateToBoard(board.id, board.token)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm group-hover:text-primary">
                      {board.title}
                    </h4>
                    {board.accessLevel === "admin" ? (
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    ) : board.accessLevel === "view" ? (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        Volunteer
                      </Badge>
                    ) : null}
                  </div>
                  {board.description && (
                    <p className="line-clamp-2 text-muted-foreground text-xs">
                      {board.description}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Visited{" "}
                    {formatDistanceToNow(new Date(board.lastVisited), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToBoard(board.id, board.token);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(board.id, board.token);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
