const nlpService = require('./nlpService');
const aiAnalysisService = require('./aiAnalysisService');

class HybridAnalysisService {
  constructor() {
    this.useAI = process.env.USE_AI_ANALYSIS === 'true';
    this.aiPriority = process.env.AI_PRIORITY || 'gemini'; // gemini, huggingface, perspective, combined
  }

  async analyzeText(text) {
    try {
      // Always get local NLP analysis first (fast and reliable)
      const localAnalysis = await nlpService.analyzeText(text);
      
      if (!this.useAI) {
        // Return only local analysis if AI is disabled
        return {
          ...localAnalysis,
          source: 'local_nlp',
          ai_used: false
        };
      }

      // Get AI analysis for enhanced accuracy
      let aiAnalysis = null;
      try {
        switch (this.aiPriority) {
          case 'gemini':
            aiAnalysis = await aiAnalysisService.analyzeWithGemini(text);
            break;
          case 'huggingface':
            aiAnalysis = await aiAnalysisService.analyzeWithHuggingFace(text);
            break;
          case 'perspective':
            aiAnalysis = await aiAnalysisService.analyzeWithPerspective(text);
            break;
          case 'combined':
            aiAnalysis = await aiAnalysisService.analyzeWithMultipleAI(text);
            break;
          default:
            aiAnalysis = await aiAnalysisService.analyzeWithGemini(text);
        }
      } catch (aiError) {
        console.warn('AI analysis failed, falling back to local NLP:', aiError.message);
        return {
          ...localAnalysis,
          source: 'local_nlp_fallback',
          ai_used: false,
          ai_error: aiError.message
        };
      }

      // Combine local and AI analysis for best results
      return this.combineAnalyses(localAnalysis, aiAnalysis, text);

    } catch (error) {
      console.error('Hybrid analysis error:', error);
      // Fallback to basic analysis
      return {
        category: 'other',
        confidence: 0,
        sentiment: { score: 0, label: 'neutral' },
        keywords: [],
        toxicity: { score: 0, categories: {} },
        source: 'error_fallback',
        ai_used: false,
        error: error.message
      };
    }
  }

  combineAnalyses(localAnalysis, aiAnalysis, originalText) {
    // Use AI for primary classification, local for keyword extraction
    const combined = {
      // Primary analysis from AI (more accurate)
      category: aiAnalysis.category,
      confidence: this.calculateCombinedConfidence(localAnalysis, aiAnalysis),
      sentiment: this.combineSentiment(localAnalysis, aiAnalysis),
      toxicity: this.combineToxicity(localAnalysis, aiAnalysis),
      
      // Keep local keyword extraction (good for transparency)
      keywords: localAnalysis.keywords,
      
      // Metadata
      source: 'hybrid',
      ai_used: true,
      ai_source: aiAnalysis.source,
      local_category: localAnalysis.category,
      ai_category: aiAnalysis.category,
      agreement: localAnalysis.category === aiAnalysis.category,
      
      // Explanations
      local_explanation: `Local NLP: ${localAnalysis.category} (${(localAnalysis.confidence * 100).toFixed(1)}%)`,
      ai_explanation: aiAnalysis.explanation || `AI: ${aiAnalysis.category} (${(aiAnalysis.confidence * 100).toFixed(1)}%)`,
      
      // Original text for reference
      analyzed_text: originalText
    };

    // Boost confidence if both analyses agree
    if (combined.agreement && combined.confidence < 0.9) {
      combined.confidence = Math.min(combined.confidence * 1.2, 1.0);
      combined.agreement_boost = true;
    }

    // Flag disagreements for manual review
    if (!combined.agreement) {
      combined.needs_review = true;
      combined.disagreement_reason = `Local detected ${localAnalysis.category}, AI detected ${aiAnalysis.category}`;
    }

    return combined;
  }

  calculateCombinedConfidence(local, ai) {
    // Weight AI confidence higher, but consider local confidence too
    const aiWeight = 0.7;
    const localWeight = 0.3;
    
    return (ai.confidence * aiWeight) + (local.confidence * localWeight);
  }

  combineSentiment(local, ai) {
    // Use AI sentiment as primary, local as backup
    return {
      score: ai.sentiment?.score || local.sentiment.score,
      label: ai.sentiment?.label || local.sentiment.label,
      local_sentiment: local.sentiment.label,
      ai_sentiment: ai.sentiment?.label
    };
  }

  combineToxicity(local, ai) {
    // Take the higher toxicity score (more conservative approach)
    const localToxicity = local.toxicity.score;
    const aiToxicity = ai.toxicity.score;
    
    return {
      score: Math.max(localToxicity, aiToxicity),
      local_score: localToxicity,
      ai_score: aiToxicity,
      categories: local.toxicity.categories || {}
    };
  }

  // Quick method to check if AI should be used for this text
  shouldUseAI(text) {
    // Use AI for:
    // - Longer texts (more context)
    // - Mixed language content
    // - Ambiguous cases
    
    if (!this.useAI) return false;
    
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    const isMixed = hasHindi && hasEnglish;
    const isLong = text.length > 50;
    
    return isMixed || isLong || text.includes('?') || text.includes('maybe');
  }

  // Get analysis statistics
  async getAnalysisStats() {
    return {
      ai_enabled: this.useAI,
      ai_priority: this.aiPriority,
      available_services: {
        gemini: !!process.env.GEMINI_API_KEY,
        huggingface: !!process.env.HUGGINGFACE_API_KEY,
        perspective: !!process.env.PERSPECTIVE_API_KEY
      }
    };
  }
}

module.exports = new HybridAnalysisService();
