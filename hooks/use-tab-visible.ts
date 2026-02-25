"use client";

import { useCallback, useEffect, useState } from "react";

export default function useTabVisible(): boolean {
  const [isTabVisible, setIsTabVisible] = useState(true);

  const handleVisibilityChange = useCallback(() => {
    if (typeof document === "undefined") return;
    setIsTabVisible(document.visibilityState === "visible");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return isTabVisible;
}
