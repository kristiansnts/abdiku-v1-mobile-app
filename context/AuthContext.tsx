import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: {
    id: number;
    name: string;
  };
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
  login: (credentials: LoginCredentials, forceSwitch?: boolean) => Promise<void>;
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
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await api.get('/auth/me');
        setUser(res.data.data.user);
      }
    } catch (e) {
      await logout();
    } finally {
      setLoading(false);
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
    await AsyncStorage.setItem('token', res.data.data.token);
    setUser(res.data.data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
