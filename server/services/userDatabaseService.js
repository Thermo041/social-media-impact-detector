const mongoose = require('mongoose');

class UserDatabaseService {
  constructor() {
    this.userConnections = new Map();
  }

  // Get or create a database connection for a specific user
  async getUserConnection(userId) {
    if (this.userConnections.has(userId)) {
      return this.userConnections.get(userId);
    }

    try {
      // Create a separate database for each user
      const userDbName = `social-media-impact-user-${userId}`;
      const connectionString = process.env.MONGODB_URI.replace('/social-media-impact', `/${userDbName}`);
      
      const connection = await mongoose.createConnection(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log(`✅ Connected to user database: ${userDbName}`);
      
      this.userConnections.set(userId, connection);
      return connection;
    } catch (error) {
      console.error(`❌ Failed to connect to user database for ${userId}:`, error);
      throw error;
    }
  }

  // Get user-specific Post model
  async getUserPostModel(userId) {
    const connection = await this.getUserConnection(userId);
    
    // Define the Post schema for this user's database
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
      originalUrl: {
        type: String,
        validate: {
          validator: function(v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: 'Invalid URL format'
        }
      },
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
        required: true,
        default: userId
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
          score: {
            type: Number,
            min: -1,
            max: 1
          },
          label: {
            type: String,
            enum: ['positive', 'negative', 'neutral']
          }
        },
        keywords: [String],
        toxicity: {
          score: {
            type: Number,
            min: 0,
            max: 1
          },
          categories: {
            type: Map,
            of: Number
          }
        }
      },
      metadata: {
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
        views: {
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

    // Create indexes
    postSchema.index({ content: 'text' });
    postSchema.index({ platform: 1 });
    postSchema.index({ 'analysis.category': 1 });
    postSchema.index({ 'verification.status': 1 });
    postSchema.index({ createdAt: -1 });

    return connection.model('Post', postSchema);
  }

  // Close a user's database connection
  async closeUserConnection(userId) {
    if (this.userConnections.has(userId)) {
      const connection = this.userConnections.get(userId);
      await connection.close();
      this.userConnections.delete(userId);
      console.log(`🔒 Closed database connection for user: ${userId}`);
    }
  }

  // Close all user connections
  async closeAllConnections() {
    for (const [userId, connection] of this.userConnections) {
      await connection.close();
      console.log(`🔒 Closed database connection for user: ${userId}`);
    }
    this.userConnections.clear();
  }
}

module.exports = new UserDatabaseService();
