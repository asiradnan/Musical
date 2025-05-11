import mongoose from 'mongoose';

const RewardConfigSchema = new mongoose.Schema({
  tierThresholds: {
    Bronze: {
      type: Number,
      default: 0
    },
    Silver: {
      type: Number,
      default: 100
    },
    Gold: {
      type: Number,
      default: 500
    },
    Platinum: {
      type: Number,
      default: 1000
    }
  },
  discounts: {
    Bronze: {
      type: Number,
      default: 5 // 5%
    },
    Silver: {
      type: Number,
      default: 10 // 10%
    },
    Gold: {
      type: Number,
      default: 15 // 15%
    },
    Platinum: {
      type: Number,
      default: 20 // 20%
    }
  },
  pointValues: {
    booking: {
      type: Number,
      default: 10 // Points per booking
    },
    purchase: {
      type: Number,
      default: 1 // Points per dollar spent
    },
    rental: {
      type: Number,
      default: 0.5 // Points per dollar spent
    },
    referral: {
      type: Number,
      default: 50 // Points per successful referral
    }
  },
  pointExpiry: {
    enabled: {
      type: Boolean,
      default: true
    },
    durationDays: {
      type: Number,
      default: 365 // Points expire after 1 year
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Ensure there's only one configuration document
RewardConfigSchema.statics.getConfig = async function() {
  const config = await this.findOne();
  if (config) {
    return config;
  }
  
  // Create default config if none exists
  return await this.create({});
};

const RewardConfig = mongoose.model('RewardConfig', RewardConfigSchema);
export default RewardConfig;
