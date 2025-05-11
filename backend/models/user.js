import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['standard', 'admin', 'artist'],
      default: 'standard'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Points system fields
    points: {
      total: {
        type: Number,
        default: 0
      },
      history: [{
        amount: Number,
        activity: {
          type: String,
          enum: ['booking', 'purchase', 'rental', 'referral', 'other'],
          required: true
        },
        description: String,
        referenceId: mongoose.Schema.Types.ObjectId, // ID of booking, purchase, etc.
        createdAt: {
          type: Date,
          default: Date.now
        },
        expiresAt: Date
      }]
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze'
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

const User = mongoose.model('User', UserSchema);
export default User;
