"use client";

import { useEffect } from "react";

/** Remembers which Maya page sent this visitor (from the "Get your free page" link),
 *  so sign-ups from page links can be counted (FSD success metric). */
export function RefCapture({ refHandle }: { refHandle?: string }) {
  useEffect(() => {
    if (refHandle && /^[a-z0-9-]{3,40}$/.test(refHandle)) {
      try {
        localStorage.setItem("maya_ref", refHandle);
      } catch {
        /* private mode — fine */
      }
    }
  }, [refHandle]);
  return null;
}

export function readRef(): string | null {
  try {
    return localStorage.getItem("maya_ref");
  } catch {
    return null;
  }
}
