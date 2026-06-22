import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDashboard } from '../api/dashboard';
import type { DashboardData } from '../types/dashboard';

type UseDashboardResult = {
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useDashboard(): UseDashboardResult {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const refetch = useCallback(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    fetchDashboard()
      .then((data) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setDashboard(data);
      })
      .catch((caughtError: unknown) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error('Failed to fetch dashboard data'),
        );
      })
      .finally(() => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    dashboard,
    isLoading,
    error,
    refetch,
  };
}
