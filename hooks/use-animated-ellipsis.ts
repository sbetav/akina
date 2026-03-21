import { useEffect, useState } from "react";

export function useAnimatedEllipsis(active = true, intervalMs = 400) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) {
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) setFrame(0);
      });
      return () => {
        cancelled = true;
      };
    }

    const id = setInterval(() => setFrame((f) => (f + 1) % 3), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  return ".".repeat((active ? frame : 0) + 1);
}
