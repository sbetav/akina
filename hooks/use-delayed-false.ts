import { useEffect, useState } from "react";

/** Returns `true` immediately when value becomes true, but delays the transition to `false` by `delay` ms. */
function useDelayedFalse(value: boolean, delay: number) {
  const [delayedValue, setDelayedValue] = useState(value);

  useEffect(() => {
    if (value) {
      setDelayedValue(true);
    } else {
      const timeout = setTimeout(() => setDelayedValue(false), delay);
      return () => clearTimeout(timeout);
    }
  }, [value, delay]);

  return delayedValue;
}

export default useDelayedFalse;
