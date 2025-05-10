import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user, updateUser, isAuthenticated, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!isAuthenticated) {
          const authResult = await checkAuth();
          if (!authResult) {
            navigate('/login');
            return;
          }
        }
        setFormData({ name: user.name, email: user.email });
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, isAuthenticated, checkAuth, user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.put('/users/profile', formData);
      updateUser(response.data.user);
      setMessage(
        formData.email !== user.email
          ? 'Profile updated. Please verify your new email address.'
          : 'Profile updated successfully'
      );
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setMessage('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading)
    return (
      <div className="app-background min-h-screen">
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-white text-xl">Loading profile...</p>
        </div>
      </div>
    );

  if (error && !user)
    return (
      <div className="app-background min-h-screen">
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-red-500 text-xl">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="app-background min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>

        {message && (
          <div className="bg-green-500 text-white p-4 rounded-md mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Profile Information</h2>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="space-y-4">
            {!editMode ? (
              <div className="space-y-3">
                <p>
                  <span className="font-semibold">Name:</span> {user?.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>
                <p>
                  <span className="font-semibold">Email Verified:</span>{' '}
                  {user?.isEmailVerified ? 'Yes' : 'No'}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {user?.role}
                </p>
                <p>
                  <span className="font-semibold">Account Created:</span>{' '}
                  {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-2 font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                  />
                  {formData.email !== user?.email && (
                    <p className="text-yellow-400 text-sm mt-1">
                      Changing your email will require verification of the new address.
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md"
                >
                  Save Changes
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/30 text-white">
          <h2 className="text-2xl font-semibold mb-6">Change Password</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block mb-2 font-medium capitalize">
                  {field === 'currentPassword'
                    ? 'Current Password'
                    : field === 'newPassword'
                    ? 'New Password'
                    : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  id={field}
                  name={field}
                  value={passwordData[field]}
                  onChange={handlePasswordChange}
                  required
                  className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                />
              </div>
            ))}
            <button
              type="submit"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-md border border-white/30 backdrop-blur-md"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
