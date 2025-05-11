import Instrument from '../models/Instrument.js';
import InstrumentRental from '../models/InstrumentRental.js';
import mongoose from 'mongoose';

// Create a new instrument
export const createInstrument = async (req, res) => {
  try {
    const { name, type, description, brand, condition, dailyRate } = req.body;
    
    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      // Create array of file paths
      images = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    const newInstrument = new Instrument({
      name,
      type,
      description,
      brand,
      condition,
      dailyRate,
      images
    });
    
    const savedInstrument = await newInstrument.save();
    
    res.status(201).json({
      success: true,
      message: 'Instrument created successfully',
      instrument: savedInstrument
    });
  } catch (error) {
    console.error('Error creating instrument:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create instrument',
      error: error.message
    });
  }
};

// Get all instruments
export const getAllInstruments = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = { isAvailable: true };
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    const instruments = await Instrument.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: instruments.length,
      instruments
    });
  } catch (error) {
    console.error('Error fetching instruments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instruments',
      error: error.message
    });
  }
};

// Get instrument by ID
export const getInstrumentById = async (req, res) => {
  try {
    const { instrumentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(instrumentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instrument ID format'
      });
    }
    
    const instrument = await Instrument.findById(instrumentId);
    
    if (!instrument) {
      return res.status(404).json({
        success: false,
        message: 'Instrument not found'
      });
    }
    
    res.status(200).json({
      success: true,
      instrument
    });
  } catch (error) {
    console.error('Error fetching instrument:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instrument',
      error: error.message
    });
  }
};

// Update instrument
export const updateInstrument = async (req, res) => {
  try {
    const { instrumentId } = req.params;
    const { name, type, description, brand, condition, dailyRate, isAvailable } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(instrumentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instrument ID format'
      });
    }
    
    const instrument = await Instrument.findById(instrumentId);
    
    if (!instrument) {
      return res.status(404).json({
        success: false,
        message: 'Instrument not found'
      });
    }
    
    // Update fields
    instrument.name = name || instrument.name;
    instrument.type = type || instrument.type;
    instrument.description = description || instrument.description;
    instrument.brand = brand || instrument.brand;
    instrument.condition = condition || instrument.condition;
    instrument.dailyRate = dailyRate || instrument.dailyRate;
    instrument.isAvailable = isAvailable !== undefined ? isAvailable : instrument.isAvailable;
    instrument.updatedAt = Date.now();
    
    // Process uploaded images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      instrument.images = [...instrument.images, ...newImages];
    }
    
    const updatedInstrument = await instrument.save();
    
    res.status(200).json({
      success: true,
      message: 'Instrument updated successfully',
      instrument: updatedInstrument
    });
  } catch (error) {
    console.error('Error updating instrument:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update instrument',
      error: error.message
    });
  }
};

// Delete instrument
export const deleteInstrument = async (req, res) => {
  try {
    const { instrumentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(instrumentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instrument ID format'
      });
    }
    
    // Check if there are any active rentals
    const activeRentals = await InstrumentRental.find({
      instrument: instrumentId,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (activeRentals.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete instrument with active rentals'
      });
    }
    
    const deletedInstrument = await Instrument.findByIdAndDelete(instrumentId);
    
    if (!deletedInstrument) {
      return res.status(404).json({
        success: false,
        message: 'Instrument not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Instrument deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting instrument:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete instrument',
      error: error.message
    });
  }
};

// Check instrument availability
export const checkInstrumentAvailability = async (req, res) => {
  try {
    const { instrumentId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(instrumentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instrument ID format'
      });
    }
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    // Convert date strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Find any overlapping rentals
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
    
    const isAvailable = overlappingRentals.length === 0;
    
    res.status(200).json({
      success: true,
      isAvailable,
      overlappingRentals: isAvailable ? [] : overlappingRentals
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
};
