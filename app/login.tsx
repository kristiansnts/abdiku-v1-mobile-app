import { THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import { loginStyles as styles } from '@/styles/screens/loginStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (forceSwitch = false) => {
    if (!email || !password) {
      Alert.alert(t.common.error, t.login.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      await login({ email, password }, forceSwitch);
    } catch (err: any) {
      const errorCode = err.response?.data?.error?.code;
      const errorMessage = err.response?.data?.error?.message || t.login.loginFailed;
      const activeDevice = err.response?.data?.error?.data?.active_device;

      if (errorCode === 'DIFFERENT_DEVICE_ACTIVE') {
        Alert.alert(
          t.login.deviceConflict,
          t.login.deviceConflictMessage.replace('{activeDevice}', activeDevice),
          [
            { text: t.common.cancel, style: 'cancel' },
            { text: t.login.yesLoginHere, onPress: () => handleLogin(true) },
          ]
        );
      } else {
        Alert.alert(t.common.error, errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.inner}>
            <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="time" size={50} color={THEME.primary} />
              </View>
              <Text style={styles.title}>{t.login.title}</Text>
              <Text style={styles.subtitle}>{t.login.subtitle}</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.form}>
              <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={20} color={THEME.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.login.emailPlaceholder}
                  placeholderTextColor={THEME.mutedLight}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color={THEME.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t.login.passwordPlaceholder}
                  placeholderTextColor={THEME.mutedLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={THEME.muted}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={() => handleLogin()}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>{t.login.signIn}</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.footer}>
              <Text style={styles.versionText}>{t.login.version} 1.0.0</Text>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

