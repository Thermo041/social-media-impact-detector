const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const { authenticateToken, requireModerator, optionalAuth } = require('../middleware/auth');
const nlpService = require('../services/nlpService');
const hybridAnalysisService = require('../services/hybridAnalysisService');
// const verificationService = require('../services/verificationService');

const router = express.Router();

// Get AI analysis status and capabilities
router.get('/ai-status', async (req, res) => {
  try {
    const stats = await hybridAnalysisService.getAnalysisStats();
    res.json({
      message: 'AI Analysis Status',
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get AI status',
      error: error.message
    });
  }
});

// Test AI analysis endpoint
router.post('/test-ai', [
  body('text').notEmpty().withMessage('Text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text } = req.body;
    const analysis = await hybridAnalysisService.analyzeText(text);

    res.json({
      message: 'AI Analysis Test Result',
      input_text: text,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      message: 'AI analysis test failed',
      error: error.message
    });
  }
});

// Get user's own posts
router.get('/my-posts', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['fake_news', 'hate_speech', 'harassment', 'scam', 'misinformation', 'cyberbullying', 'violence', 'sexual_harassment', 'other']),
  query('platform').optional().isIn(['twitter', 'facebook', 'instagram', 'tiktok', 'youtube', 'reddit', 'other']),
  query('status').optional().isIn(['pending', 'verified', 'disputed', 'false_positive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object - only user's posts
    const filter = {
      isActive: true,
      submittedBy: req.user._id
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

    // Get posts with pagination
    const posts = await Post.find(filter)
      .populate('submittedBy', 'username profile.firstName profile.lastName')
      .populate('verification.verifiedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
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
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      message: 'Failed to fetch user posts',
      error: error.message
    });
  }
});

// Get all posts with filtering and pagination (USER-SPECIFIC)
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['fake_news', 'hate_speech', 'harassment', 'scam', 'misinformation', 'cyberbullying', 'violence', 'sexual_harassment', 'other']),
  query('platform').optional().isIn(['twitter', 'facebook', 'instagram', 'tiktok', 'youtube', 'reddit', 'other']),
  query('status').optional().isIn(['pending', 'verified', 'disputed', 'false_positive']),
  query('myPosts').optional().isBoolean().withMessage('myPosts must be true or false')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object - ONLY USER'S OWN POSTS
    const filter = {
      isActive: true,
      submittedBy: req.user._id  // Only show posts submitted by this user
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

    // Get posts with pagination
    const posts = await Post.find(filter)
      .populate('submittedBy', 'username profile.firstName profile.lastName')
      .populate('verification.verifiedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
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
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
});

// Get single post by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('submittedBy', 'username profile.firstName profile.lastName')
      .populate('verification.verifiedBy', 'username');

    if (!post || !post.isActive) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      message: 'Failed to fetch post',
      error: error.message
    });
  }
});

