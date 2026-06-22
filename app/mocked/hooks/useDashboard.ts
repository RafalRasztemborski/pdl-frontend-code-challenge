import { useEffect } from 'react';
import { fetchDashboard } from '../api/dashboard';
import { useAsync } from './useAsync'; // import naszego uniwersalnego helpera
import type { DashboardData } from '../types/dashboard';

type UseDashboardResult = {
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useDashboard(): UseDashboardResult {
  // Przekazujemy referencję do funkcji fetchDashboard do naszego uniwersalnego hooka
  const { data, isLoading, error, execute } =
    useAsync<DashboardData>(fetchDashboard);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    dashboard: data,
    isLoading,
    error,
    refetch: execute,
  };
}
