import User from '../models/user.js';
import bcrypt from 'bcryptjs';
// Add these functions to the existing admin.js controller

import Booking from '../models/Booking.js';

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('studio', 'name location')
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }
    if (booking.createdAt - Date.now() < 24 * 60 * 60) {
      return res.status(400).json({ message: 'Booking cannot be cancelled within 24 hours of booking' });
    }
    
    booking.status = 'cancelled';
    const reason = 'Cancelled by admin';
    booking.cancelReason = reason || 'Cancelled by admin';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.userId;
    booking.updatedAt = new Date();
    
    await booking.save();
    
    // You might want to add notification logic here to inform the user
    
    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent restricting self
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'Cannot restrict your own account' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent restricting other admins
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot restrict admin accounts' });
    }

    await user.deleteOne();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Activate user
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({ message: 'User activated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedUser', 'name email')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find report
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    report.updatedAt = Date.now();
    await report.save();

    res.status(200).json({
      message: 'Report status updated successfully',
      report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllClaims = async (req, res) => {
  try {
    console.log("Inside getAllClaims");
    const { status } = req.query;
    let query = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const claims = await Claim.find(query)
      .populate('claimant', 'name email avatar')
      .populate({
        path: 'item',
        select: 'title type category status images',
        populate: {
          path: 'reportedBy',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      claims
    });
  } catch (error) {
    console.error('Error fetching all claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
      error: error.message
    });
  }
};

export const getAllItems = async (req, res) => {
  console.log('getAllItems function called');
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    
    // Location-based filtering
    if (req.query.location) {
      filter['location.name'] = { $regex: req.query.location, $options: 'i' };
    }
    
    // Date range filtering
    if (req.query.fromDate || req.query.toDate) {
      filter.dateLostOrFound = {};
      if (req.query.fromDate) filter.dateLostOrFound.$gte = new Date(req.query.fromDate);
      if (req.query.toDate) filter.dateLostOrFound.$lte = new Date(req.query.toDate);
    }

    // If user ID is provided, filter by user
    if (req.query.userId) {
      filter.reportedBy = req.query.userId;
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reportedBy', 'name email avatar averageRating')
      .populate({
        path: 'claims',
        model: 'Claim',
        populate: [
          {
            path: 'claimant',
            model: 'User',
            select: 'name email avatar'
          }
        ],
        select: 'status proofOfOwnership identifyingInformation createdAt meetupDetails'
      });

    const totalItems = await Item.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalItems,
      items
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error.message
    });
  }
};