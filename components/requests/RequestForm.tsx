import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { THEME } from '@/constants/theme';
import { Attendance, RequestType } from '@/types/attendance';
import { formatDateString, formatTime } from '@/utils/date';
import { getRequestTypeText } from '@/utils/status';
import { Language, TranslationKeys } from '@/constants/translations';
import { FormState, PickerType } from '@/hooks/useRequests';

interface RequestFormProps {
  form: FormState;
  attendanceList: Attendance[];
  locale: Language;
  t: TranslationKeys;
  onBack: () => void;
  onSelectAttendance: (attendance: Attendance) => void;
  onSetDate: (date: Date) => void;
  onSetClockIn: (date: Date) => void;
  onSetClockOut: (date: Date) => void;
  onSetReason: (reason: string) => void;
  onSetPicker: (picker: PickerType) => void;
  onSubmit: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({
  form,
  attendanceList,
  locale,
  t,
  onBack,
  onSelectAttendance,
  onSetDate,
  onSetClockIn,
  onSetClockOut,
  onSetReason,
  onSetPicker,
  onSubmit,
}) => {
  return (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.formTitle}>{getRequestTypeText(form.requestType!, t)}</Text>
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
                onPress={() => onSelectAttendance(att)}
              >
                <Text style={[
                  styles.attendanceChipText,
                  form.selectedAttendance?.id === att.id && styles.attendanceChipTextActive,
                ]}>
                  {formatDateString(att.date, 'shortDate', locale)}
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
          <TouchableOpacity style={styles.dateInput} onPress={() => onSetPicker('date')}>
            <Ionicons name="calendar-outline" size={20} color={THEME.primary} />
            <Text style={styles.dateInputText}>
              {formatDateString(form.selectedDate.toISOString(), 'shortDate', locale)}
            </Text>
          </TouchableOpacity>
          {form.activePicker === 'date' && (
            <DateTimePicker
              value={form.selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => date && onSetDate(date)}
              maximumDate={new Date()}
            />
          )}
        </View>
      )}

      {/* Clock In Time */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{t.requests.clockInTime}</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => onSetPicker('clockIn')}>
          <Ionicons name="time-outline" size={20} color={THEME.success} />
          <Text style={styles.dateInputText}>{formatTime(form.clockInTime, locale)}</Text>
        </TouchableOpacity>
        {form.activePicker === 'clockIn' && (
          <DateTimePicker
            value={form.clockInTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => date && onSetClockIn(date)}
          />
        )}
      </View>

      {/* Clock Out Time (for CORRECTION and MISSING) */}
      {(form.requestType === 'CORRECTION' || form.requestType === 'MISSING') && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{t.requests.clockOutTime}</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => onSetPicker('clockOut')}>
            <Ionicons name="time-outline" size={20} color={THEME.danger} />
            <Text style={styles.dateInputText}>{formatTime(form.clockOutTime, locale)}</Text>
          </TouchableOpacity>
          {form.activePicker === 'clockOut' && (
            <DateTimePicker
              value={form.clockOutTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => date && onSetClockOut(date)}
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
          onChangeText={onSetReason}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, form.submitting && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={form.submitting}
      >
        <Text style={styles.submitButtonText}>
          {form.submitting ? t.common.loading : t.requests.submit}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
