import { useEffect, useState } from "react";

/** Returns `true` immediately when value becomes true, but delays the transition to `false` by `delay` ms. */
function useDelayedFalse(value: boolean, delay: number) {
  const [delayedValue, setDelayedValue] = useState(value);

  useEffect(() => {
    let cancelled = false;

    if (value) {
      queueMicrotask(() => {
        if (!cancelled) setDelayedValue(true);
      });
      return () => {
        cancelled = true;
      };
    }

    const timeout = setTimeout(() => {
      if (!cancelled) setDelayedValue(false);
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return value || delayedValue;
}

export default useDelayedFalse;
