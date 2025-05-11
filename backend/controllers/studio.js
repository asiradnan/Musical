import Studio from '../models/Studio.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

// Create a new studio
export const createStudio = async (req, res) => {
  console.log('Received request to create studio');
  try {
    const { name, type, description, location, hourlyRate, amenities, capacity } = req.body;
    
    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      // Create array of file paths
      images = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    const newStudio = new Studio({
      name,
      type,
      description,
      location,
      hourlyRate,
      amenities: amenities || [],
      images,
      capacity
    });
    
    const savedStudio = await newStudio.save();
    
    res.status(201).json({
      success: true,
      message: 'Studio created successfully',
      studio: savedStudio
    });
  } catch (error) {
    console.error('Error creating studio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create studio',
      error: error.message
    });
  }
};

// Get all studios
export const getAllStudios = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = { isActive: true };
    
    // Filter by type if provided
    if (type && ['practice', 'studio'].includes(type)) {
      query.type = type;
    }
    
    const studios = await Studio.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: studios.length,
      studios
    });
  } catch (error) {
    console.error('Error fetching studios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch studios',
      error: error.message
    });
  }
};

// Get studio by ID
export const getStudioById = async (req, res) => {
  try {
    const { studioId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID format'
      });
    }
    
    const studio = await Studio.findById(studioId);
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }
    
    res.status(200).json({
      success: true,
      studio
    });
  } catch (error) {
    console.error('Error fetching studio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch studio',
      error: error.message
    });
  }
};

// Update studio
export const updateStudio = async (req, res) => {
  try {
    const { studioId } = req.params;
    const { name, type, description, location, hourlyRate, amenities, capacity, isActive } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID format'
      });
    }
    
    const studio = await Studio.findById(studioId);
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }
    
    // Update fields
    studio.name = name || studio.name;
    studio.type = type || studio.type;
    studio.description = description || studio.description;
    studio.location = location || studio.location;
    studio.hourlyRate = hourlyRate || studio.hourlyRate;
    studio.amenities = amenities || studio.amenities;
    studio.capacity = capacity || studio.capacity;
    studio.isActive = isActive !== undefined ? isActive : studio.isActive;
    studio.updatedAt = Date.now();
    
    // Process uploaded images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      studio.images = [...studio.images, ...newImages];
    }
    
    const updatedStudio = await studio.save();
    
    res.status(200).json({
      success: true,
      message: 'Studio updated successfully',
      studio: updatedStudio
    });
  } catch (error) {
    console.error('Error updating studio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update studio',
      error: error.message
    });
  }
};

// Delete studio
export const deleteStudio = async (req, res) => {
  try {
    const { studioId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID format'
      });
    }
    
    // Check if there are any active bookings
    const activeBookings = await Booking.find({
      studio: studioId,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete studio with active bookings'
      });
    }
    
    const deletedStudio = await Studio.findByIdAndDelete(studioId);
    
    if (!deletedStudio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Studio deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting studio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete studio',
      error: error.message
    });
  }
};

// Check studio availability
export const checkStudioAvailability = async (req, res) => {
  try {
    const { studioId } = req.params;
    const { date } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(studioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid studio ID format'
      });
    }
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // Convert date string to Date object
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Find all bookings for the studio on the specified date
    const bookings = await Booking.find({
      studio: studioId,
      date: {
        $gte: searchDate,
        $lt: nextDay
      },
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime');
    
    // Create an array of all hours in the day (assuming 24-hour operation)
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}:00` : `${i}:00`;
      hours.push({
        time: hour,
        available: true
      });
    }
    
    // Mark booked hours as unavailable
    bookings.forEach(booking => {
      const startHour = parseInt(booking.startTime.split(':')[0]);
      const endHour = parseInt(booking.endTime.split(':')[0]);
      
      for (let i = startHour; i < endHour; i++) {
        const index = hours.findIndex(h => h.time === (i < 10 ? `0${i}:00` : `${i}:00`));
        if (index !== -1) {
          hours[index].available = false;
        }
      }
    });
    
    res.status(200).json({
      success: true,
      date: searchDate,
      availability: hours
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
