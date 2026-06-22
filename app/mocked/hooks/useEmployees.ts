import { useCallback, useEffect, useRef, useState } from 'react';
import { EmployeeService } from '../services/employeeService';
import type { Employee, EmployeeFilters } from '../types/employee';

type UseEmployeesResult = {
  employees: Employee[];
  filters: EmployeeFilters | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useEmployees(): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filters, setFilters] = useState<EmployeeFilters | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    try {
      // Wywołanie zewnętrznego serwisu
      const { employees, filters } =
        await EmployeeService.getEmployeesWithFilters();

      if (requestIdRef.current !== requestId) return;

      setEmployees(employees);
      setFilters(filters);
    } catch (caughtError: unknown) {
      if (requestIdRef.current !== requestId) return;

      setError(
        caughtError instanceof Error
          ? caughtError
          : new Error('Failed to fetch employees data'),
      );
    } finally {
      if (requestIdRef.current !== requestId) return;

      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { employees, filters, isLoading, error, refetch };
}
