import { create } from 'zustand';
import api from '../api/client';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        set({ user: res.user, isAuthenticated: true, loading: false });
        return res.user;
      }
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    } catch (err) {
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        set({ user: res.user, isAuthenticated: true, loading: false });
        toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`);
        return res.user;
      }
      set({ loading: false });
      return null;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (formData) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/register', formData);
      if (res.success) {
        set({ user: res.user, isAuthenticated: true, loading: false });
        toast.success('Registration successful! Welcome to Kachra Bazar.');
        return res.user;
      }
      set({ loading: false });
      return null;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore
    } finally {
      set({ user: null, isAuthenticated: false });
      toast.success('Logged out successfully.');
    }
  },

  updateUser: (updatedData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedData } : null,
    }));
  },
}));

export default useAuthStore;
