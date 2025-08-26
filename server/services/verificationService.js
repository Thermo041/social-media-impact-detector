const axios = require('axios');
const cheerio = require('cheerio');

class VerificationService {
  constructor() {
    this.platformPatterns = {
      twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/,
      instagram: /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/,
      facebook: /^https?:\/\/(www\.)?facebook\.com\/\w+\/posts\/\d+/,
      youtube: /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/,
      reddit: /^https?:\/\/(www\.)?reddit\.com\/r\/\w+\/comments\/\w+/
    };
  }

  // Validate if URL matches the claimed platform
  validatePlatformUrl(url, claimedPlatform) {
    if (!url) return { valid: false, reason: 'No URL provided' };
    
    const pattern = this.platformPatterns[claimedPlatform.toLowerCase()];
    if (!pattern) {
      return { valid: true, reason: 'Platform pattern not defined, assuming valid' };
    }
    
    const isValid = pattern.test(url);
    return {
      valid: isValid,
      reason: isValid ? 'URL matches platform pattern' : `URL doesn't match ${claimedPlatform} pattern`
    };
  }

  // Extract metadata from URL (basic scraping)
  async extractMetadata(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      return {
        title: $('title').text() || $('meta[property="og:title"]').attr('content') || '',
        description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '',
        author: $('meta[name="author"]').attr('content') || '',
        publishDate: $('meta[property="article:published_time"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || '',
        siteName: $('meta[property="og:site_name"]').attr('content') || '',
        accessible: true
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message,
        reason: 'Could not access URL or extract metadata'
      };
    }
  }

  // Calculate verification score based on multiple factors
  calculateVerificationScore(postData, metadata = null) {
    let score = 0;
    const factors = [];

    // Factor 1: URL validation (20 points)
    if (postData.originalUrl) {
      const urlValidation = this.validatePlatformUrl(postData.originalUrl, postData.platform);
      if (urlValidation.valid) {
        score += 20;
        factors.push({ factor: 'URL Pattern Match', score: 20, status: 'pass' });
      } else {
        factors.push({ factor: 'URL Pattern Match', score: 0, status: 'fail', reason: urlValidation.reason });
      }
    } else {
      factors.push({ factor: 'URL Pattern Match', score: 0, status: 'fail', reason: 'No URL provided' });
    }

    // Factor 2: Author verification (15 points)
    if (postData.author.verified) {
      score += 15;
      factors.push({ factor: 'Verified Author', score: 15, status: 'pass' });
    } else {
      factors.push({ factor: 'Verified Author', score: 0, status: 'fail', reason: 'Author not verified' });
    }

    // Factor 3: Author profile URL (10 points)
    if (postData.author.profileUrl) {
      score += 10;
      factors.push({ factor: 'Author Profile URL', score: 10, status: 'pass' });
    } else {
      factors.push({ factor: 'Author Profile URL', score: 0, status: 'fail', reason: 'No profile URL provided' });
    }

    // Factor 4: Content quality (20 points)
    const contentLength = postData.content.length;
    if (contentLength > 50 && contentLength < 2000) {
      score += 20;
      factors.push({ factor: 'Content Quality', score: 20, status: 'pass' });
    } else if (contentLength <= 50) {
      score += 5;
      factors.push({ factor: 'Content Quality', score: 5, status: 'partial', reason: 'Content too short' });
    } else {
      score += 10;
      factors.push({ factor: 'Content Quality', score: 10, status: 'partial', reason: 'Content very long' });
    }

    // Factor 5: Metadata consistency (20 points)
    if (metadata && metadata.accessible) {
      let metadataScore = 0;
      if (metadata.title) metadataScore += 5;
      if (metadata.author) metadataScore += 5;
      if (metadata.publishDate) metadataScore += 5;
      if (metadata.siteName) metadataScore += 5;
      
      score += metadataScore;
      factors.push({ factor: 'Metadata Available', score: metadataScore, status: metadataScore > 10 ? 'pass' : 'partial' });
    } else if (metadata && !metadata.accessible) {
      factors.push({ factor: 'Metadata Available', score: 0, status: 'fail', reason: 'URL not accessible' });
    }

    // Factor 6: Engagement metrics (15 points)
    const hasEngagement = postData.metadata && (
      postData.metadata.likes > 0 || 
      postData.metadata.shares > 0 || 
      postData.metadata.comments > 0
    );
    
    if (hasEngagement) {
      score += 15;
      factors.push({ factor: 'Engagement Metrics', score: 15, status: 'pass' });
    } else {
      factors.push({ factor: 'Engagement Metrics', score: 0, status: 'fail', reason: 'No engagement data' });
    }

    return {
      score: Math.min(score, 100), // Cap at 100
      factors,
      level: this.getVerificationLevel(score)
    };
  }

  // Get verification level based on score
  getVerificationLevel(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'very_low';
  }

  // Get risk level based on analysis and verification
  calculateRiskLevel(analysis, verificationScore) {
    const toxicityScore = analysis.toxicity.score * 100;
    const confidence = analysis.confidence * 100;
    
    // High toxicity + low verification = high risk
    if (toxicityScore > 70 && verificationScore < 40) return 'critical';
    if (toxicityScore > 50 && verificationScore < 60) return 'high';
    if (toxicityScore > 30 || verificationScore < 40) return 'medium';
    if (toxicityScore > 10 || verificationScore < 60) return 'low';
    return 'very_low';
  }

  // Main verification function
  async verifyPost(postData) {
    try {
      let metadata = null;
      
      // Extract metadata if URL is provided
      if (postData.originalUrl) {
        metadata = await this.extractMetadata(postData.originalUrl);
      }
      
      // Calculate verification score
      const verification = this.calculateVerificationScore(postData, metadata);
      
      return {
        success: true,
        verification,
        metadata,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        verification: {
          score: 0,
          factors: [{ factor: 'Verification Process', score: 0, status: 'error', reason: error.message }],
          level: 'very_low'
        }
      };
    }
  }
}

module.exports = new VerificationService();
