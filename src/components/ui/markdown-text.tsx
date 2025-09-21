"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface MarkdownTextProps {
  text: string;
  className?: string;
}

export function MarkdownText({ text, className }: MarkdownTextProps) {
  const html = useMemo(() => {
    let processed = text;

    // Escape HTML
    processed = processed
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers (support h1-h3)
    processed = processed.replace(
      /^### (.+)$/gm,
      '<h3 class="font-semibold text-sm mt-2 mb-1">$1</h3>',
    );
    processed = processed.replace(
      /^## (.+)$/gm,
      '<h2 class="font-semibold text-base mt-3 mb-1">$1</h2>',
    );
    processed = processed.replace(
      /^# (.+)$/gm,
      '<h1 class="font-bold text-lg mt-3 mb-2">$1</h1>',
    );

    // Bold (must come before italic to handle ***text***)
    processed = processed.replace(
      /\*\*\*(.+?)\*\*\*/g,
      "<strong><em>$1</em></strong>",
    );
    processed = processed.replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-semibold">$1</strong>',
    );
    processed = processed.replace(
      /__(.+?)__/g,
      '<strong class="font-semibold">$1</strong>',
    );

    // Italic
    processed = processed.replace(/\*(.+?)\*/g, "<em>$1</em>");
    processed = processed.replace(/_(.+?)_/g, "<em>$1</em>");

    // Links
    processed = processed.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>',
    );

    // Unordered lists
    processed = processed.replace(
      /^- (.+)$/gm,
      '<li class="ml-4 list-disc">$1</li>',
    );
    processed = processed.replace(
      /^\* (.+)$/gm,
      '<li class="ml-4 list-disc">$1</li>',
    );

    // Ordered lists
    processed = processed.replace(
      /^\d+\. (.+)$/gm,
      '<li class="ml-4 list-decimal">$1</li>',
    );

    // Wrap consecutive li elements in ul/ol
    processed = processed.replace(
      /((?:<li class="ml-4 list-disc">.*<\/li>\s*)+)/g,
      '<ul class="my-2">$1</ul>',
    );
    processed = processed.replace(
      /((?:<li class="ml-4 list-decimal">.*<\/li>\s*)+)/g,
      '<ol class="my-2">$1</ol>',
    );

    // Line breaks - convert single newlines to <br> (but not within lists)
    processed = processed
      .split("\n")
      .map((line, i, arr) => {
        // Don't add br tags after list items or headers
        if (
          i < arr.length - 1 &&
          !line.includes("</li>") &&
          !line.includes("</h1>") &&
          !line.includes("</h2>") &&
          !line.includes("</h3>") &&
          !line.includes("<ul") &&
          !line.includes("</ul>") &&
          !line.includes("<ol") &&
          !line.includes("</ol>") &&
          line.trim() !== ""
        ) {
          return `${line}<br/>`;
        }
        return line;
      })
      .join("\n");

    // Paragraphs - wrap non-HTML content
    const lines = processed.split("\n");
    processed = lines
      .map((line) => {
        const trimmed = line.trim();
        // If line doesn't start with HTML tag and isn't empty, wrap in p
        if (trimmed && !trimmed.startsWith("<")) {
          return `<p>${line}</p>`;
        }
        return line;
      })
      .join("\n");

    return processed;
  }, [text]);

  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
