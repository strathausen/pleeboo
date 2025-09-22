"use client";

import { useCallback, useEffect, useState } from "react";

export interface BoardHistoryItem {
  id: string;
  title: string;
  description?: string;
  token?: string;
  accessLevel: "admin" | "view" | "none";
  lastVisited: string;
}

const STORAGE_KEY = "pleeboo-board-history";
const MAX_HISTORY_ITEMS = 20;

export function useBoardHistory() {
  const [history, setHistory] = useState<BoardHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BoardHistoryItem[];
        setHistory(parsed);
      } catch (e) {
        console.error("Failed to parse board history:", e);
      }
    }
  }, []);

  // Save a board visit to history
  const addToHistory = useCallback((item: BoardHistoryItem) => {
    setHistory((current) => {
      // Remove any existing entry for this board/token combo
      const filtered = current.filter(
        (h) => !(h.id === item.id && h.token === item.token),
      );

      // Add new item at the beginning
      const updated = [item, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  }, []);

  // Remove a board from history
  const removeFromHistory = useCallback((id: string, token?: string) => {
    setHistory((current) => {
      const filtered = current.filter(
        (h) => !(h.id === id && h.token === token),
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  // Get unique boards (group by board ID, keep highest access level)
  const getUniqueBoards = useCallback(() => {
    const boardMap = new Map<string, BoardHistoryItem>();

    for (const item of history) {
      const existing = boardMap.get(item.id);
      if (
        !existing ||
        (item.accessLevel === "admin" && existing.accessLevel !== "admin") ||
        new Date(item.lastVisited) > new Date(existing.lastVisited)
      ) {
        boardMap.set(item.id, item);
      }
    }

    return Array.from(boardMap.values()).sort(
      (a, b) =>
        new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime(),
    );
  }, [history]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getUniqueBoards,
  };
}
