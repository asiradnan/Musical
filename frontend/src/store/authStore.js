import { create } from 'zustand';
import api from '../api/axios';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false, // Changed initial loading state to false
      error: null,
      initialized: false, // Add flag to track initialization

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { accessToken, refreshToken, user } = response.data;
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            isLoading: false 
          });
          return false;
        }
      },

      logout: async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            await api.post('/auth/logout', { refreshToken });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('user');
          set({ user: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        // Add a check to prevent multiple calls
        if (get().isLoading) return false;
        // Don't check auth if already initialized and no token exists
        const token = localStorage.getItem('accessToken');
        if (get().initialized && !token) {
          return false;
        }

        set({ isLoading: true });
        
        try {
          const response = await api.get('/users/profile');
          console.log('Auth check response:', response.data);
          set({ 
            user: response.data, 
            isAuthenticated: true, 
            isLoading: false, 
            initialized: true 
          });
          return true;
        } catch (error) {
          console.error('Auth check error:', error);
          // Don't clear tokens here, let the axios interceptor handle token refresh
          set({ 
            isLoading: false, 
            initialized: true,
            isAuthenticated: false, 
            user: null 
          });
          return false;
        }
      },
      
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      setInitialized: () => {
        set({ initialized: true });
      }
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;