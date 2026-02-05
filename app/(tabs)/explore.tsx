import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { THEME } from '@/constants/theme';
import { Language } from '@/constants/translations';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import * as employeeService from '@/services/employeeService';
import { profileStyles as styles } from '@/styles/screens';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { locale, setLocale, t } = useLocalization();
  const [employee, setEmployee] = useState<employeeService.Employee | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    employeeService.getEmployeeDetail().then(setEmployee);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
      <ScrollView style={styles.container}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{employee.name[0]}</Text>
          </View>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.company}>{employee.company.name}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.detailsCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/kepegawaian-detail')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="briefcase" size={24} color={THEME.primary} />
              <Text style={styles.menuText}>{t.profile.employmentDetails}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/gaji-detail')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="wallet" size={24} color={THEME.success} />
              <Text style={styles.menuText}>{t.profile.salaryDetails}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
          </TouchableOpacity>
        </View>

        {/* Settings */}
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

        {/* Logout Button */}
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
    </SafeAreaView>
  );
}
