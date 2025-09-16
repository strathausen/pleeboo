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

  const generateTokens = api.board.generateTokens.useMutation({
    onSuccess: (data) => {
      const baseUrl = window.location.origin;
      const boardPath = `/board/${boardId}`;
      setAdminUrl(`${baseUrl}${boardPath}?token=${data.adminToken}`);
      setViewUrl(`${baseUrl}${boardPath}?token=${data.viewToken}`);
    },
    onError: () => {
      toast.error("Failed to generate share links");
    },
  });

  useEffect(() => {
    if (open && !adminUrl && !viewUrl) {
      generateTokens.mutate({ boardId });
    }
  }, [open, boardId]);

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
        {generateTokens.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Shield className="h-4 w-4 text-yellow-500" />
                <Label>Admin Link (Full Access)</Label>
              </div>
              <p className="text-muted-foreground text-sm">
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
              <div className="flex items-center gap-2 font-medium text-sm">
                <Users className="h-4 w-4 text-primary" />
                <Label>Volunteer Link (View & Sign Up)</Label>
              </div>
              <p className="text-muted-foreground text-sm">
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
              <p className="text-muted-foreground text-xs">
                <strong>Note:</strong> These links provide direct access to your
                board. Only share them with people you trust. You can generate
                new links at any time, which will invalidate the old ones.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateTokens.mutate({ boardId })}
              >
                Regenerate Links
              </Button>
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
