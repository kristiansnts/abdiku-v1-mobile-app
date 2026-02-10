import { THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import { loginStyles as styles } from '@/styles/screens/loginStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../context/DialogContext';
import { useToast } from '../context/ToastContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const { t } = useLocalization();
  const { showToast } = useToast();
  const { showDialog } = useDialog();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (forceSwitch = false) => {
    if (!email || !password) {
      showToast(t.login.fillAllFields, 'info');
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
        showDialog({
          title: t.login.deviceConflict,
          message: t.login.deviceConflictMessage.replace('{activeDevice}', activeDevice),
          icon: 'phone-portrait-outline',
          actions: [
            { text: t.login.yesLoginHere, onPress: () => handleLogin(true) },
            { text: t.common.cancel, style: 'cancel', onPress: () => { } },
          ]
        });
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#ffffff', '#f1f5f9']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.inner}>
            <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.header}>
              <Image
                source={require('../assets/images/abdiku-logo-transparent.png')}
                style={{ width: 280, height: 120 }}
                resizeMode="contain"
              />
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
                {!loading && (
                  <LinearGradient
                    colors={[THEME.primaryLight, THEME.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  />
                )}
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

