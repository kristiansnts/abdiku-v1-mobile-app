import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { THEME } from '@/constants/theme';

interface Employee {
  name: string;
  join_date: string;
  status: string;
  company: {
    name: string;
  };
}

interface Salary {
  base_salary: number;
  total_allowances: number;
  total_compensation: number;
}

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [salary, setSalary] = useState<Salary | null>(null);

  useEffect(() => {
    api.get('/employee/detail').then((res) => setEmployee(res.data.data));
    api.get('/employee/salary').then((res) => setSalary(res.data.data));
  }, []);

  if (!employee) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{employee.name[0]}</Text>
        </View>
        <Text style={styles.name}>{employee.name}</Text>
        <Text style={styles.company}>{employee.company.name}</Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Employment Details</Text>
        <Text style={styles.detailText}>Join Date: {employee.join_date}</Text>
        <Text style={styles.detailText}>Status: {employee.status}</Text>
      </View>

      {salary && (
        <View style={[styles.detailsCard, styles.salaryCard]}>
          <Text style={styles.cardTitle}>Compensation</Text>
          <Text style={styles.detailText}>
            Base Salary: Rp {salary.base_salary.toLocaleString()}
          </Text>
          <Text style={styles.detailText}>
            Total Allowances: Rp {salary.total_allowances.toLocaleString()}
          </Text>
          <Text style={styles.totalCompensation}>
            Total: Rp {salary.total_compensation.toLocaleString()}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg, padding: 15 },
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
  salaryCard: {
    borderLeftColor: THEME.success,
    borderLeftWidth: 5,
  },
  cardTitle: { fontWeight: 'bold', marginBottom: 10, fontSize: 16, color: THEME.text },
  detailText: { color: THEME.text, marginBottom: 4 },
  totalCompensation: {
    color: THEME.primary,
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 18,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoutButton: {
    backgroundColor: THEME.danger,
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
