import { Activity } from '@/types/activity';
import api from './api';

export interface HomeData {
    today_attendance: {
        status: string;
        clock_in: string | null;
        clock_out: string | null;
        shift: string | null;
    };
    can_clock_in: boolean;
    can_clock_out: boolean;
    latest_activity: Activity[];
    latest_payslip: {
        id: number;
        period: string;
        net_amount: number;
    } | null;
    is_holiday?: boolean; // Added in recent API versions
    holiday?: { name: string };
    shift?: any; // To maintain compatibility with AttendanceStatus
    message?: string;
}

export const getHomeData = async (): Promise<HomeData> => {
    try {
        const response = await api.get<{ data: HomeData }>('/home');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching home data:', error);
        throw error;
    }
};
