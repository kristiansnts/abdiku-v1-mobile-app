import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  // Use your computer's IP - ensure backend runs with --host=0.0.0.0
  baseURL: 'http://192.168.1.5:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  const companyId = await AsyncStorage.getItem('active_company_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (companyId) {
    config.headers['X-Active-Company-Id'] = companyId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      await AsyncStorage.removeItem('token');
      // You might want to trigger a logout in AuthContext if possible, 
      // but clearing token will cause next checkLogin to fail correctly.
    }
    return Promise.reject(error);
  }
);

export default api;
