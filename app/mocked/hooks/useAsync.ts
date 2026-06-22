import { useState, useRef, useCallback } from 'react';

type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  initialData: T | null = null,
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: true,
    error: null,
  });

  const requestIdRef = useRef(0);

  const execute = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await asyncFunction();

      if (requestIdRef.current !== requestId) return;

      setState({ data: result, isLoading: false, error: null });
    } catch (caughtError: unknown) {
      if (requestIdRef.current !== requestId) return;

      const error =
        caughtError instanceof Error
          ? caughtError
          : new Error('An unexpected error occurred');

      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, [asyncFunction]);

  return { ...state, execute };
}
