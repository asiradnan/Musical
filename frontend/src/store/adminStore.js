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
  bookings: [],
  // Add these to your existing adminStore.js

// Reward system management
rewardConfig: null,
rewardConfigLoading: false,
rewardConfigError: null,

getRewardConfig: async () => {
  set({ rewardConfigLoading: true, rewardConfigError: null });
  try {
    const response = await api.get('/admin/rewards/config');
    set({ rewardConfig: response.data, rewardConfigLoading: false });
    return response.data;
  } catch (error) {
    set({
      rewardConfigError: error.response?.data?.message || 'Failed to fetch reward configuration',
      rewardConfigLoading: false
    });
    return false;
  }
},

updateRewardConfig: async (configData) => {
  set({ rewardConfigLoading: true, rewardConfigError: null });
  try {
    const response = await api.put('/admin/rewards/config', configData);
    set({ rewardConfig: response.data.config, rewardConfigLoading: false });
    return response.data;
  } catch (error) {
    set({
      rewardConfigError: error.response?.data?.message || 'Failed to update reward configuration',
      rewardConfigLoading: false
    });
    return false;
  }
},

addUserPoints: async (userData) => {
  set({ isLoading: true, error: null });
  try {
    const response = await api.post('/admin/rewards/points', userData);
    set({ isLoading: false });
    console.log(response.data);
    return response.data;
  } catch (error) {
    set({
      error: error.response?.data?.message || 'Failed to add points',
      isLoading: false
    });
    return false;
  }
},

processExpiredPoints: async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await api.post('/admin/rewards/process-expired');
    set({ isLoading: false });
    return response.data;
  } catch (error) {
    set({
      error: error.response?.data?.message || 'Failed to process expired points',
      isLoading: false
    });
    return false;
  }
},


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

  // Booking management
  getAllBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/bookings');
      set({ bookings: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch bookings',
        isLoading: false
      });
      return false;
    }
  },
  
  cancelBooking: async (bookingId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
      set(state => ({
        bookings: state.bookings.map(booking =>
          booking._id === bookingId ? { ...booking, status: 'cancelled', cancelReason: reason } : booking
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to cancel booking',
        isLoading: false
      });
      return false;
    }
  },

  
  clearClaimError: () => set({ claimError: null })
}));

export default useAdminStore;
