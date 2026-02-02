"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const PK_ENTRY_KEY = "pk_entry";

export function EntrySeedHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const entry = searchParams.get("entry");
    if (entry === "plak" || entry === "kitap") {
      try {
        localStorage.setItem(PK_ENTRY_KEY, entry);
      } catch {
        // ignore
      }
    }
  }, [searchParams]);

  return null;
}

export function getStoredEntry(): "plak" | "kitap" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(PK_ENTRY_KEY);
    return v === "plak" || v === "kitap" ? v : null;
  } catch {
    return null;
  }
}
