import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { Language } from '@/constants/translations';
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
  const { locale, setLocale, t } = useLocalization();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    api.get('/employee/detail').then((res) => setEmployee(res.data.data));
    api.get('/employee/salary').then((res) => setSalary(res.data.data));
  }, []);

  const handleLanguageChange = async (newLocale: Language) => {
    await setLocale(newLocale);
    setShowLanguageModal(false);
  };

  if (!employee) {
    return (
      <View style={styles.center}>
        <Text>{t.common.loading}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{employee.name[0]}</Text>
          </View>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.company}>{employee.company.name}</Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>{t.profile.employmentDetails}</Text>
          <Text style={styles.detailText}>{t.profile.joinDate}: {employee.join_date}</Text>
          <Text style={styles.detailText}>{t.profile.status}: {employee.status}</Text>
        </View>

        {salary && (
          <View style={[styles.detailsCard, styles.salaryCard]}>
            <Text style={styles.cardTitle}>{t.profile.compensation}</Text>
            <Text style={styles.detailText}>
              {t.profile.baseSalary}: Rp {salary.base_salary.toLocaleString(locale)}
            </Text>
            <Text style={styles.detailText}>
              {t.profile.totalAllowances}: Rp {salary.total_allowances.toLocaleString(locale)}
            </Text>
            <Text style={styles.totalCompensation}>
              {t.profile.totalCompensation}: Rp {salary.total_compensation.toLocaleString(locale)}
            </Text>
          </View>
        )}

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>{t.profile.settings}</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={24} color={THEME.primary} />
              <Text style={styles.settingText}>{t.profile.language}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{t.languages[locale]}</Text>
              <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>{t.profile.signOut}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.profile.selectLanguage}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color={THEME.muted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.languageOption, locale === 'en' && styles.languageOptionActive]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.languageText, locale === 'en' && styles.languageTextActive]}>
                {t.languages.en}
              </Text>
              {locale === 'en' && (
                <Ionicons name="checkmark-circle" size={24} color={THEME.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, locale === 'id' && styles.languageOptionActive]}
              onPress={() => handleLanguageChange('id')}
            >
              <Text style={[styles.languageText, locale === 'id' && styles.languageTextActive]}>
                {t.languages.id}
              </Text>
              {locale === 'id' && (
                <Ionicons name="checkmark-circle" size={24} color={THEME.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    fontSize: 16,
    color: THEME.text,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: THEME.muted,
  },
  logoutButton: {
    backgroundColor: THEME.danger,
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 10,
  },
  languageOptionActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  languageText: {
    fontSize: 16,
    color: THEME.text,
    fontWeight: '500',
  },
  languageTextActive: {
    color: THEME.primary,
    fontWeight: 'bold',
  },
});
