import mongoose from 'mongoose';

const instrumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['string', 'wind', 'percussion', 'electronic', 'other'],
    default: 'string'
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String
  }],
  isAvailable: {
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

const Instrument = mongoose.model('Instrument', instrumentSchema);

export default Instrument;
