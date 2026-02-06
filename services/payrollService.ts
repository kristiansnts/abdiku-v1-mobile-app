import { Payslip, PayslipDetailResponse, PayslipListResponse } from '@/types/payroll';
import api from './api';

export const getPayslips = async (page: number = 1): Promise<Payslip[]> => {
    try {
        const response = await api.get<PayslipListResponse>(`/payslips?page=${page}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching payslips:', error);
        return [];
    }
};

export const getPayslipDetail = async (id: number): Promise<Payslip | null> => {
    try {
        const response = await api.get<PayslipDetailResponse>(`/payslips/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching payslip detail for ID ${id}:`, error);
        return null;
    }
};
export const getPayslipDownloadUrl = (id: number): string => {
    return `${api.defaults.baseURL}/payslips/${id}/download`;
};
