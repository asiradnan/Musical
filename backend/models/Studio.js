import mongoose from 'mongoose';

const studioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['practice', 'studio'],
    default: 'practice'
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Studio = mongoose.model('Studio', studioSchema);

export default Studio;
