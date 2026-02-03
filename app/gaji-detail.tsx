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
  company: {
    name: string;
  };
}

interface Salary {
  base_salary: number;
  total_allowances: number;
  total_compensation: number;
  allowances?: Array<{
    name: string;
    amount: number;
  }>;
}

export default function GajiDetailScreen() {
  const router = useRouter();
  const { locale, t } = useLocalization();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [salary, setSalary] = useState<Salary | null>(null);

  useEffect(() => {
    api.get('/employee/detail').then((res) => setEmployee(res.data.data));
    api.get('/employee/salary').then((res) => setSalary(res.data.data));
  }, []);

  if (!employee || !salary) {
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
          <Text style={styles.backText}>{t.profile.salaryDetails}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{employee.name[0]}</Text>
          </View>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.company}>{employee.company.name}</Text>
        </View>

        <View style={[styles.detailsCard]}>
          <Text style={styles.cardTitle}>{t.profile.compensation}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.profile.baseSalary}</Text>
            <Text style={styles.detailValue}>Rp {salary.base_salary.toLocaleString(locale)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.profile.totalAllowances}</Text>
            <Text style={styles.detailValue}>Rp {salary.total_allowances.toLocaleString(locale)}</Text>
          </View>

          {salary.allowances && salary.allowances.length > 0 && (
            <View style={styles.allowancesList}>
              {salary.allowances.map((allowance, index) => (
                <View key={index} style={styles.allowanceItem}>
                  <Text style={styles.allowanceName}>{allowance.name}</Text>
                  <Text style={styles.allowanceAmount}>Rp {allowance.amount.toLocaleString(locale)}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.profile.totalCompensation}</Text>
            <Text style={styles.totalValue}>Rp {salary.total_compensation.toLocaleString(locale)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    fontSize: 16,
    color: THEME.text,
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
  allowancesList: {
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  allowanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  allowanceName: {
    fontSize: 13,
    color: THEME.muted,
  },
  allowanceAmount: {
    fontSize: 13,
    color: THEME.text,
  },
  totalDivider: {
    height: 2,
    backgroundColor: THEME.primary,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
  },
});
