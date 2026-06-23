import { fetchEmployeeFilters, fetchEmployees } from "../api/employees";
import type { Employee, EmployeeFilters } from "../types/employee";

export type EmployeeDataComposite = {
  employees: Employee[];
  filters: EmployeeFilters;
};

export const EmployeeService = {
  async getEmployeesWithFilters(): Promise<EmployeeDataComposite> {
    const [employees, filters] = await Promise.all([
      fetchEmployees(),
      fetchEmployeeFilters(),
    ]);

    return { employees, filters };
  },
};
