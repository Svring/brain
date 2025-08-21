import { useEffect, useRef } from "react";

/**
 * Hook that executes a function once when data becomes ready (not null or undefined)
 * @param data - The data to watch for readiness
 * @param callback - The function to execute when data is ready
 */
export const useOnceEffect = <T>(
  data: T | null | undefined,
  callback: (data: T) => void
) => {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Check if data is ready (not null or undefined) and hasn't been triggered before
    if (data != null && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      callback(data);
    }
  }, [data, callback]);
};
