import api from './api';

export interface LeaveType {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_deductible: boolean;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  rejection_reason?: string;
}

export interface LeaveBalance {
  id: number;
  leave_type_id: number;
  leave_type: LeaveType;
  year: number;
  balance: number;
}

export interface CreateLeaveRequestPayload {
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
}

/**
 * Get available leave types
 */
export const getLeaveTypes = async (): Promise<LeaveType[]> => {
  const res = await api.get('/company/leave-types');
  return res.data.data;
};

/**
 * Get leave balances for current employee
 */
export const getLeaveBalances = async (year?: number): Promise<LeaveBalance[]> => {
  const res = await api.get('/leave/balances', { params: { year } });
  return res.data.balances;
};

/**
 * Get leave request history
 */
export const getLeaveHistory = async (page = 1): Promise<{ data: LeaveRequest[], last_page: number }> => {
  const res = await api.get('/leave/requests', { params: { page } });
  return {
    data: res.data.data,
    last_page: res.data.last_page
  };
};

/**
 * Submit new leave request
 */
export const createLeaveRequest = async (payload: CreateLeaveRequestPayload): Promise<LeaveRequest> => {
  const res = await api.post('/leave/requests', payload);
  return res.data.data;
};
