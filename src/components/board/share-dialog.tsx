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
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/trpc/react";
import { Check, Copy, Info, Loader2, Shield, Users } from "lucide-react";
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">
            <span
              className="-underline-offset-1 underline decoration-[8px] decoration-yellow-200 dark:decoration-yellow-600"
              style={{ textDecorationSkipInk: "none" }}
            >
              Share Board
            </span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose the right link for your audience
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-yellow-500/10 p-2">
                      <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-base">Admin Access</h3>
                      <p className="text-sm text-muted-foreground">
                        For co-organizers who need to edit
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={adminUrl}
                      readOnly
                      className="font-mono text-xs bg-background"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(adminUrl, "admin")}
                      className="shrink-0"
                    >
                      {copiedAdmin ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-base">Volunteer Access</h3>
                      <p className="text-sm text-muted-foreground">
                        For people signing up to help
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={viewUrl}
                      readOnly
                      className="font-mono text-xs bg-background"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(viewUrl, "view")}
                      className="shrink-0"
                    >
                      {copiedView ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-muted-foreground/20 bg-muted/50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Note:</strong> These links provide permanent access to your board.
                Only share them with people you trust. Admin links allow full editing capabilities.
              </AlertDescription>
            </Alert>

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