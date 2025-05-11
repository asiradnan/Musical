import InstrumentRental from '../models/InstrumentRental.js';
import Instrument from '../models/Instrument.js';
import mongoose from 'mongoose';

// Create a new instrument rental
export const createRental = async (req, res) => {
  console.log("Received request to create instrument:", req.body);

  try {
    const { instrumentId, startDate, endDate, notes } = req.body;
    const userId = req.user.userId;
    console.log(req.user)
    if (!mongoose.Types.ObjectId.isValid(instrumentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instrument ID format'
      });
    }
    
    // Find the instrument
    const instrument = await Instrument.findById(instrumentId);
    
    if (!instrument) {
      return res.status(404).json({
        success: false,
        message: 'Instrument not found'
      });
    }
    
    if (!instrument.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Instrument is not available for rental'
      });
    }
    
    // Convert date strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate total days (including start and end date)
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (totalDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rental period'
      });
    }
    
    // Calculate total amount
    const totalAmount = totalDays * instrument.dailyRate;
    
    // Check if instrument is available for the requested period
    const overlappingRentals = await InstrumentRental.find({
      instrument: instrumentId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        // Rental starts during requested period
        { startDate: { $gte: start, $lte: end } },
        // Rental ends during requested period
        { endDate: { $gte: start, $lte: end } },
        // Rental encompasses requested period
        { startDate: { $lte: start }, endDate: { $gte: end } }
      ]
    });
    
    if (overlappingRentals.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Instrument is not available for the requested period'
      });
    }
    
    // Create new rental
    const newRental = new InstrumentRental({
      instrument: instrumentId,
      user: userId,
      startDate: start,
      endDate: end,
      totalDays,
      totalAmount,
      notes
    });
    
    const savedRental = await newRental.save();
    
    res.status(201).json({
      success: true,
      message: 'Instrument rental created successfully',
      rental: savedRental
    });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create rental',
      error: error.message
    });
  }
};

// Get user's rentals
export const getUserRentals = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const rentals = await InstrumentRental.find({ user: userId })
      .populate('instrument')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals
    });
  } catch (error) {
    console.error('Error fetching user rentals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rentals',
      error: error.message
    });
  }
};

// Get rental by ID
// Continuing from where we left off...

// Get rental by ID
export const getRentalById = async (req, res) => {
    try {
      const { rentalId } = req.params;
      const userId = req.user.userId;
      
      if (!mongoose.Types.ObjectId.isValid(rentalId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid rental ID format'
        });
      }
      
      const rental = await InstrumentRental.findById(rentalId)
        .populate('instrument');
      
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }
      
      // Check if the user is the owner of the rental or an admin
      if (rental.user.toString() !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this rental'
        });
      }
      
      res.status(200).json({
        success: true,
        rental
      });
    } catch (error) {
      console.error('Error fetching rental:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rental',
        error: error.message
      });
    }
  };
  
  // Update rental status
  export const updateRentalStatus = async (req, res) => {
    try {
      const { rentalId } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;
      
      if (!mongoose.Types.ObjectId.isValid(rentalId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid rental ID format'
        });
      }
      
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      
      const rental = await InstrumentRental.findById(rentalId);
      
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }
      
      // Check if the user is the owner of the rental or an admin
      if (rental.user.toString() !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this rental'
        });
      }
      
      // Only allow cancellation if the rental is not already completed
      if (status === 'cancelled' && rental.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a completed rental'
        });
      }
      
      rental.status = status;
      rental.updatedAt = Date.now();
      
      const updatedRental = await rental.save();
      
      res.status(200).json({
        success: true,
        message: 'Rental status updated successfully',
        rental: updatedRental
      });
    } catch (error) {
      console.error('Error updating rental status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update rental status',
        error: error.message
      });
    }
  };
  
  // Update payment status (admin only)
  export const updatePaymentStatus = async (req, res) => {
    try {
      const { rentalId } = req.params;
      const { paymentStatus } = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(rentalId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid rental ID format'
        });
      }
      
      if (!['pending', 'paid', 'refunded'].includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }
      
      const rental = await InstrumentRental.findById(rentalId);
      
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }
      
      rental.paymentStatus = paymentStatus;
      rental.updatedAt = Date.now();
      
      const updatedRental = await rental.save();
      
      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
        rental: updatedRental
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
  
  // Get all rentals for an instrument
  export const getInstrumentRentals = async (req, res) => {
    try {
      const { instrumentId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(instrumentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid instrument ID format'
        });
      }
      
      const rentals = await InstrumentRental.find({ instrument: instrumentId })
        .populate('user', 'username email')
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        count: rentals.length,
        rentals
      });
    } catch (error) {
      console.error('Error fetching instrument rentals:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rentals',
        error: error.message
      });
    }
  };
  
  // Get all rentals (admin only)
  export const getAllRentals = async (req, res) => {
    try {
      const { status, paymentStatus } = req.query;
      
      let query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
      }
      
      const rentals = await InstrumentRental.find(query)
        .populate('instrument')
        .populate('user', 'username email')
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        count: rentals.length,
        rentals
      });
    } catch (error) {
      console.error('Error fetching all rentals:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rentals',
        error: error.message
      });
    }
  };
  
  // Cancel rental
  export const cancelRental = async (req, res) => {
    try {
      const { rentalId } = req.params;
      const userId = req.user.userId;
      
      if (!mongoose.Types.ObjectId.isValid(rentalId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid rental ID format'
        });
      }
      
      const rental = await InstrumentRental.findById(rentalId);
      
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }
      
      // Check if the user is the owner of the rental or an admin
      if (rental.user.toString() !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this rental'
        });
      }
      
      // Only allow cancellation if the rental is not already completed
      if (rental.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a completed rental'
        });
      }
      
      rental.status = 'cancelled';
      rental.updatedAt = Date.now();
      
      const updatedRental = await rental.save();
      
      res.status(200).json({
        success: true,
        message: 'Rental cancelled successfully',
        rental: updatedRental
      });
    } catch (error) {
      console.error('Error cancelling rental:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel rental',
        error: error.message
      });
    }
  };
  