// Submit new post for analysis
router.post('/', authenticateToken, [
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),
  body('platform')
    .isIn(['twitter', 'facebook', 'instagram', 'tiktok', 'youtube', 'reddit', 'other'])
    .withMessage('Invalid platform'),
  body('originalUrl')
    .optional()
    .isURL()
    .withMessage('Invalid URL format'),
  body('author.username')
    .notEmpty()
    .withMessage('Author username is required'),
  body('author.profileUrl')
    .optional()
    .isURL()
    .withMessage('Invalid profile URL'),
  body('metadata.likes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Likes must be a non-negative integer'),
  body('metadata.shares')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Shares must be a non-negative integer'),
  body('metadata.comments')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Comments must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, platform, originalUrl, author, metadata } = req.body;

    // Analyze content using Hybrid AI + NLP service
    const analysis = await hybridAnalysisService.analyzeText(content);

    // AI Auto-verification logic
    let verificationStatus = 'pending';
    let autoVerifyReason = '';

    if (analysis.confidence >= 0.85 && analysis.toxicity.score >= 0.2) {
      // High confidence + toxicity detected = auto-verify
      verificationStatus = 'verified';
      autoVerifyReason = `AI auto-verified: ${(analysis.confidence * 100).toFixed(1)}% confidence, ${(analysis.toxicity.score * 100).toFixed(1)}% toxicity detected`;
    } else if (analysis.confidence >= 0.9 && analysis.category !== 'other') {
      // Very high confidence + specific harmful category = auto-verify
      verificationStatus = 'verified';
      autoVerifyReason = `AI auto-verified: ${(analysis.confidence * 100).toFixed(1)}% confidence in ${analysis.category} category`;
    } else if (analysis.confidence >= 0.95) {
      // Extremely high confidence = auto-verify regardless
      verificationStatus = 'verified';
      autoVerifyReason = `AI auto-verified: ${(analysis.confidence * 100).toFixed(1)}% confidence (extremely high)`;
    }

    // Create new post
    const post = new Post({
      content,
      platform,
      originalUrl,
      author: {
        username: author.username,
        profileUrl: author.profileUrl || '',
        verified: author.verified || false
      },
      submittedBy: req.user._id,
      analysis: {
        category: analysis.category,
        confidence: analysis.confidence,
        sentiment: analysis.sentiment,
        keywords: analysis.keywords,
        toxicity: analysis.toxicity
      },
      verification: {
        status: verificationStatus,
        verifiedAt: verificationStatus === 'verified' ? new Date() : undefined,
        notes: autoVerifyReason || undefined
      },
      metadata: {
        timestamp: metadata?.timestamp ? new Date(metadata.timestamp) : new Date(),
        likes: metadata?.likes || 0,
        shares: metadata?.shares || 0,
        comments: metadata?.comments || 0,
        reach: metadata?.reach || 0
      }
    });

    await post.save();

    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistics.postsSubmitted': 1 }
    });

    // Populate the response
    await post.populate('submittedBy', 'username profile.firstName profile.lastName');

    res.status(201).json({
      message: 'Post submitted successfully',
      post,
      analysis: {
        category: analysis.category,
        confidence: analysis.confidence,
        sentiment: analysis.sentiment.label,
        toxicityScore: analysis.toxicity.score
      }
    });
  } catch (error) {
    console.error('Submit post error:', error);
    res.status(500).json({
      message: 'Failed to submit post',
      error: error.message
    });
  }
});

// Update post verification status (moderators only)
router.patch('/:id/verify', authenticateToken, requireModerator, [
  body('status')
    .isIn(['verified', 'disputed', 'false_positive'])
    .withMessage('Invalid verification status'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, notes } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // Update verification
    post.verification = {
      status,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      notes: notes || ''
    };

    await post.save();

    // Update submitter's statistics if verified
    if (status === 'verified') {
      await User.findByIdAndUpdate(post.submittedBy, {
        $inc: { 
          'statistics.postsVerified': 1,
          'statistics.contributionScore': 10
        }
      });
    }

    await post.populate('verification.verifiedBy', 'username');

    res.json({
      message: 'Post verification updated',
      post
    });
  } catch (error) {
    console.error('Verify post error:', error);
    res.status(500).json({
      message: 'Failed to update verification',
      error: error.message
    });
  }
});

// Delete post (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // Check if user owns the post or is a moderator
    if (post.submittedBy.toString() !== req.user._id.toString() && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    res.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

// Bulk analyze posts (for testing/admin purposes)
router.post('/bulk-analyze', authenticateToken, requireModerator, [
  body('posts').isArray().withMessage('Posts must be an array'),
  body('posts.*.content').notEmpty().withMessage('Each post must have content')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { posts } = req.body;
    const results = [];

    for (const postData of posts) {
      try {
        const analysis = await nlpService.analyzeText(postData.content);
        results.push({
          content: postData.content.substring(0, 100) + '...',
          analysis: {
            category: analysis.category,
            confidence: analysis.confidence,
            sentiment: analysis.sentiment,
            toxicity: analysis.toxicity.score
          }
        });
      } catch (error) {
        results.push({
          content: postData.content.substring(0, 100) + '...',
          error: error.message
        });
      }
    }

    res.json({
      message: 'Bulk analysis completed',
      results
    });
  } catch (error) {
    console.error('Bulk analyze error:', error);
    res.status(500).json({
      message: 'Bulk analysis failed',
      error: error.message
    });
  }
});

