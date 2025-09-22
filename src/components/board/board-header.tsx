import { MarkdownText } from "@/components/ui/markdown-text";

interface BoardHeaderProps {
  board: {
    title: string;
    description?: string;
  };
  isEditable?: boolean;
}

export function BoardHeader({ board, isEditable = false }: BoardHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-bold text-3xl">
          <span
            className="underline decoration-[10px] decoration-yellow-200 dark:decoration-yellow-600"
            style={{ textDecorationSkipInk: "none" }}
          >
            {board.title}
          </span>
        </h1>
      </div>
      {board.description && (
        <div className="text-muted-foreground">
          <MarkdownText text={board.description} />
        </div>
      )}
    </div>
  );
}
