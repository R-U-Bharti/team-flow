// Simple debounce hook. Takes a value and a delay (ms), returns
// the debounced version that only updates after the user stops changing it.

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If the value changes again before the delay is up, cancel the old timer
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
