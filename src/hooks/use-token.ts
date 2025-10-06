"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TokenReader() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  return token;
}

export function useToken() {
  try {
    return TokenReader();
  } catch {
    // Return null during SSR or when not wrapped in Suspense
    return null;
  }
}
