/**
 * API Configuration and Axios Client
 */
import axios, { AxiosError } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Axios client for API requests
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request interceptor - Add auth tokens, logging, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      console.error('API Error:', {
        status,
        message: data?.detail || data?.message || error.message,
        url: error.config?.url,
      });

      // Handle specific status codes
      if (status === 401) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('auth_token');
        // window.location.href = '/login';
      } else if (status === 404) {
        console.warn('Resource not found:', error.config?.url);
      } else if (status >= 500) {
        console.error('Server error:', data?.detail || 'Internal server error');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error: No response from server');
    } else {
      // Error in request configuration
      console.error('Request Configuration Error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    return data?.detail || data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
