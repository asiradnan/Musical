import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import useAdminStore from '../../store/adminStore';

const UserPointsModal = ({ user, onClose, onSuccess }) => {
  const { addUserPoints } = useAdminStore();
  const [formData, setFormData] = useState({
    amount: 10,
    activity: 'other',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseInt(value) : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await addUserPoints({
        userId: user._id,
        ...formData
      });
      console.log('Result:', result);
      if (result) {
        onSuccess(result.message);
      } else {
        setError('Failed to add points. Please try again.');
      }
    } catch (err) {
        console.log('Error:', err);
      setError('An error occurred while adding points.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full border border-white/20">
        <div className="flex justify-between items-center p-5 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">Manage Points for {user.name}</h3>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-white/80 mb-2">Current Tier</label>
            <div className={`text-lg font-semibold ${
              user.tier === 'Bronze' ? 'text-amber-600' :
              user.tier === 'Silver' ? 'text-gray-300' :
              user.tier === 'Gold' ? 'text-yellow-400' :
              'text-purple-300'
            }`}>
              {user.tier || 'Bronze'}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-white/80 mb-2">Current Points</label>
            <div className="text-lg font-semibold text-purple-400">
              {user.points?.total || 0}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="amount" className="block text-white/80 mb-2">Points to Add</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              required
              className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="activity" className="block text-white/80 mb-2">Activity Type</label>
            <select
              id="activity"
              name="activity"
              value={formData.activity}
              onChange={handleChange}
              required
              className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <option value="booking" style={{ backgroundColor: '#1a1a1a' }}>Booking</option>
              <option value="purchase" style={{ backgroundColor: '#1a1a1a' }}>Purchase</option>
              <option value="rental" style={{ backgroundColor: '#1a1a1a' }}>Rental</option>
              <option value="referral" style={{ backgroundColor: '#1a1a1a' }}>Referral</option>
              <option value="other" style={{ backgroundColor: '#1a1a1a' }}>Other</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-white/80 mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Reason for adding points"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white h-24 resize-none"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white flex items-center"
            >
              {loading ? 'Processing...' : 'Add Points'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserPointsModal;
