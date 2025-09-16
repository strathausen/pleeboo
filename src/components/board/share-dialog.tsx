"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { Check, Copy, Loader2, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ShareDialogProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ boardId, open, onOpenChange }: ShareDialogProps) {
  const [adminUrl, setAdminUrl] = useState("");
  const [viewUrl, setViewUrl] = useState("");
  const [copiedAdmin, setCopiedAdmin] = useState(false);
  const [copiedView, setCopiedView] = useState(false);

  // Get existing tokens
  const { data: tokens, isLoading } = api.board.getTokens.useQuery(
    { boardId },
    {
      enabled: open && !!boardId,
    }
  );

  // Update URLs when tokens are loaded
  useEffect(() => {
    if (tokens) {
      const baseUrl = window.location.origin;
      const boardPath = `/board/${boardId}`;
      setAdminUrl(`${baseUrl}${boardPath}?token=${tokens.adminToken}`);
      setViewUrl(`${baseUrl}${boardPath}?token=${tokens.viewToken}`);
    }
  }, [tokens, boardId]);

  const copyToClipboard = (url: string, type: "admin" | "view") => {
    navigator.clipboard.writeText(url);
    if (type === "admin") {
      setCopiedAdmin(true);
      setTimeout(() => setCopiedAdmin(false), 2000);
    } else {
      setCopiedView(true);
      setTimeout(() => setCopiedView(false), 2000);
    }
    toast.success("Link copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Board</DialogTitle>
          <DialogDescription>
            Share different links based on who you want to give access to
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4 text-yellow-500" />
                <Label>Admin Link (Full Access)</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this with co-organizers who need to edit the board
              </p>
              <div className="flex gap-2">
                <Input
                  value={adminUrl}
                  readOnly
                  className="font-mono text-xs"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(adminUrl, "admin")}
                  className="shrink-0"
                >
                  {copiedAdmin ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-primary" />
                <Label>Volunteer Link (View & Sign Up)</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this with volunteers who want to sign up for tasks
              </p>
              <div className="flex gap-2">
                <Input
                  value={viewUrl}
                  readOnly
                  className="font-mono text-xs"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(viewUrl, "view")}
                  className="shrink-0"
                >
                  {copiedView ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> These links provide permanent access to your board.
                Only share them with people you trust.
              </p>
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}