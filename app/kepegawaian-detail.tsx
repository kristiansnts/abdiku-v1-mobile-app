import { THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Employee {
  name: string;
  join_date: string;
  status: string;
  employee_id?: string;
  department?: string;
  position?: string;
  employee_type?: string;
  work_location?: string;
  ptkp_status?: string;
  npwp?: string;
  nik?: string;
  bpjs_kesehatan_number?: string;
  bpjs_ketenagakerjaan_number?: string;
  company: {
    name: string;
  };
}

export default function KepegawaianDetailScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    api.get('/employee/detail').then((res) => setEmployee(res.data.data));
  }, []);

  if (!employee) {
    return (
      <View style={styles.center}>
        <Text>{t.common.loading}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
          <Text style={styles.backText}>{t.profile.employmentDetails}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{employee.name[0]}</Text>
          </View>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.company}>{employee.company.name}</Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.profile.joinDate}</Text>
            <Text style={styles.detailValue}>{employee.join_date}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.profile.status}</Text>
            <View style={[styles.statusBadge, employee.status === 'Active' && styles.statusActive]}>
              <Text style={[styles.statusText, employee.status === 'Active' && styles.statusTextActive]}>
                {employee.status}
              </Text>
            </View>
          </View>

          {employee.employee_id && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.profile.employeeId}</Text>
                <Text style={styles.detailValue}>{employee.employee_id}</Text>
              </View>
            </>
          )}

          {employee.department && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.profile.department}</Text>
                <Text style={styles.detailValue}>{employee.department}</Text>
              </View>
            </>
          )}

          {employee.position && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.profile.position}</Text>
                <Text style={styles.detailValue}>{employee.position}</Text>
              </View>
            </>
          )}

          {employee.employee_type && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.profile.employeeType}</Text>
                <Text style={styles.detailValue}>{employee.employee_type}</Text>
              </View>
            </>
          )}

          {employee.work_location && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.profile.workLocation}</Text>
                <Text style={styles.detailValue}>{employee.work_location}</Text>
              </View>
            </>
          )}
        </View>

        <Text style={styles.sectionHeaderLabel}>Informasi Legal & Pajak</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status PTKP</Text>
            <Text style={styles.detailValue}>{employee.ptkp_status ?? '-'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nomor NPWP</Text>
            <Text style={styles.detailValue}>{employee.npwp ?? '-'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nomor NIK</Text>
            <Text style={styles.detailValue}>{employee.nik ?? '-'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>BPJS Kesehatan</Text>
            <Text style={styles.detailValue}>{employee.bpjs_kesehatan_number ?? '-'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>BPJS Ketenagakerjaan</Text>
            <Text style={styles.detailValue}>{employee.bpjs_ketenagakerjaan_number ?? '-'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeaderLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 5,
    marginBottom: 10,
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    gap: 10,
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  card: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  name: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
  company: { color: THEME.muted, marginTop: 5 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  detailsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: THEME.muted,
  },
  detailValue: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.muted,
  },
  statusTextActive: {
    color: THEME.success,
  },
});
