# Native Screen Components

Implement these screens within your `src/screens` directory.

## 1. Home Screen (`src/screens/HomeScreen.tsx`)
Features "Clock In/Out" using `expo-location`.

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import api from '../services/api';

export default function HomeScreen() {
  const [status, setStatus] = useState<any>(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/attendance/status');
      setStatus(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleClockAction = async (type: 'clock-in' | 'clock-out') => {
    try {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') return Alert.alert('Permission Denied');

      const location = await Location.getCurrentPositionAsync({});
      
      await api.post(`/attendance/${type}`, {
        [`${type}_at`]: new Date().toISOString(),
        evidence: {
          geolocation: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy
          },
          device: { device_id: 'test', model: 'mobile', os: 'ios', app_version: '1.0' }
        }
      });
      fetchStatus();
      Alert.alert('Success', `You have ${type} successfully`);
    } catch (err) {
      Alert.alert('Error', (err as any).response?.data?.error?.message || 'Action failed');
    }
  };

  if (!status) return <View style={styles.center}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Today's Status</Text>
        <Text style={styles.statusText}>{status.message}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, !status.can_clock_in && styles.disabled]}
          disabled={!status.can_clock_in}
          onPress={() => handleClockAction('clock-in')}
        >
          <Text style={styles.buttonText}>Clock In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondary, !status.can_clock_out && styles.disabled]}
          disabled={!status.can_clock_out}
          onPress={() => handleClockAction('clock-out')}
        >
          <Text style={styles.buttonText}>Clock Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  statusCard: { 
    backgroundColor: '#4f46e5', padding: 30, borderRadius: 20, 
    alignItems: 'center', marginBottom: 20 
  },
  statusLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  statusText: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  buttonRow: { flexDirection: 'row', gap: 15 },
  button: { 
    flex: 1, backgroundColor: '#4f46e5', padding: 18, 
    borderRadius: 15, alignItems: 'center' 
  },
  secondary: { backgroundColor: '#ec4899' },
  disabled: { backgroundColor: '#cbd5e1' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
```

## 2. Profile Screen (`src/screens/ProfileScreen.tsx`)

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import api from '../services/api';

export default function ProfileScreen() {
  const [employee, setEmployee] = useState<any>(null);
  const [salary, setSalary] = useState<any>(null);

  useEffect(() => {
    api.get('/employee/detail').then(res => setEmployee(res.data.data));
    api.get('/employee/salary').then(res => setSalary(res.data.data));
  }, []);

  if (!employee) return <View style={styles.center}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{employee.name[0]}</Text></View>
        <Text style={styles.name}>{employee.name}</Text>
        <Text style={styles.company}>{employee.company.name}</Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Employment Details</Text>
        <Text>Join Date: {employee.join_date}</Text>
        <Text>Status: {employee.status}</Text>
      </View>

      {salary && (
        <View style={[styles.detailsCard, { borderLeftColor: '#10b981', borderLeftWidth: 5 }]}>
          <Text style={styles.cardTitle}>Compensation</Text>
          <Text>Base Salary: Rp {salary.base_salary.toLocaleString()}</Text>
          <Text>Total Allowances: Rp {salary.total_allowances.toLocaleString()}</Text>
          <Text style={styles.totalCompensation}>Total: Rp {salary.total_compensation.toLocaleString()}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 15 },
  card: { backgroundColor: 'white', padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
  name: { fontSize: 20, fontWeight: 'bold' },
  company: { color: '#667', marginTop: 5 },
  avatar: { 
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#4f46e5', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15 
  },
  avatarText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  detailsCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15 },
  cardTitle: { fontWeight: 'bold', marginBottom: 10, fontSize: 16 },
  totalCompensation: { color: '#4f46e5', fontWeight: 'bold', marginTop: 10, fontSize: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
```
