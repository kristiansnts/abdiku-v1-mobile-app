import api from './api';

export interface Employee {
  id: number;
  name: string;
  join_date: string;
  status: string;
  company: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  position?: {
    id: number;
    name: string;
  };
}

export interface SalaryInfo {
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  currency: string;
}

/**
 * Get employee detail
 */
export const getEmployeeDetail = async (): Promise<Employee> => {
  const res = await api.get('/employee/detail');
  return res.data.data;
};

/**
 * Get employee salary information
 */
export const getEmployeeSalary = async (): Promise<SalaryInfo> => {
  const res = await api.get('/employee/salary');
  return res.data.data;
};
