import React, { useState, useEffect } from 'react';
import useAdminStore from '../../store/adminStore';
import { FaEdit, FaSave, FaTimes, FaSync } from 'react-icons/fa';

const RewardManagement = () => {
  const { 
    getRewardConfig, 
    updateRewardConfig, 
    processExpiredPoints,
    rewardConfig, 
    rewardConfigLoading, 
    rewardConfigError 
  } = useAdminStore();
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchRewardConfig();
  }, []);
  
  useEffect(() => {
    if (rewardConfig && !formData) {
      setFormData({ ...rewardConfig });
    }
  }, [rewardConfig]);
  
  const fetchRewardConfig = async () => {
    await getRewardConfig();
  };
  
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  const handlePointValueChange = (activity, value) => {
    setFormData(prev => ({
      ...prev,
      pointValues: {
        ...prev.pointValues,
        [activity]: value
      }
    }));
  };
  
  const handleExpiryToggle = (enabled) => {
    setFormData(prev => ({
      ...prev,
      pointExpiry: {
        ...prev.pointExpiry,
        enabled
      }
    }));
  };
  
  const handleExpiryDaysChange = (days) => {
    setFormData(prev => ({
      ...prev,
      pointExpiry: {
        ...prev.pointExpiry,
        durationDays: days
      }
    }));
  };
  
  const handleSave = async () => {
    setError('');
    setMessage('');
    
    try {
      const result = await updateRewardConfig(formData);
      if (result) {
        setMessage('Reward configuration updated successfully');
        setEditMode(false);
      }
    } catch (err) {
      setError('Failed to update reward configuration');
    }
  };
  
  const handleProcessExpiredPoints = async () => {
    setError('');
    setMessage('');
    
    try {
      const result = await processExpiredPoints();
      if (result) {
        setMessage(`Expired points processed successfully. ${result.usersProcessed} users affected.`);
        fetchRewardConfig();
      }
    } catch (err) {
      setError('Failed to process expired points');
    }
  };
  
  const handleCancel = () => {
    setFormData({ ...rewardConfig });
    setEditMode(false);
    setError('');
  };
  
  if (rewardConfigLoading || !formData) {
    return <div className="text-white text-center py-8">Loading reward configuration...</div>;
  }
  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Reward System Configuration</h2>
        <div className="flex space-x-2">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
              >
                <FaEdit className="mr-2" /> Edit Configuration
              </button>
              <button
                onClick={handleProcessExpiredPoints}
                className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white"
              >
                <FaSync className="mr-2" /> Process Expired Points
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white"
              >
                <FaSave className="mr-2" /> Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 p-4 rounded-md mb-6">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Thresholds */}
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <h3 className="text-xl font-medium mb-4">Tier Thresholds</h3>
          <div className="space-y-4">
            {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier) => (
              <div key={tier} className="flex items-center">
                <span className={`w-24 font-medium ${
                  tier === 'Bronze' ? 'text-amber-600' :
                  tier === 'Silver' ? 'text-gray-300' :
                  tier === 'Gold' ? 'text-yellow-400' :
                  'text-purple-300'
                }`}>
                  {tier}
                </span>
                <div className="flex-1">
                  {editMode ? (
                    <input
                      type="number"
                      min="0"
                      value={formData.tierThresholds[tier]}
                      onChange={(e) => handleInputChange('tierThresholds', tier, parseInt(e.target.value))}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-md"
                      disabled={tier === 'Bronze'} // Bronze is always 0
                    />
                  ) : (
                    <span>{formData.tierThresholds[tier]} points</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount Rates */}
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <h3 className="text-xl font-medium mb-4">Discount Rates</h3>
          <div className="space-y-4">
            {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier) => (
              <div key={tier} className="flex items-center">
                <span className={`w-24 font-medium ${
                  tier === 'Bronze' ? 'text-amber-600' :
                  tier === 'Silver' ? 'text-gray-300' :
                  tier === 'Gold' ? 'text-yellow-400' :
                  'text-purple-300'
                }`}>
                  {tier}
                </span>
                <div className="flex-1">
                  {editMode ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discounts[tier]}
                        onChange={(e) => handleInputChange('discounts', tier, parseInt(e.target.value))}
                        className="w-20 p-2 bg-white/10 border border-white/20 rounded-md"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  ) : (
                    <span>{formData.discounts[tier]}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Point Values */}
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <h3 className="text-xl font-medium mb-4">Point Values</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-32 font-medium">Booking</span>
              <div className="flex-1">
                {editMode ? (
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.pointValues.booking}
                    onChange={(e) => handlePointValueChange('booking', parseFloat(e.target.value))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md"
                  />
                ) : (
                  <span>{formData.pointValues.booking} points per booking</span>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">Purchase</span>
              <div className="flex-1">
                {editMode ? (
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.pointValues.purchase}
                    onChange={(e) => handlePointValueChange('purchase', parseFloat(e.target.value))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md"
                  />
                ) : (
                  <span>{formData.pointValues.purchase} points per dollar spent</span>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">Rental</span>
              <div className="flex-1">
                {editMode ? (
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.pointValues.rental}
                    onChange={(e) => handlePointValueChange('rental', parseFloat(e.target.value))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md"
                  />
                ) : (
                  <span>{formData.pointValues.rental} points per dollar spent</span>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-medium">Referral</span>
              <div className="flex-1">
                {editMode ? (
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.pointValues.referral}
                    onChange={(e) => handlePointValueChange('referral', parseFloat(e.target.value))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md"
                  />
                ) : (
                  <span>{formData.pointValues.referral} points per successful referral</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Point Expiry */}
        <div className="bg-white/5 p-6 rounded-lg border border-white/10">
          <h3 className="text-xl font-medium mb-4">Point Expiry</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-32 font-medium">Enable Expiry</span>
              <div className="flex-1">
                {editMode ? (
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.pointExpiry.enabled}
                        onChange={() => handleExpiryToggle(true)}
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={!formData.pointExpiry.enabled}
                        onChange={() => handleExpiryToggle(false)}
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                ) : (
                  <span>{formData.pointExpiry.enabled ? 'Yes' : 'No'}</span>
                )}
              </div>
            </div>
            {(formData.pointExpiry.enabled || editMode) && (
              <div className="flex items-center">
                <span className="w-32 font-medium">Duration</span>
                <div className="flex-1">
                  {editMode ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        value={formData.pointExpiry.durationDays}
                        onChange={(e) => handleExpiryDaysChange(parseInt(e.target.value))}
                        className="w-20 p-2 bg-white/10 border border-white/20 rounded-md"
                        disabled={!formData.pointExpiry.enabled}
                      />
                      <span className="ml-2">days</span>
                    </div>
                  ) : (
                    <span>{formData.pointExpiry.durationDays} days</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Points Management Section */}
      <div className="mt-8 bg-white/5 p-6 rounded-lg border border-white/10">
        <h3 className="text-xl font-medium mb-4">User Points Management</h3>
        <p className="text-white/70 mb-4">
          To add or adjust points for specific users, please use the User Management tab. 
          Select a user and use the "Manage Points" option.
        </p>
      </div>
    </div>
  );
};

export default RewardManagement;
