import api from './api';
import { CorrectionRequest, CreateCorrectionRequest } from '@/types/attendance';

export interface RequestListParams {
  per_page?: number;
  page?: number;
}

/**
 * Get list of correction requests
 */
export const getRequests = async (
  params: RequestListParams = { per_page: 50 }
): Promise<CorrectionRequest[]> => {
  const res = await api.get('/attendance/requests', { params });
  return res.data.data;
};

/**
 * Create a new correction request
 */
export const createRequest = async (
  payload: CreateCorrectionRequest
): Promise<CorrectionRequest> => {
  const res = await api.post('/attendance/requests', payload);
  return res.data.data;
};

/**
 * Delete a correction request (only pending requests can be deleted)
 */
export const deleteRequest = async (id: number): Promise<void> => {
  await api.delete(`/attendance/requests/${id}`);
};

/**
 * Get a single request by ID
 */
export const getRequestById = async (id: number): Promise<CorrectionRequest> => {
  const res = await api.get(`/attendance/requests/${id}`);
  return res.data.data;
};
