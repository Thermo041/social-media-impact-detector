const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Post Schema
const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  platform: {
    type: String,
    required: true,
    enum: ['twitter', 'facebook', 'instagram', 'tiktok', 'youtube', 'reddit', 'other']
  },
  originalUrl: String,
  author: {
    username: {
      type: String,
      required: true
    },
    profileUrl: String,
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
      enum: ['violence', 'hate_speech', 'harassment', 'cyberbullying', 'sexual_harassment', 'fake_news', 'scam', 'misinformation', 'other'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    sentiment: {
      score: Number,
      label: {
        type: String,
        enum: ['positive', 'negative', 'neutral']
      }
    },
    toxicity: {
      score: {
        type: Number,
        min: 0,
        max: 1
      }
    },
    source: String,
    ai_used: Boolean,
    explanation: String
  },
  metadata: {
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'disputed', 'false_positive'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    notes: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Connect to MongoDB
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedConnection = connection;
  return connection;
}

// Auth middleware
const authenticateToken = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('Access token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();
    
    const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
    
    if (req.method === 'GET') {
      // Get user's posts
      const userId = authenticateToken(req);
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter - only user's posts
      const filter = { 
        isActive: true,
        submittedBy: userId
      };
      
      if (req.query.category) {
        filter['analysis.category'] = req.query.category;
      }
      
      if (req.query.platform) {
        filter.platform = req.query.platform;
      }
      
      if (req.query.status) {
        filter['verification.status'] = req.query.status;
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search };
      }

      const posts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Post.countDocuments(filter);

      res.json({
        posts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Posts API error:', error);
    res.status(500).json({
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
}
