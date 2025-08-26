const express = require('express');
const { query, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', optionalAuth, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalPosts = await Post.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    const postsThisMonth = await Post.countDocuments({ 
      isActive: true, 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const postsThisWeek = await Post.countDocuments({ 
      isActive: true, 
      createdAt: { $gte: sevenDaysAgo } 
    });

    // Category distribution
    const categoryStats = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$analysis.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Platform distribution
    const platformStats = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Verification status distribution
    const verificationStats = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$verification.status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Sentiment distribution
    const sentimentStats = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$analysis.sentiment.label', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Average toxicity by category
    const toxicityByCategory = await Post.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$analysis.category', 
          avgToxicity: { $avg: '$analysis.toxicity.score' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { avgToxicity: -1 } }
    ]);

    // Top keywords
    const topKeywords = await Post.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$analysis.keywords' },
      { $group: { _id: '$analysis.keywords', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      overview: {
        totalPosts,
        totalUsers,
        postsThisMonth,
        postsThisWeek,
        growthRate: totalPosts > 0 ? ((postsThisMonth / totalPosts) * 100).toFixed(1) : 0
      },
      distributions: {
        categories: categoryStats,
        platforms: platformStats,
        verification: verificationStats,
        sentiment: sentimentStats
      },
      insights: {
        toxicityByCategory,
        topKeywords: topKeywords.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard analytics',
      error: error.message
    });
  }
});

// Get time series data for trends
router.get('/trends', optionalAuth, [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be one of: 7d, 30d, 90d, 1y'),
  query('category')
    .optional()
    .isIn(['fake_news', 'hate_speech', 'harassment', 'scam', 'misinformation', 'cyberbullying', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const period = req.query.period || '30d';
    const category = req.query.category;

    // Calculate date range
    const now = new Date();
    let startDate;
    let groupFormat;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
    }

    // Build match criteria
    const matchCriteria = {
      isActive: true,
      createdAt: { $gte: startDate }
    };

    if (category) {
      matchCriteria['analysis.category'] = category;
    }

    // Get time series data
    const timeSeriesData = await Post.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          avgToxicity: { $avg: '$analysis.toxicity.score' },
          avgConfidence: { $avg: '$analysis.confidence' },
          categories: { $push: '$analysis.category' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get category breakdown for the period
    const categoryTrends = await Post.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            date: groupFormat,
            category: '$analysis.category'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1, '_id.category': 1 } }
    ]);

    res.json({
      period,
      startDate,
      endDate: now,
      timeSeries: timeSeriesData,
      categoryTrends
    });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch trends data',
      error: error.message
    });
  }
});

// Get detailed category analysis
router.get('/categories/:category', optionalAuth, async (req, res) => {
  try {
    const { category } = req.params;
    
    const validCategories = ['fake_news', 'hate_speech', 'harassment', 'scam', 'misinformation', 'cyberbullying', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: 'Invalid category'
      });
    }

    // Basic stats for the category
    const totalPosts = await Post.countDocuments({ 
      'analysis.category': category, 
      isActive: true 
    });

    // Platform distribution for this category
    const platformDistribution = await Post.aggregate([
      { $match: { 'analysis.category': category, isActive: true } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Average metrics
    const avgMetrics = await Post.aggregate([
      { $match: { 'analysis.category': category, isActive: true } },
      {
        $group: {
          _id: null,
          avgToxicity: { $avg: '$analysis.toxicity.score' },
          avgConfidence: { $avg: '$analysis.confidence' },
          avgSentiment: { $avg: '$analysis.sentiment.score' }
        }
      }
    ]);

    // Top keywords for this category
    const topKeywords = await Post.aggregate([
      { $match: { 'analysis.category': category, isActive: true } },
      { $unwind: '$analysis.keywords' },
      { $group: { _id: '$analysis.keywords', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Recent posts in this category
    const recentPosts = await Post.find({ 
      'analysis.category': category, 
      isActive: true 
    })
    .populate('submittedBy', 'username')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('content platform analysis.confidence analysis.toxicity.score createdAt submittedBy');

    // Verification status for this category
    const verificationStatus = await Post.aggregate([
      { $match: { 'analysis.category': category, isActive: true } },
      { $group: { _id: '$verification.status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      category,
      totalPosts,
      platformDistribution,
      averageMetrics: avgMetrics[0] || {
        avgToxicity: 0,
        avgConfidence: 0,
        avgSentiment: 0
      },
      topKeywords,
      recentPosts,
      verificationStatus
    });
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch category analytics',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/users/stats', optionalAuth, async (req, res) => {
  try {
    // Top contributors
    const topContributors = await User.aggregate([
      { $match: { isActive: true } },
      { $sort: { 'statistics.contributionScore': -1 } },
      { $limit: 10 },
      {
        $project: {
          username: 1,
          'profile.firstName': 1,
          'profile.lastName': 1,
          'statistics.postsSubmitted': 1,
          'statistics.postsVerified': 1,
          'statistics.contributionScore': 1
        }
      }
    ]);

    // User activity distribution
    const userActivity = await User.aggregate([
      { $match: { isActive: true } },
      {
        $bucket: {
          groupBy: '$statistics.postsSubmitted',
          boundaries: [0, 1, 5, 10, 25, 50, 100],
          default: '100+',
          output: {
            count: { $sum: 1 },
            users: { $push: '$username' }
          }
        }
      }
    ]);

    // Recent user registrations
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('username profile.firstName profile.lastName createdAt statistics');

    res.json({
      topContributors,
      userActivity,
      recentUsers
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

// Export data for external analysis
router.get('/export', optionalAuth, [
  query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
  query('category').optional(),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const format = req.query.format || 'json';
    const { category, startDate, endDate } = req.query;

    // Build filter
    const filter = { isActive: true };
    
    if (category) {
      filter['analysis.category'] = category;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const posts = await Post.find(filter)
      .populate('submittedBy', 'username')
      .select('content platform analysis metadata verification createdAt submittedBy')
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'ID,Content,Platform,Category,Confidence,Sentiment,Toxicity,Submitted By,Created At,Verification Status\n';
      const csvRows = posts.map(post => {
        const content = post.content.replace(/"/g, '""').replace(/\n/g, ' ');
        return `"${post._id}","${content}","${post.platform}","${post.analysis.category}","${post.analysis.confidence}","${post.analysis.sentiment.label}","${post.analysis.toxicity.score}","${post.submittedBy?.username || 'Unknown'}","${post.createdAt}","${post.verification.status}"`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="social_media_data.csv"');
      res.send(csvHeader + csvRows);
    } else {
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: posts.length,
        filters: { category, startDate, endDate },
        data: posts
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      message: 'Failed to export data',
      error: error.message
    });
  }
});

module.exports = router;
