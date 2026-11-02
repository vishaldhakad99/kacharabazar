import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    // Avoid toaster on silent auth check failures
    const isAuthMe = error.config?.url?.includes('/auth/me');
    if (!isAuthMe && error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error.response?.data || { success: false, message });
  }
);

export default api;
