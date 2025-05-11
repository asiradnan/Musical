import User from '../models/user.js';
import Release from '../models/release.js'; // You'll need to create this model
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// Get user releases
export const getUserReleases = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if user is an artist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can have releases' });
    }
    
    // Find releases for the user
    const releases = await Release.find({ artist: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      releases
    });
  } catch (error) {
    console.error('Error fetching releases:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add a new release
export const addRelease = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, platform, link } = req.body;
    
    // Check if user is an artist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can add releases' });
    }
    
    // Validate input
    if (!title || !platform || !link) {
      return res.status(400).json({ message: 'Title, platform, and link are required' });
    }
    
    // Validate platform
    if (!['youtube', 'spotify'].includes(platform)) {
      return res.status(400).json({ message: 'Platform must be either youtube or spotify' });
    }
    
    // Validate link format based on platform
    if (platform === 'youtube' && !link.includes('youtube.com') && !link.includes('youtu.be')) {
      return res.status(400).json({ message: 'Please provide a valid YouTube link' });
    }
    
    if (platform === 'spotify' && !link.includes('spotify.com')) {
      return res.status(400).json({ message: 'Please provide a valid Spotify link' });
    }
    
    // Create new release
    const newRelease = new Release({
      title,
      platform,
      link,
      artist: userId
    });
    
    await newRelease.save();
    
    res.status(201).json({
      success: true,
      message: 'Release added successfully',
      release: newRelease
    });
  } catch (error) {
    console.error('Error adding release:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a release
export const deleteRelease = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { releaseId } = req.params;
    
    // Find the release
    const release = await Release.findById(releaseId);
    if (!release) {
      return res.status(404).json({ message: 'Release not found' });
    }
    
    // Check if user owns the release
    if (release.artist.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own releases' });
    }
    
    // Delete the release
    await Release.findByIdAndDelete(releaseId);
    
    res.status(200).json({
      success: true,
      message: 'Release deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting release:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user success rate
export const getUserSuccessRate = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    // Find user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find success record for the user
    const successRecord = await Success.findOne({ reportedBy: userId });
    
    // Find total number of items reported by the user
    const totalReportedItems = await Item.countDocuments({ 
      reportedBy: userId,
      status: { $in: ['active', 'claimed', 'resolved', 'expired'] }
    });
    
    // Calculate success rate
    const successCount = successRecord ? successRecord.successCount : 0;
    const successRate = totalReportedItems > 0 
      ? (successCount / totalReportedItems) * 100 
      : 0;
    
    res.status(200).json({
      successCount,
      totalReportedItems,
      successRate: parseFloat(successRate.toFixed(2))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Find user
    let user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed
    if (email && email !== user.email) {
      // Check if new email already exists
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Generate new verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      
      // Update user with new email and verification token
      user.email = email;
      user.isEmailVerified = false;
      user.emailVerificationToken = emailVerificationToken;
      
      // Send verification email
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;
      await sendEmail(
        email,
        'Email Verification',
        `Please verify your new email by clicking the link: ${verificationUrl}`
      );
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send invitation
export const sendInvitation = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if invitation already sent
    const existingInvitation = await Invitation.findOne({ 
      email,
      accepted: false,
      expiresAt: { $gt: Date.now() }
    });
    
    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent to this email' });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Create invitation
    const invitation = new Invitation({
      email,
      invitedBy: req.user.userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await invitation.save();

    // Send invitation email
    const invitationUrl = `${process.env.CLIENT_URL}/register?token=${token}`;
    await sendEmail(
      email,
      'Invitation to Join',
      `You have been invited to join our platform. Please click the link to register: ${invitationUrl}`
    );

    res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile by ID (for public viewing)
export const getUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user by ID and exclude sensitive information
    const user = await User.findById(userId).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return limited information for public viewing
    const publicUserData = {
      id: user._id,
      name: user.name,
      email: user.isEmailVerified ? user.email : undefined, // Only show email if verified
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(200).json(publicUserData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
