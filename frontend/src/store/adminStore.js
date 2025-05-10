import { create } from 'zustand';
import api from '../api/axios';

const useAdminStore = create((set, get) => ({
  users: [],
  reports: [],
  filteredUsers: [],
  items: [],
  filteredItems: [],
  isLoading: false,
  error: null,
  itemError: null,

  // User management
  getAllUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/admin/users');
      set({ users: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch users',
        isLoading: false
      });
      return false;
    }
  },

  restrictUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/admin/users/${userId}/restrict`);
      set(state => ({
        users: state.users.map(user =>
          user._id === userId ? { ...user, isActive: false } : user
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to restrict user',
        isLoading: false
      });
      return false;
    }
  },
  
  deleteUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      set(state => ({
        users: state.users.filter(user => user._id !== userId),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete user',
        isLoading: false
      });
      return false;
    }
  },

  searchUsers: (searchTerm) => {
    const { users } = get();
    if (!searchTerm) {
      set({ filteredUsers: [] });
      return;
    }
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    set({ filteredUsers: filtered });
  },
  
  clearClaimError: () => set({ claimError: null })
}));

export default useAdminStore;
