import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(initial: number = 0) {
  const [timeLeft, setTimeLeft] = useState(initial);
  const deadlineRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (seconds <= 0) {
      deadlineRef.current = null;
      setTimeLeft(0);
      return;
    }
    deadlineRef.current = Date.now() + seconds * 1000;
    setTimeLeft(seconds);

    intervalRef.current = setInterval(() => {
      const remaining = Math.round(
        ((deadlineRef.current ?? 0) - Date.now()) / 1000,
      );
      if (remaining <= 0) {
        clearInterval(intervalRef.current ?? 0);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 500);
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) start(initial);
    });
    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [initial, start]);

  return { timeLeft, reset: start };
}
