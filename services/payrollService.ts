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

export const getPayslipSignedUrl = async (id: number): Promise<string | null> => {
    try {
        const response = await api.get<{ success: boolean; data: { download_url: string } }>(`/payslips/${id}/download-url`);
        return response.data.data.download_url;
    } catch (error) {
        console.error(`Error fetching signed URL for payslip ${id}:`, error);
        return null;
    }
};
