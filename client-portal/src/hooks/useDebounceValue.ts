import { useEffect, useState } from 'react';

// ? see https://usehooks.com/useDebounce/
export const useDebounceValue = <TValue>(value: TValue, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<TValue>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const debounceFunction = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let nodeTimeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (nodeTimeout) {
      clearTimeout(nodeTimeout);
    }
    nodeTimeout = setTimeout(() => func(...args), delay);
  };
};
