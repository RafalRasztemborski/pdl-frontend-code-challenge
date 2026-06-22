import { useEffect } from 'react';
import {
  EmployeeService,
  type EmployeeDataComposite,
} from '../services/employeeService';
import { useAsync } from './useAsync'; // import naszego helpera
import type { Employee, EmployeeFilters } from '../types/employee';

type UseEmployeesResult = {
  employees: Employee[];
  filters: EmployeeFilters | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useEmployees(): UseEmployeesResult {
  // Przekazujemy funkcję z serwisu do naszego uniwersalnego hooka
  const { data, isLoading, error, execute } = useAsync<EmployeeDataComposite>(
    EmployeeService.getEmployeesWithFilters,
  );

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    // Jeśli dane jeszcze nie przyszły, zwracamy pustą tablicę dla zachowania wstecznej kompatybilności tabeli/listy
    employees: data?.employees ?? [],
    filters: data?.filters ?? null,
    isLoading,
    error,
    refetch: execute,
  };
}
