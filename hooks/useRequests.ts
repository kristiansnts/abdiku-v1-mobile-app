import { THEME } from '@/constants/theme';
import { TranslationKeys } from '@/constants/translations';
import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/context/ToastContext';
import * as attendanceService from '@/services/attendanceService';
import * as requestService from '@/services/requestService';
import { Attendance, CorrectionRequest, CreateCorrectionRequest, RequestType } from '@/types/attendance';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { Platform } from 'react-native';

// ============ Types ============
export type FormStep = 'type' | 'form';
export type PickerType = 'date' | 'clockIn' | 'clockOut' | null;

export interface FormState {
  step: FormStep;
  requestType: RequestType | null;
  selectedAttendance: Attendance | null;
  selectedDate: Date;
  clockInTime: Date;
  clockOutTime: Date;
  reason: string;
  submitting: boolean;
  activePicker: PickerType;
}

type FormAction =
  | { type: 'SET_STEP'; payload: FormStep }
  | { type: 'SET_REQUEST_TYPE'; payload: RequestType }
  | { type: 'SET_ATTENDANCE'; payload: Attendance }
  | { type: 'SET_DATE'; payload: Date }
  | { type: 'SET_CLOCK_IN'; payload: Date }
  | { type: 'SET_CLOCK_OUT'; payload: Date }
  | { type: 'SET_REASON'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_PICKER'; payload: PickerType }
  | { type: 'RESET' };

// ============ Reducer ============
const initialFormState: FormState = {
  step: 'type',
  requestType: null,
  selectedAttendance: null,
  selectedDate: new Date(),
  clockInTime: new Date(),
  clockOutTime: new Date(),
  reason: '',
  submitting: false,
  activePicker: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_REQUEST_TYPE':
      return { ...state, requestType: action.payload, step: 'form' };
    case 'SET_ATTENDANCE':
      return { ...state, selectedAttendance: action.payload };
    case 'SET_DATE':
      return {
        ...state,
        selectedDate: action.payload,
        activePicker: Platform.OS === 'ios' ? state.activePicker : null
      };
    case 'SET_CLOCK_IN':
      return {
        ...state,
        clockInTime: action.payload,
        activePicker: Platform.OS === 'ios' ? state.activePicker : null
      };
    case 'SET_CLOCK_OUT':
      return {
        ...state,
        clockOutTime: action.payload,
        activePicker: Platform.OS === 'ios' ? state.activePicker : null
      };
    case 'SET_REASON':
      return { ...state, reason: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
    case 'SET_PICKER':
      return { ...state, activePicker: action.payload };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
}

// ============ Hook ============
interface UseRequestsOptions {
  enabled?: boolean;
}

interface UseRequestsReturn {
  // List state
  requests: CorrectionRequest[];
  attendanceList: Attendance[];
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;

  // Modal state
  showModal: boolean;
  setShowModal: (show: boolean) => void;

  // Form state and actions
  form: FormState;
  dispatch: React.Dispatch<FormAction>;

  // Actions
  openCreateModal: () => void;
  handleSubmit: (t: TranslationKeys) => Promise<boolean>;
  handleDelete: (id: number, t: TranslationKeys) => void;
}

export const useRequests = (options: UseRequestsOptions = {}): UseRequestsReturn => {
  const { enabled = true } = options;
  const { showToast } = useToast();
  const { showDialog } = useDialog();

  // List state
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, dispatch] = useReducer(formReducer, initialFormState);

  // ============ Fetch Functions ============
  const fetchRequests = useCallback(async () => {
    try {
      const data = await requestService.getRequests({ per_page: 50 });
      setRequests(data);
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      const data = await attendanceService.getAttendanceHistory({ per_page: 30 });
      setAttendanceList(data);
    } catch (err) {
      console.error('Fetch attendance error:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, [fetchRequests]);

  useEffect(() => {
    if (enabled) {
      fetchRequests();
      fetchAttendanceHistory();
    }
  }, [enabled, fetchRequests, fetchAttendanceHistory]);

  // ============ Actions ============
  const openCreateModal = useCallback(() => {
    dispatch({ type: 'RESET' });
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(async (t: TranslationKeys): Promise<boolean> => {
    if (!form.requestType || !form.reason.trim()) {
      showToast('Please fill all required fields', 'info');
      return false;
    }

    if ((form.requestType === 'LATE' || form.requestType === 'CORRECTION') && !form.selectedAttendance) {
      showToast(t.requests.selectAttendance, 'info');
      return false;
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const payload: CreateCorrectionRequest = {
        request_type: form.requestType,
        reason: form.reason.trim(),
      };

      if (form.requestType === 'LATE') {
        payload.attendance_raw_id = form.selectedAttendance!.id;
        payload.requested_clock_in_at = form.clockInTime.toISOString();
      } else if (form.requestType === 'CORRECTION') {
        payload.attendance_raw_id = form.selectedAttendance!.id;
        payload.requested_clock_in_at = form.clockInTime.toISOString();
        payload.requested_clock_out_at = form.clockOutTime.toISOString();
      } else if (form.requestType === 'MISSING') {
        payload.date = form.selectedDate.toISOString().split('T')[0];

        // Combine selected date with clock-in time
        const clockInDateTime = new Date(form.selectedDate);
        clockInDateTime.setHours(form.clockInTime.getHours());
        clockInDateTime.setMinutes(form.clockInTime.getMinutes());
        clockInDateTime.setSeconds(0);
        clockInDateTime.setMilliseconds(0);
        payload.requested_clock_in_at = clockInDateTime.toISOString();

        // Combine selected date with clock-out time
        const clockOutDateTime = new Date(form.selectedDate);
        clockOutDateTime.setHours(form.clockOutTime.getHours());
        clockOutDateTime.setMinutes(form.clockOutTime.getMinutes());
        clockOutDateTime.setSeconds(0);
        clockOutDateTime.setMilliseconds(0);
        payload.requested_clock_out_at = clockOutDateTime.toISOString();
      }

      console.log('Sending request payload:', JSON.stringify(payload, null, 2));
      const response = await requestService.createRequest(payload);
      console.log('Request creation response:', JSON.stringify(response, null, 2));
      setShowModal(false);
      showToast(t.common.success, 'success');
      fetchRequests();
      return true;
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || t.errors.operationFailed, 'error');
      return false;
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [form, fetchRequests, showToast]);

  const handleDelete = useCallback((id: number, t: TranslationKeys) => {
    showDialog({
      title: t.requests.deleteConfirm,
      message: '',
      icon: 'trash-outline',
      iconColor: THEME.danger,
      actions: [
        {
          text: t.common.confirm,
          style: 'destructive',
          onPress: async () => {
            try {
              await requestService.deleteRequest(id);
              showToast(t.requests.deleteSuccess, 'success');
              fetchRequests();
            } catch (err: any) {
              showToast(err.response?.data?.error?.message || t.errors.operationFailed, 'error');
            }
          },
        },
        { text: t.common.cancel, style: 'cancel', onPress: () => { } },
      ]
    });
  }, [fetchRequests, showDialog, showToast]);

  return {
    requests,
    attendanceList,
    loading,
    refreshing,
    refresh,
    showModal,
    setShowModal,
    form,
    dispatch,
    openCreateModal,
    handleSubmit,
    handleDelete,
  };
};
