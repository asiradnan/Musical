import mongoose from 'mongoose';

const collaborationPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
collaborationPostSchema.index({ 
  title: 'text', 
  description: 'text',
  genre: 'text',
  location: 'text'
});

const CollaborationPost = mongoose.model('CollaborationPost', collaborationPostSchema);

export default CollaborationPost;
