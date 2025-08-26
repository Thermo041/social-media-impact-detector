const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [5000, 'Post content cannot exceed 5000 characters']
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    enum: ['twitter', 'facebook', 'instagram', 'tiktok', 'youtube', 'reddit', 'other'],
    lowercase: true
  },
  originalUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  author: {
    username: {
      type: String,
      required: true,
      trim: true
    },
    profileUrl: {
      type: String,
      trim: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analysis: {
    category: {
      type: String,
      enum: ['fake_news', 'hate_speech', 'harassment', 'scam', 'misinformation', 'cyberbullying', 'sexual_harassment', 'violence', 'other'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    sentiment: {
      score: {
        type: Number,
        min: -1,
        max: 1,
        default: 0
      },
      label: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
        default: 'neutral'
      }
    },
    keywords: [{
      type: String,
      trim: true
    }],
    toxicity: {
      score: {
        type: Number,
        min: 0,
        max: 1,
        default: 0
      },
      categories: [{
        name: String,
        score: Number
      }]
    }
  },
  metadata: {
    timestamp: {
      type: Date,
      default: Date.now
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    }
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'disputed', 'false_positive'],
      default: 'pending'
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    level: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high'],
      default: 'very_low'
    },
    riskLevel: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    factors: [{
      factor: String,
      score: Number,
      status: {
        type: String,
        enum: ['pass', 'fail', 'partial', 'error']
      },
      reason: String
    }],
    metadata: {
      accessible: Boolean,
      title: String,
      description: String,
      author: String,
      publishDate: String,
      image: String,
      siteName: String,
      error: String,
      reason: String
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: [1000, 'Verification notes cannot exceed 1000 characters']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
postSchema.index({ 'analysis.category': 1, createdAt: -1 });
postSchema.index({ platform: 1, createdAt: -1 });
postSchema.index({ submittedBy: 1, createdAt: -1 });
postSchema.index({ 'verification.status': 1 });

module.exports = mongoose.model('Post', postSchema);
