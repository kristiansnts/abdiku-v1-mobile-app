import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import api from '../services/api';
import * as notificationService from '../services/notificationService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active_company_id?: number;
  active_company_name?: string;
  companies?: {
    id: number;
    name: string;
    role: string;
  }[];
  employee?: {
    id: number;
    name: string;
    join_date: string;
    status: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials, forceSwitch?: boolean) => Promise<{ needsSelection: boolean; companies: any[] }>;
  setCompany: (companyId: number) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const getDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `mobile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    console.log('🔐 [Auth] Checking session...');
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ [Auth] Session check timed out');
        setLoading(false);
      }
    }, 5000);

    try {
      const token = await AsyncStorage.getItem('token');
      const savedCompanyId = await AsyncStorage.getItem('active_company_id');
      
      if (token) {
        console.log('🔑 [Auth] Token found, fetching user...');
        const res = await api.get('/auth/me');
        let userData = res.data.data.user;
        
        if (savedCompanyId) {
            userData = {
                ...userData,
                active_company_id: parseInt(savedCompanyId)
            };
        }
        
        setUser(userData);
        console.log('✅ [Auth] Session restored for:', userData.email);
      } else {
        console.log('👋 [Auth] No token found');
      }
    } catch (e) {
      console.error('❌ [Auth] Session check failed:', e);
      await logout();
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      console.log('🏁 [Auth] Initialization complete');
    }
  };

  const login = async (credentials: LoginCredentials, forceSwitch = false) => {
    const deviceId = await getDeviceId();
    const res = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      device_id: deviceId,
      device_name: 'Abdiku Mobile',
      device_model: Platform.OS === 'ios' ? 'iPhone' : 'Android',
      device_os: Platform.OS,
      app_version: '1.0.0',
      force_switch: forceSwitch,
    });
    
    const { token, user: userData, companies } = res.data.data;
    await AsyncStorage.setItem('token', token);
    
    const needsSelection = companies && companies.length > 1;
    
    if (!needsSelection) {
        const activeCompany = companies && companies.length === 1 ? companies[0] : null;
        if (activeCompany) {
            await AsyncStorage.setItem('active_company_id', activeCompany.id.toString());
            setUser({ ...userData, active_company_id: activeCompany.id, active_company_name: activeCompany.name, role: activeCompany.role });
        } else {
            setUser(userData);
        }
    } else {
        setUser({ ...userData, companies });
    }

    // Register FCM token after successful login
    try {
      const hasPermission = await notificationService.requestNotificationPermissions();
      if (hasPermission) {
        const fcmToken = await notificationService.getFcmToken();
        if (fcmToken) {
          await notificationService.registerFcmToken(deviceId, fcmToken);
        }
      }
    } catch (error) {
      console.warn('Failed to register FCM token:', error);
    }

    return { needsSelection, companies: companies || [] };
  };

  const setCompany = async (companyId: number) => {
    const res = await api.post('/auth/set-company', { company_id: companyId });
    const { active_company_id, active_company_name, role } = res.data.data;
    
    await AsyncStorage.setItem('active_company_id', active_company_id.toString());
    
    setUser(prev => prev ? {
        ...prev,
        active_company_id,
        active_company_name,
        role
    } : null);
  };

  const logout = async () => {
    try {
      const deviceId = await getDeviceId();
      await notificationService.clearFcmToken(deviceId);
    } catch (error) {
      console.warn('Failed to clear FCM token:', error);
    }

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('active_company_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, setCompany, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
