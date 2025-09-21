"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBoardHistory } from "@/hooks/use-board-history";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateBoardPage() {
  const router = useRouter();
  const { addToHistory } = useBoardHistory();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");

  const createBoard = api.board.create.useMutation({
    onSuccess: (board) => {
      // Add to history
      addToHistory({
        id: board.id,
        title: title || "Community Event Pledge Board",
        accessLevel: "admin" as const,
        lastVisited: new Date().toISOString(),
      });
      // Redirect with admin token and new flag so board starts in edit mode
      router.push(`/board/${board.id}?token=${board.adminToken}&new=true`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }
    createBoard.mutate({
      title: title.trim(),
      description: description.trim(),
      prompt: prompt.trim(),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl px-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question Header */}
          <div className="text-center">
            <h1 className="font-medium text-2xl text-muted-foreground">
              <span
                className="underline decoration-[8px] decoration-yellow-200 dark:decoration-yellow-600"
                style={{ textDecorationSkipInk: "none" }}
              >
                What are you organizing?
              </span>
            </h1>
          </div>

          {/* Main Form */}
          <div className="space-y-6">
            <Input
              type="text"
              placeholder="e.g., World's Okayest Potluck"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-none border-0 border-b px-0 py-3 font-medium text-3xl placeholder:text-muted-foreground/50 focus:border-b-primary focus-visible:ring-0 focus-visible:ring-offset-0"
              maxLength={256}
              required
              autoFocus
            />

            <Textarea
              placeholder="e.g., Join us for food, fun, and games! We need volunteers and supplies to make it great. (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none rounded-none border-0 border-b px-0 py-3 placeholder:text-muted-foreground/50 focus:border-b-primary focus-visible:ring-0 focus-visible:ring-offset-0"
              maxLength={1000}
            />
          </div>

          {/* Helper Section */}
          <div className="border-t pt-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-lg">👻</span>
                <span className="text-sm">Tell us more! (optional)</span>
              </div>
              <Textarea
                placeholder="e.g., It's an outdoor party for 50 people. We'll have BBQ, lawn games, and live music from 2-8pm. Need help with setup at 1pm and cleanup after."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none border-muted/20 placeholder:text-muted-foreground/40 focus:border-primary"
                maxLength={2000}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8">
            <Button
              type="submit"
              size="lg"
              disabled={!title.trim() || createBoard.isPending}
              className="w-full"
            >
              {createBoard.isPending ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
