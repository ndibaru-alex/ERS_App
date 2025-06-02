import { axiosInstance } from '../config';
import axios from 'axios';

export interface AuthResponse {
  token: string;  // Changed from access_token to match backend
  user: {
    id: string;
    username: string;
    role: string;
  };
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
  full_name: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async (fn: () => Promise<any>, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (axios.isCancel(error) || !error.response || error.code === 'ECONNABORTED')) {
      console.log(`Retrying request... ${retries} attempts remaining`);
      await sleep(delay);
      return retryRequest(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post('/auth/login', { username, password });
      const data = response.data;
      
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  },

  register: async (data: RegisterData) => {
    try {
      console.log('Registration attempt:', { 
        username: data.username, 
        email: data.email,
        fullName: data.full_name
      });
      const response = await retryRequest(() => 
        axiosInstance.post('/auth/register', {
          ...data,
          role: data.role || 'user'
        })
      );
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getUserRole: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : null;
  },
};