export interface PayslipPeriod {
    year: number;
    month: number;
    month_name: string;
    period_start: string;
    period_end: string;
}

export interface DeductionItem {
    code: string;
    name: string;
    employee_amount: number;
    employer_amount: number;
    rate: number | null;
    basis: string | null;
}

export interface AdditionItem {
    code: string;
    name: string;
    description?: string;
    amount: number;
}

export interface AllowanceItem {
    name: string;
    amount: number;
}

export interface AttendanceBreakdown {
    hadir: number;
    terlambat: number;
    cuti_dibayar: number;
    cuti_tidak_dibayar: number;
    sakit_dibayar: number;
    sakit_tidak_dibayar: number;
    libur_dibayar: number;
    libur_tidak_dibayar: number;
    absen: number;
}

export interface Payslip {
    id: number;
    period: PayslipPeriod;
    gross_amount: number;
    deduction_amount: number;
    tax_amount: number;
    net_amount: number;
    attendance_count: number;
    finalized_at: string;

    employee: {
        id: number;
        name: string;
    };

    salary: {
        base_salary: number;
        prorated_base_salary: number;
        allowances: AllowanceItem[];
        total_allowances: number;
    };

    attendance: {
        payable_days: number;
        total_working_days: number;
        breakdown: AttendanceBreakdown;
    };

    earnings: {
        salary: number;
        allowances: number;
        additions: AdditionItem[];
        total_additions: number;
    };

    deductions: DeductionItem[];

    summary: {
        gross_amount: number;
        total_deductions: number;
        net_amount: number;
    };
}

export interface PayslipListResponse {
    success: boolean;
    data: Payslip[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface PayslipDetailResponse {
    success: boolean;
    data: Payslip;
}
