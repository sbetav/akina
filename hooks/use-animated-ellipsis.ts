import { useEffect, useState } from "react";

export function useAnimatedEllipsis(active = true, intervalMs = 400) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) {
      setFrame(0);
      return;
    }

    const id = setInterval(() => setFrame((f) => (f + 1) % 3), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  return ".".repeat(frame + 1);
}
