import User from '../models/user.js';
import RewardConfig from '../models/rewardConfig.js';
import mongoose from 'mongoose';

// Helper function to update user tier based on points
const updateUserTier = async (userId, config) => {
  const user = await User.findById(userId);
  if (!user) return null;
  config = await RewardConfig.getConfig();
  const { tierThresholds } = config;
  const totalPoints = user.points.total;
  
  let newTier = 'Bronze';
  if (totalPoints >= tierThresholds.Platinum) {
    newTier = 'Platinum';
  } else if (totalPoints >= tierThresholds.Gold) {
    newTier = 'Gold';
  } else if (totalPoints >= tierThresholds.Silver) {
    newTier = 'Silver';
  }
  
  if (user.tier !== newTier) {
    user.tier = newTier;
    await user.save();
  }
  console.log('User tier updated:', user);
  
  return user;
};
// Get user rewards (including points, tier, and discount)
export const getUserRewards = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the requesting user is either checking their own rewards
    // or is an admin (for security)
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized: You can only view your own rewards' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    const config = await RewardConfig.getConfig();
    
    // Return comprehensive reward information
    return res.status(200).json({
      success: true,
      _id: user._id,
      points: user.points.total,
      tier: user.tier,
      discount: config.discounts[user.tier],
      history: user.points.history.slice(-5), // Return only the 5 most recent entries
      nextTier: getNextTier(user.tier, user.points.total, config)
    });
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// Add points to a user
export const addPoints = async (req, res) => {
  try {
    console.log('addPoints function called');
    const { userId, amount, activity, description, referenceId } = req.body;
    
    if (!userId || !amount || !activity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const config = await RewardConfig.getConfig();
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user);
    
    // Calculate expiry date if enabled
    let expiresAt = null;
    if (config.pointExpiry.enabled) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + config.pointExpiry.durationDays);
    }
    
    // Add points to user
    user.points.history.push({
      amount,
      activity,
      description: description || `Points for ${activity}`,
      referenceId: referenceId || null,
      expiresAt
    });
    console.log('Points added to user:', user);
    
    user.points.total += amount;
    await user.save();
    console.log('Points saved to user:', user);
    
    // Update user tier based on new points total
    await updateUserTier(userId, config);
    console.log('User tier updated:', user);
    
    res.status(200).json({
      message: 'Points added successfully',
      currentPoints: user.points.total,
      tier: user.tier
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// Add points for a user (used during checkout)
export const addUserPoints = async (req, res) => {
  try {
    const { userId, amount, activity, description, referenceId } = req.body;
    
    // Verify the requesting user is either adding points to their own account
    // or is an admin (additional security check)
    if (req.user.userId !== userId ) {
      console.log('Unauthorized:', req.user.userId, userId);  
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized: You can only add points to your own account' 
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Calculate expiration date (points expire after 1 year)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    
    // Add points to user's history
    user.points.history.push({
      amount,
      activity,
      description,
      referenceId,
      createdAt: new Date(),
      expiresAt
    });
    
    // Update total points
    user.points.total += amount;
    
    // Check if user should be upgraded to a new tier
    await updateUserTier(user);
    
    // Save the user
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: `${amount} points added successfully`,
      currentPoints: user.points.total,
      tier: user.tier
    });
  } catch (error) {
    console.error('Error adding points:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// Get user points and tier
export const getUserPoints = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const config = await RewardConfig.getConfig();
    
    res.status(200).json({
      points: user.points.total,
      tier: user.tier,
      discount: config.discounts[user.tier],
      history: user.points.history,
      nextTier: getNextTier(user.tier, user.points.total, config)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper to get next tier info
const getNextTier = (currentTier, points, config) => {
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex === tiers.length - 1) {
    return null; // Already at highest tier
  }
  
  const nextTier = tiers[currentIndex + 1];
  const pointsNeeded = config.tierThresholds[nextTier] - points;
  
  return {
    tier: nextTier,
    pointsNeeded,
    discount: config.discounts[nextTier]
  };
};

// Get reward system configuration
export const getRewardConfig = async (req, res) => {
  try {
    const config = await RewardConfig.getConfig();
    res.status(200).json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update reward system configuration
export const updateRewardConfig = async (req, res) => {
  try {
    const {
      tierThresholds,
      discounts,
      pointValues,
      pointExpiry
    } = req.body;
    
    const config = await RewardConfig.getConfig();
    
    // Update configuration with new values
    if (tierThresholds) config.tierThresholds = { ...config.tierThresholds, ...tierThresholds };
    if (discounts) config.discounts = { ...config.discounts, ...discounts };
    if (pointValues) config.pointValues = { ...config.pointValues, ...pointValues };
    if (pointExpiry) config.pointExpiry = { ...config.pointExpiry, ...pointExpiry };
    
    config.updatedAt = new Date();
    config.updatedBy = req.user.userId;
    
    await config.save();
    
    // Update all users' tiers based on new thresholds
    const users = await User.find({});
    for (const user of users) {
      await updateUserTier(user._id, config);
    }
    
    res.status(200).json({
      message: 'Reward configuration updated successfully',
      config
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Process expired points (could be run as a scheduled job)
export const processExpiredPoints = async (req, res) => {
  try {
    const config = await RewardConfig.getConfig();
    if (!config.pointExpiry.enabled) {
      return res.status(200).json({ message: 'Point expiry is disabled' });
    }
    
    const now = new Date();
    const users = await User.find({
      'points.history.expiresAt': { $lt: now }
    });
    
    let totalProcessed = 0;
    
    for (const user of users) {
      let pointsToDeduct = 0;
      
      // Find expired points
      user.points.history = user.points.history.filter(point => {
        if (point.expiresAt && point.expiresAt < now) {
          pointsToDeduct += point.amount;
          return false;
        }
        return true;
      });
      
      // Update total points
      user.points.total -= pointsToDeduct;
      if (user.points.total < 0) user.points.total = 0;
      
      if (pointsToDeduct > 0) {
        await user.save();
        await updateUserTier(user._id, config);
        totalProcessed++;
      }
    }
    
    res.status(200).json({
      message: 'Expired points processed successfully',
      usersProcessed: totalProcessed
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