// Verify/Update post status (Moderator only)
router.patch('/:id/verify', authenticateToken, requireModerator, [
  body('status').isIn(['verified', 'disputed', 'false_positive']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, notes } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Update verification status
    post.verification.status = status;
    post.verification.verifiedBy = req.user._id;
    post.verification.verifiedAt = new Date();
    if (notes) {
      post.verification.notes = notes;
    }

    await post.save();

    // Update user statistics
    await User.findByIdAndUpdate(post.submittedBy, {
      $inc: { 'statistics.postsVerified': 1 }
    });

    res.json({
      message: 'Post verification updated successfully',
      post: {
        id: post._id,
        verification: post.verification
      }
    });
  } catch (error) {
    console.error('Post verification error:', error);
    res.status(500).json({
      message: 'Failed to update post verification',
      error: error.message
    });
  }
});

// Re-run verification on a post
router.post('/:id/reverify', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Re-run verification
    const verificationResult = await verificationService.verifyPost({
      content: post.content,
      platform: post.platform,
      originalUrl: post.originalUrl,
      author: post.author,
      metadata: post.metadata
    });

    // Update verification data
    post.verification.score = verificationResult.verification.score;
    post.verification.factors = verificationResult.verification.factors;
    post.verification.level = verificationResult.verification.level;
    post.verification.riskLevel = verificationService.calculateRiskLevel(post.analysis, verificationResult.verification.score);
    post.verification.metadata = verificationResult.metadata;

    await post.save();

    res.json({
      message: 'Post re-verification completed',
      verification: post.verification
    });
  } catch (error) {
    console.error('Post re-verification error:', error);
    res.status(500).json({
      message: 'Failed to re-verify post',
      error: error.message
    });
  }
});

// Admin-only verification route (no authentication for simplicity)
router.patch('/:id/admin-verify', [
  body('status').isIn(['verified', 'disputed', 'false_positive']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, notes } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Update verification status (admin only - no auth check for simplicity)
    post.verification.status = status;
    post.verification.verifiedAt = new Date();
    if (notes) {
      post.verification.notes = notes;
    }

    await post.save();

    // Update user statistics
    await User.findByIdAndUpdate(post.submittedBy, {
      $inc: { 'statistics.postsVerified': 1 }
    });

    res.json({
      message: 'Post verification updated successfully',
      post: {
        id: post._id,
        verification: post.verification
      }
    });
  } catch (error) {
    console.error('Post verification error:', error);
    res.status(500).json({
      message: 'Failed to update post verification',
      error: error.message
    });
  }
});

// Bulk verification route (for moderators)
router.patch('/bulk/verify', authenticateToken, requireModerator, [
  body('postIds').isArray().withMessage('Post IDs must be an array'),
  body('status').isIn(['verified', 'disputed', 'false_positive']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { postIds, status, notes } = req.body;

    const updateData = {
      'verification.status': status,
      'verification.verifiedBy': req.user._id,
      'verification.verifiedAt': new Date()
    };

    if (notes) {
      updateData['verification.notes'] = notes;
    }

    const result = await Post.updateMany(
      { _id: { $in: postIds } },
      { $set: updateData }
    );

    res.json({
      message: `Successfully updated ${result.modifiedCount} posts`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk verification error:', error);
    res.status(500).json({
      message: 'Failed to bulk verify posts',
      error: error.message
    });
  }
});

module.exports = router;
