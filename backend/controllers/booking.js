import Booking from '../models/Booking.js';
import Studio from '../models/Studio.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
import sendEmail from '../utils/sendEmail.js';

// Cancel a booking
export const cancelBooking = async (req, res) => {
    try {
      const { bookingId } = req.params;
      const userId = req.user.userId;
      
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking ID format'
        });
      }
      
      const booking = await Booking.findById(bookingId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check if the user is authorized to cancel this booking
      if (booking.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this booking'
        });
      }
      
      // Check if the booking is already cancelled
      if (booking.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'This booking is already cancelled'
        });
      }
      
      // Check if the booking is already completed
      if (booking.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a completed booking'
        });
      }
      
      // Check cancellation policy - if less than 24 hours before booking
      const now = new Date();
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(parseInt(booking.startTime.split(':')[0]), 0, 0, 0);
      
      const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);
      let cancellationFee = 0;
      
      if (hoursDifference < 24) {
        // Apply 50% cancellation fee for late cancellations
        cancellationFee = booking.totalAmount * 0.5;
      }
      
      // Update booking status
      booking.status = 'cancelled';
      booking.cancellationFee = cancellationFee;
      booking.updatedAt = Date.now();
      
      const updatedBooking = await booking.save();
      
      // Get studio and user details for the email
      const studio = await Studio.findById(booking.studio);
      const user = await User.findById(userId);
      
      // Format date for email
      const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Send cancellation confirmation email
      const emailSubject = `Booking Cancellation - ${studio.name}`;
      const emailText = `
  Hello ${user.name},
  
  Your booking has been successfully cancelled.
  
  Booking Details:
  - Studio: ${studio.name}
  - Date: ${formattedDate}
  - Time: ${booking.startTime} to ${booking.endTime}
  
  ${cancellationFee > 0 ? `A cancellation fee of $${cancellationFee.toFixed(2)} has been applied due to late cancellation (less than 24 hours before the booking).` : 'No cancellation fee has been applied.'}
  
  Thank you for using our service!
  
  Best regards,
  The Musical Team
      `;
      
      await sendEmail(user.email, emailSubject, emailText);
      
      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        booking: updatedBooking,
        cancellationFee
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: error.message
      });
    }
  };
  
// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { studioId, date, startTime, endTime, notes } = req.body;
    const userId = req.user.userId;
    
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID format'
      });
    }
    
    // Validate required fields
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, start time, and end time are required'
      });
    }
    
    // Find the studio
    const studio = await Studio.findById(studioId);
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }
    
    if (!studio.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This studio is not available for booking'
      });
    }
    
    // Parse times
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    if (startHour >= endHour) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }
    
    const totalHours = endHour - startHour;
    const totalAmount = totalHours * studio.hourlyRate;
    
    // Check if the time slot is available
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Find conflicting bookings
    const conflictingBookings = await Booking.find({
      studio: studioId,
      date: {
        $gte: bookingDate,
        $lt: nextDay
      },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        // New booking starts during an existing booking
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        // New booking ends during an existing booking
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        // New booking completely contains an existing booking
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    });
    
    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'The selected time slot is not available'
      });
    }
    
    // Create the booking
    const newBooking = new Booking({
      studio: studioId,
      user: userId,
      date: bookingDate,
      startTime,
      endTime,
      totalHours,
      totalAmount,
      notes
    });
    
    const savedBooking = await newBooking.save();
    
    // Get user details for the email
    const user = await User.findById(userId);
    
    // Format date for email
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Send booking confirmation email
    const emailSubject = `Booking Confirmation - ${studio.name}`;
    const emailText = `
Hello ${user.name},

Your booking has been successfully created.

Booking Details:
- Studio: ${studio.name}
- Date: ${formattedDate}
- Time: ${startTime} to ${endTime}
- Duration: ${totalHours} hour(s)
- Total Amount: $${totalAmount}

Booking Status: ${savedBooking.status}

You can view your booking details and status updates by logging into your account.

Thank you for using our service!

Best regards,
The Musical Team
    `;
    
    await sendEmail(user.email, emailSubject, emailText);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};


// Get all bookings for a user
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const bookings = await Booking.find({ user: userId })
      .populate('studio', 'name type location hourlyRate')
      .sort({ date: -1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }
    
    const booking = await Booking.findById(bookingId)
      .populate('studio', 'name type location hourlyRate images amenities')
      .populate('user', 'name email');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if the user is authorized to view this booking
    const user = await User.findById(userId);
    if (booking.user._id.toString() !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if the user is authorized to update this booking
    const user = await User.findById(userId);
    if (booking.user.toString() !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
    
    // If a user is cancelling a confirmed booking, check cancellation policy
    if (booking.status === 'confirmed' && status === 'cancelled' && booking.user.toString() === userId) {
      const now = new Date();
      const bookingDate = new Date(booking.date);
      const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);
      
      // If less than 24 hours before the booking, apply cancellation fee
      if (hoursDifference < 24) {
        // Logic for cancellation fee could be added here
        console.log('Late cancellation fee may apply');
      }
    }
    
    booking.status = status;
    booking.updatedAt = Date.now();
    
    const updatedBooking = await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }
    
    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status value'
      });
    }
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Only admins can update payment status
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update payment status'
      });
    }
    
    booking.paymentStatus = paymentStatus;
    booking.updatedAt = Date.now();
    
    const updatedBooking = await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// Get all bookings for a studio
export const getStudioBookings = async (req, res) => {
  try {
    const { studioId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID format'
      });
    }
    
    // Only admins can view all bookings for a studio
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view all studio bookings'
      });
    }
    
    const bookings = await Booking.find({ studio: studioId })
      .populate('user', 'name email')
      .sort({ date: -1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching studio bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch studio bookings',
      error: error.message
    });
  }
};

// Get all bookings (admin only)
export const getAllBookings = async (req, res) => {
  try {
    // Only admins can view all bookings
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view all bookings'
      });
    }
    
    const { status, date, studioType } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      query.status = status;
    }
    
    // Filter by date if provided
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }
    
    // Filter by studio type if provided
    if (studioType && ['practice', 'studio'].includes(studioType)) {
      // Need to join with Studio collection
      const studioIds = await Studio.find({ type: studioType }).distinct('_id');
      query.studio = { $in: studioIds };
    }
    
    const bookings = await Booking.find(query)
      .populate('studio', 'name type location hourlyRate')
      .populate('user', 'name email')
      .sort({ date: -1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};
