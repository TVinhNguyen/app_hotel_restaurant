import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import type { ApiResponse } from '../types';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.instance.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
          console.log('Interceptor - Token from storage:', token);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Interceptor - Auth header set:', config.headers.Authorization);
          } else {
            console.log('Interceptor - No token found');
          }
        } catch (error) {
          
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle common responses
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          console.log('Unauthorized - redirecting to login');
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic methods
  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    return this.instance.get(url, config);
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.instance.post(url, data);
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.instance.put(url, data);
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.instance.delete(url);
  }
}

export const apiService = new ApiService();