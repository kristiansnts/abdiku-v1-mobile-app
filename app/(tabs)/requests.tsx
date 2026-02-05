import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import api from '@/services/api';
import { Attendance, CorrectionRequest, CreateCorrectionRequest, RequestType } from '@/types/attendance';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// ============ Types ============
type FormStep = 'type' | 'form';
type PickerType = 'date' | 'clockIn' | 'clockOut' | null;

interface FormState {
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
      return { ...state, selectedDate: action.payload, activePicker: Platform.OS === 'ios' ? state.activePicker : null };
    case 'SET_CLOCK_IN':
      return { ...state, clockInTime: action.payload, activePicker: Platform.OS === 'ios' ? state.activePicker : null };
    case 'SET_CLOCK_OUT':
      return { ...state, clockOutTime: action.payload, activePicker: Platform.OS === 'ios' ? state.activePicker : null };
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

// ============ Component ============
export default function RequestsScreen() {
  const { user } = useAuth();
  const { t, locale } = useLocalization();

  // List state
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Form state (grouped with useReducer)
  const [form, dispatch] = useReducer(formReducer, initialFormState);

  // ============ API Calls ============
  const fetchRequests = async () => {
    try {
      const res = await api.get('/attendance/requests?per_page=50');
      setRequests(res.data.data);
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const res = await api.get('/attendance/history?per_page=30');
      setAttendanceList(res.data.data);
    } catch (err) {
      console.error('Fetch attendance error:', err);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (user?.employee) {
      fetchRequests();
      fetchAttendanceHistory();
    }
  }, [user?.employee]);

  // ============ Formatters ============
  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const localeCode = locale === 'id' ? 'id-ID' : 'en-GB';
    return date.toLocaleDateString(localeCode, { day: '2-digit', month: 'short', year: 'numeric' });
  }, [locale]);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString(locale === 'id' ? 'id-ID' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  }, [locale]);

  const formatDateTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const localeCode = locale === 'id' ? 'id-ID' : 'en-GB';
    return date.toLocaleDateString(localeCode, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [locale]);

  // ============ Helpers ============
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return THEME.success;
      case 'REJECTED': return THEME.danger;
      default: return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return t.status.approved;
      case 'REJECTED': return t.status.rejected;
      default: return t.status.pending;
    }
  };

  const getRequestTypeText = (type: RequestType) => {
    switch (type) {
      case 'LATE': return t.requests.lateRequest;
      case 'CORRECTION': return t.requests.correctionRequest;
      case 'MISSING': return t.requests.missingRequest;
    }
  };

  // ============ Actions ============
  const openCreateModal = () => {
    dispatch({ type: 'RESET' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.requestType || !form.reason.trim()) {
      Alert.alert(t.common.error, 'Please fill all required fields');
      return;
    }

    if ((form.requestType === 'LATE' || form.requestType === 'CORRECTION') && !form.selectedAttendance) {
      Alert.alert(t.common.error, t.requests.selectAttendance);
      return;
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
        payload.requested_clock_in_at = form.clockInTime.toISOString();
        payload.requested_clock_out_at = form.clockOutTime.toISOString();
      }

      await api.post('/attendance/requests', payload);
      setShowModal(false);
      Alert.alert(t.common.success, t.common.success);
      fetchRequests();
    } catch (err: any) {
      Alert.alert(t.common.error, err.response?.data?.error?.message || t.errors.operationFailed);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(t.requests.deleteConfirm, '', [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.confirm,
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/attendance/requests/${id}`);
            Alert.alert(t.common.success, t.requests.deleteSuccess);
            fetchRequests();
          } catch (err: any) {
            Alert.alert(t.common.error, err.response?.data?.error?.message || t.errors.operationFailed);
          }
        },
      },
    ]);
  };

  // ============ Render Helpers ============
  const renderRequestItem = ({ item, index }: { item: CorrectionRequest; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={[styles.requestCard, GLOBAL_STYLES.card]}>
      <View style={styles.requestHeader}>
        <View style={styles.requestTypeContainer}>
          <View style={[styles.requestTypeBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.requestTypeText, { color: getStatusColor(item.status) }]}>
              {getRequestTypeText(item.request_type)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        {item.status === 'PENDING' && (
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color={THEME.danger} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.requestReason} numberOfLines={2}>{item.reason}</Text>

      <View style={styles.requestDetails}>
        {item.requested_clock_in_at && (
          <View style={styles.requestDetailRow}>
            <Ionicons name="enter-outline" size={16} color={THEME.success} />
            <Text style={styles.requestDetailText}>{formatDateTime(item.requested_clock_in_at)}</Text>
          </View>
        )}
        {item.requested_clock_out_at && (
          <View style={styles.requestDetailRow}>
            <Ionicons name="exit-outline" size={16} color={THEME.danger} />
            <Text style={styles.requestDetailText}>{formatDateTime(item.requested_clock_out_at)}</Text>
          </View>
        )}
      </View>

      <View style={styles.requestFooter}>
        <Text style={styles.requestDate}>{t.requests.createdAt}: {formatDate(item.created_at)}</Text>
      </View>

      {item.reviewer_notes && (
        <View style={styles.reviewerNotes}>
          <Text style={styles.reviewerNotesLabel}>{t.requests.reviewerNotes}:</Text>
          <Text style={styles.reviewerNotesText}>{item.reviewer_notes}</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderTypeSelection = () => (
    <View style={styles.typeSelectionContainer}>
      <Text style={styles.modalTitle}>{t.requests.selectType}</Text>

      <TouchableOpacity style={styles.typeCard} onPress={() => dispatch({ type: 'SET_REQUEST_TYPE', payload: 'LATE' })}>
        <View style={[styles.typeIcon, { backgroundColor: '#fef3c7' }]}>
          <Ionicons name="time-outline" size={28} color="#f59e0b" />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>{t.requests.lateRequest}</Text>
          <Text style={styles.typeDesc}>{t.requests.lateDesc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.typeCard} onPress={() => dispatch({ type: 'SET_REQUEST_TYPE', payload: 'CORRECTION' })}>
        <View style={[styles.typeIcon, { backgroundColor: '#dbeafe' }]}>
          <Ionicons name="create-outline" size={28} color={THEME.primary} />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>{t.requests.correctionRequest}</Text>
          <Text style={styles.typeDesc}>{t.requests.correctionDesc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.typeCard} onPress={() => dispatch({ type: 'SET_REQUEST_TYPE', payload: 'MISSING' })}>
        <View style={[styles.typeIcon, { backgroundColor: '#fce7f3' }]}>
          <Ionicons name="calendar-outline" size={28} color="#ec4899" />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>{t.requests.missingRequest}</Text>
          <Text style={styles.typeDesc}>{t.requests.missingDesc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
      </TouchableOpacity>
    </View>
  );

  const renderForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => dispatch({ type: 'SET_STEP', payload: 'type' })}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.formTitle}>{getRequestTypeText(form.requestType!)}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Attendance Selection (for LATE and CORRECTION) */}
      {(form.requestType === 'LATE' || form.requestType === 'CORRECTION') && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t.requests.selectAttendance}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attendanceList}>
            {attendanceList.map((att) => (
              <TouchableOpacity
                key={att.id}
                style={[
                  styles.attendanceChip,
                  form.selectedAttendance?.id === att.id && styles.attendanceChipActive,
                ]}
                onPress={() => dispatch({ type: 'SET_ATTENDANCE', payload: att })}
              >
                <Text style={[
                  styles.attendanceChipText,
                  form.selectedAttendance?.id === att.id && styles.attendanceChipTextActive,
                ]}>
                  {formatDate(att.date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Date Selection (for MISSING) */}
      {form.requestType === 'MISSING' && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t.requests.selectDate}</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => dispatch({ type: 'SET_PICKER', payload: 'date' })}>
            <Ionicons name="calendar-outline" size={20} color={THEME.primary} />
            <Text style={styles.dateInputText}>{formatDate(form.selectedDate.toISOString())}</Text>
          </TouchableOpacity>
          {form.activePicker === 'date' && (
            <DateTimePicker
              value={form.selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => date && dispatch({ type: 'SET_DATE', payload: date })}
              maximumDate={new Date()}
            />
          )}
        </View>
      )}

      {/* Clock In Time */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{t.requests.clockInTime}</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => dispatch({ type: 'SET_PICKER', payload: 'clockIn' })}>
          <Ionicons name="time-outline" size={20} color={THEME.success} />
          <Text style={styles.dateInputText}>{formatTime(form.clockInTime)}</Text>
        </TouchableOpacity>
        {form.activePicker === 'clockIn' && (
          <DateTimePicker
            value={form.clockInTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => date && dispatch({ type: 'SET_CLOCK_IN', payload: date })}
          />
        )}
      </View>

      {/* Clock Out Time (for CORRECTION and MISSING) */}
      {(form.requestType === 'CORRECTION' || form.requestType === 'MISSING') && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t.requests.clockOutTime}</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => dispatch({ type: 'SET_PICKER', payload: 'clockOut' })}>
            <Ionicons name="time-outline" size={20} color={THEME.danger} />
            <Text style={styles.dateInputText}>{formatTime(form.clockOutTime)}</Text>
          </TouchableOpacity>
          {form.activePicker === 'clockOut' && (
            <DateTimePicker
              value={form.clockOutTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => date && dispatch({ type: 'SET_CLOCK_OUT', payload: date })}
            />
          )}
        </View>
      )}

      {/* Reason */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{t.requests.reason}</Text>
        <TextInput
          style={styles.reasonInput}
          placeholder={t.requests.reasonPlaceholder}
          placeholderTextColor={THEME.muted}
          value={form.reason}
          onChangeText={(text) => dispatch({ type: 'SET_REASON', payload: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, form.submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={form.submitting}
      >
        <Text style={styles.submitButtonText}>
          {form.submitting ? t.common.loading : t.requests.submit}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ============ Main Render ============
  if (!user?.employee) {
    return (
      <View style={styles.center}>
        <Text style={{ color: THEME.muted }}>{t.common.loading}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.requests.title}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: THEME.muted }}>{t.common.loading}</Text>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View entering={FadeInDown} style={styles.emptyContent}>
            <Ionicons name="document-text-outline" size={60} color={THEME.muted} />
            <Text style={styles.emptyText}>{t.requests.noRequests}</Text>
          </Animated.View>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Create Request Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>{t.requests.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>{t.requests.newRequest}</Text>
            <View style={{ width: 60 }} />
          </View>

          {form.step === 'type' ? renderTypeSelection() : renderForm()}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ============ Styles ============
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: THEME.bg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: THEME.muted,
  },
  requestCard: {
    marginBottom: 15,
    padding: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  requestTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  requestReason: {
    fontSize: 14,
    color: THEME.text,
    marginBottom: 10,
    lineHeight: 20,
  },
  requestDetails: {
    gap: 6,
  },
  requestDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestDetailText: {
    fontSize: 13,
    color: THEME.muted,
  },
  requestFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  requestDate: {
    fontSize: 12,
    color: THEME.muted,
  },
  reviewerNotes: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  reviewerNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.muted,
    marginBottom: 4,
  },
  reviewerNotesText: {
    fontSize: 13,
    color: THEME.text,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancel: {
    fontSize: 16,
    color: THEME.primary,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME.text,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 20,
  },
  typeSelectionContainer: {
    padding: 20,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 2,
  },
  typeDesc: {
    fontSize: 13,
    color: THEME.muted,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 10,
  },
  attendanceList: {
    flexDirection: 'row',
  },
  attendanceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  attendanceChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  attendanceChipText: {
    fontSize: 14,
    color: THEME.text,
  },
  attendanceChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  dateInputText: {
    fontSize: 16,
    color: THEME.text,
  },
  reasonInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: THEME.text,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: THEME.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
