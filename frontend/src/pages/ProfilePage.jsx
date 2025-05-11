import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import BookingList from './BookingList';

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

  // New state for releases
  const [releases, setReleases] = useState([]);
  const [newRelease, setNewRelease] = useState({ title: '', platform: 'youtube', link: '' });
  const [releasesLoading, setReleasesLoading] = useState(false);

  // New state for rewards
  const [rewardsData, setRewardsData] = useState(null);
  const [rewardsLoading, setRewardsLoading] = useState(false);

  // New state for active tab
  const [activeTab, setActiveTab] = useState('profile');

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

        // If user is an artist, fetch their releases
        if (user.role === 'artist') {
          fetchReleases();
        }
        
        // Fetch user rewards data
        fetchUserRewards();
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, isAuthenticated, checkAuth, user]);

  const fetchUserRewards = async () => {
    try {
      setRewardsLoading(true);
      const response = await api.get('/users/points');
      setRewardsData(response.data);
      setRewardsLoading(false);
    } catch (err) {
      setError('Failed to load rewards data');
      setRewardsLoading(false);
    }
  };

  const fetchReleases = async () => {
    try {
      setReleasesLoading(true);
      const response = await api.get('/users/releases');
      setReleases(response.data.releases);
      setReleasesLoading(false);
    } catch (err) {
      setError('Failed to load releases');
      setReleasesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleReleaseInputChange = (e) => {
    setNewRelease({ ...newRelease, [e.target.name]: e.target.value });
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

  const handleAddRelease = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!newRelease.title.trim() || !newRelease.link.trim()) {
      setError('Title and link are required');
      return;
    }

    // Validate link format based on platform
    if (newRelease.platform === 'youtube' && !newRelease.link.includes('youtube.com') && !newRelease.link.includes('youtu.be')) {
      setError('Please enter a valid YouTube link');
      return;
    }

    if (newRelease.platform === 'spotify' && !newRelease.link.includes('spotify.com')) {
      setError('Please enter a valid Spotify link');
      return;
    }

    try {
      const response = await api.post('/users/releases', newRelease);
      setReleases([...releases, response.data.release]);
      setNewRelease({ title: '', platform: 'youtube', link: '' });
      setMessage('Release added successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add release');
    }
  };

  const handleDeleteRelease = async (releaseId) => {
    try {
      await api.delete(`/users/releases/${releaseId}`);
      setReleases(releases.filter(release => release._id !== releaseId));
      setMessage('Release deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete release');
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
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar />
      <div className="flex-1 p-8">
        <div className="container mx-auto">
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

          {/* Navigation Tabs */}
          <div className="flex mb-6 border-b border-white/20">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/70 hover:text-white'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'bookings' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/70 hover:text-white'}`}
              onClick={() => setActiveTab('bookings')}
            >
              My Bookings
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'rewards' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/70 hover:text-white'}`}
              onClick={() => setActiveTab('rewards')}
            >
              Rewards
            </button>
            {user?.role === 'artist' && (
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'releases' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/70 hover:text-white'}`}
                onClick={() => setActiveTab('releases')}
              >
                My Releases
              </button>
            )}
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'security' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/70 hover:text-white'}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
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
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white">
              <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>
              <BookingList />
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white">
              <h2 className="text-2xl font-semibold mb-6">My Rewards</h2>
              
              {rewardsLoading ? (
                <p className="text-white">Loading rewards data...</p>
              ) : rewardsData ? (
                <div className="space-y-6">
                  {/* Tier and Points Summary */}
                  <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-6 rounded-xl border border-white/20">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-medium mb-1">Current Tier</h3>
                        <div className="flex items-center">
                          <span className={`text-3xl font-bold ${
                            rewardsData.tier === 'Bronze' ? 'text-amber-600' :
                            rewardsData.tier === 'Silver' ? 'text-gray-300' :
                            rewardsData.tier === 'Gold' ? 'text-yellow-400' :
                            'text-purple-300'
                          }`}>
                            {rewardsData.tier}
                          </span>
                          <span className="ml-3 bg-white/20 px-3 py-1 rounded-full text-sm">
                            {rewardsData.discount}% Discount
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-medium mb-1">Total Points</h3>
                        <span className="text-3xl font-bold text-purple-400">{rewardsData.points}</span>
                      </div>
                    </div>
                    
                    {/* Next Tier Progress */}
                    {rewardsData.nextTier && (
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress to {rewardsData.nextTier.tier}</span>
                          <span>{rewardsData.points} / {rewardsData.points + rewardsData.nextTier.pointsNeeded} points</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5">
                          <div 
                            className="bg-purple-600 h-2.5 rounded-full" 
                            style={{ width: `${(rewardsData.points / (rewardsData.points + rewardsData.nextTier.pointsNeeded)) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm mt-2">
                          Earn <span className="font-semibold text-purple-400">{rewardsData.nextTier.pointsNeeded}</span> more points to reach {rewardsData.nextTier.tier} tier and get {rewardsData.nextTier.discount}% discount!
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Points History */}
                  <div>
                    <h3 className="text-xl font-medium mb-4">Points History</h3>
                    {rewardsData.history && rewardsData.history.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Activity</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Points</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Description</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Expires</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {rewardsData.history.map((item, index) => (
                              <tr key={index} className="hover:bg-white/5">
                                <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">{item.activity}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-400">+{item.amount}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{item.description}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-white/70">No points history yet. Start booking or purchasing to earn points!</p>
                    )}
                  </div>
                  
                  {/* Benefits */}
                  <div>
                    <h3 className="text-xl font-medium mb-4">Your Benefits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h4 className="font-medium mb-2">Discount on Bookings</h4>
                        <p className="text-2xl font-bold text-purple-400">{rewardsData.discount}%</p>
                        <p className="text-sm text-white/70 mt-1">Applied automatically at checkout</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h4 className="font-medium mb-2">Priority Support</h4>
                        <p className="text-sm">
                          {rewardsData.tier === 'Bronze' ? 'Standard support' :
                           rewardsData.tier === 'Silver' ? 'Priority email support' :
                           rewardsData.tier === 'Gold' ? 'Priority phone support' :
                           'VIP dedicated support'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/70">Unable to load rewards data. Please try again later.</p>
              )}
            </div>
          )}

          {/* Artist Releases Tab - Only shown for artists */}
          {activeTab === 'releases' && user?.role === 'artist' && (
            <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white">
              <h2 className="text-2xl font-semibold mb-6">My Releases</h2>

              {releasesLoading ? (
                <p className="text-white">Loading releases...</p>
              ) : (
                <>
                  {releases.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {releases.map((release) => (
                        <div key={release._id} className="bg-white/10 p-4 rounded-lg border border-white/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-medium">{release.title}</h3>
                              <p className="text-sm text-white/70 capitalize">{release.platform}</p>
                              <a
                                href={release.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                              >
                                View Release
                              </a>
                            </div>
                            <button
                              onClick={() => handleDeleteRelease(release._id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/70 mb-6">You haven't added any releases yet.</p>
                  )}

                  <form onSubmit={handleAddRelease} className="space-y-4 bg-white/5 p-4 rounded-lg">
                    <h3 className="text-xl font-medium">Add New Release</h3>
                    <div>
                      <label htmlFor="title" className="block mb-2 font-medium">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={newRelease.title}
                        onChange={handleReleaseInputChange}
                        required
                        placeholder="Enter release title"
                        className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="platform" className="block mb-2 font-medium">
                        Platform
                      </label>
                      <select
                        id="platform"
                        name="platform"
                        value={newRelease.platform}
                        onChange={handleReleaseInputChange}
                        className="w-full p-3 border rounded-md text-base bg-white/10 text-white border-white/30"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      >
                        <option value="youtube" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>YouTube</option>
                        <option value="spotify" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Spotify</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="link" className="block mb-2 font-medium">
                        Link
                      </label>
                      <input
                        type="url"
                        id="link"
                        name="link"
                        value={newRelease.link}
                        onChange={handleReleaseInputChange}
                        required
                        placeholder={`Enter ${newRelease.platform === 'youtube' ? 'YouTube' : 'Spotify'} link`}
                        className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md"
                    >
                      Add Release
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
