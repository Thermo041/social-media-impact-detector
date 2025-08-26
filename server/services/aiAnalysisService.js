const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIAnalysisService {
  constructor() {
    // Initialize Gemini client
    this.gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
  }



  // Google Gemini Analysis
  async analyzeWithGemini(text) {
    if (!this.gemini) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an expert content moderator specializing in English and Hindi content analysis. Analyze the given text for harmful content.

Respond with ONLY a JSON object in this exact format:
{
  "category": "violence|hate_speech|harassment|cyberbullying|sexual_harassment|fake_news|scam|misinformation|other",
  "toxicity_score": 0.0-1.0,
  "confidence": 0.0-1.0,
  "sentiment": "positive|negative|neutral",
  "language": "english|hindi|mixed",
  "explanation": "brief explanation of why this content is harmful or not"
}

Categories:
- violence: threats, death wishes, physical harm (Hindi: mardunga, maar dunga, khatam kar dunga, nipat jayega)
- hate_speech: discrimination based on race, religion, caste (Hindi: nafrat, ghrina, jaati)
- harassment: bullying, intimidation, stalking (Hindi: pareshan karna, tang karna)
- cyberbullying: online bullying, personal attacks (Hindi: bewakoof, pagal, nikamma)
- sexual_harassment: unwanted sexual content, objectification
- fake_news: false information, conspiracy theories (Hindi: jhooth, fake news)
- scam: fraudulent schemes, phishing attempts (Hindi: dhokha, thagana)
- misinformation: incorrect health/medical information
- other: benign content or unclear harmful intent

Pay special attention to Hindi words and mixed Hindi-English content.

Analyze this text: "${text}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      // Extract JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from Gemini');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        source: 'gemini',
        category: analysis.category,
        confidence: analysis.confidence,
        toxicity: { score: analysis.toxicity_score },
        sentiment: { label: analysis.sentiment },
        language: analysis.language,
        explanation: analysis.explanation
      };
    } catch (error) {
      console.error('Gemini API error:', error.message);
      throw new Error('Gemini analysis failed: ' + error.message);
    }
  }

  // Hugging Face Transformers Analysis
  async analyzeWithHuggingFace(text) {
    if (!this.huggingfaceApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      // Use multiple models for comprehensive analysis
      const [toxicityResult, sentimentResult, classificationResult] = await Promise.all([
        // Toxicity detection
        axios.post('https://api-inference.huggingface.co/models/unitary/toxic-bert', {
          inputs: text
        }, {
          headers: { 'Authorization': `Bearer ${this.huggingfaceApiKey}` }
        }),
        
        // Sentiment analysis
        axios.post('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
          inputs: text
        }, {
          headers: { 'Authorization': `Bearer ${this.huggingfaceApiKey}` }
        }),
        
        // Content classification
        axios.post('https://api-inference.huggingface.co/models/martin-ha/toxic-comment-model', {
          inputs: text
        }, {
          headers: { 'Authorization': `Bearer ${this.huggingfaceApiKey}` }
        })
      ]);

      // Process results
      const toxicity = toxicityResult.data[0]?.find(item => item.label === 'TOXIC')?.score || 0;
      const sentiment = sentimentResult.data[0]?.reduce((prev, curr) => 
        curr.score > prev.score ? curr : prev
      );
      const classification = classificationResult.data[0]?.reduce((prev, curr) => 
        curr.score > prev.score ? curr : prev
      );

      return {
        source: 'huggingface',
        category: this.mapHuggingFaceCategory(classification?.label),
        confidence: classification?.score || 0,
        toxicity: { score: toxicity },
        sentiment: { label: sentiment?.label?.toLowerCase() || 'neutral' },
        explanation: `HuggingFace analysis: ${classification?.label} (${(classification?.score * 100).toFixed(1)}%)`
      };
    } catch (error) {
      console.error('Hugging Face API error:', error.response?.data || error.message);
      throw new Error('Hugging Face analysis failed');
    }
  }

  // Google Perspective API (Toxicity Detection)
  async analyzeWithPerspective(text) {
    const perspectiveApiKey = process.env.PERSPECTIVE_API_KEY;
    if (!perspectiveApiKey) {
      throw new Error('Perspective API key not configured');
    }

    try {
      const response = await axios.post(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${perspectiveApiKey}`, {
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {},
          IDENTITY_ATTACK: {},
          INSULT: {},
          PROFANITY: {},
          THREAT: {}
        },
        languages: ['en', 'hi'],
        doNotStore: true,
        comment: { text }
      });

      const scores = response.data.attributeScores;
      const toxicity = scores.TOXICITY?.summaryScore?.value || 0;
      const threat = scores.THREAT?.summaryScore?.value || 0;
      const insult = scores.INSULT?.summaryScore?.value || 0;

      let category = 'other';
      if (threat > 0.7) category = 'violence';
      else if (insult > 0.7) category = 'cyberbullying';
      else if (toxicity > 0.7) category = 'harassment';

      return {
        source: 'perspective',
        category,
        confidence: Math.max(toxicity, threat, insult),
        toxicity: { score: toxicity },
        sentiment: { label: toxicity > 0.5 ? 'negative' : 'neutral' },
        explanation: `Google Perspective: ${(toxicity * 100).toFixed(1)}% toxic`
      };
    } catch (error) {
      console.error('Perspective API error:', error.response?.data || error.message);
      throw new Error('Perspective analysis failed');
    }
  }

  // Combined AI Analysis (uses multiple APIs for maximum accuracy)
  async analyzeWithMultipleAI(text) {
    const results = [];
    const errors = [];

    // Try all available AI services
    const services = [
      { name: 'gemini', method: this.analyzeWithGemini.bind(this) },
      { name: 'huggingface', method: this.analyzeWithHuggingFace.bind(this) },
      { name: 'perspective', method: this.analyzeWithPerspective.bind(this) }
    ];

    for (const service of services) {
      try {
        const result = await service.method(text);
        results.push(result);
      } catch (error) {
        errors.push({ service: service.name, error: error.message });
      }
    }

    if (results.length === 0) {
      throw new Error('All AI services failed: ' + JSON.stringify(errors));
    }

    // Combine results for maximum accuracy
    return this.combineAIResults(results);
  }

  // Combine multiple AI results into one consensus
  combineAIResults(results) {
    const avgToxicity = results.reduce((sum, r) => sum + r.toxicity.score, 0) / results.length;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    // Get most common category
    const categories = results.map(r => r.category);
    const categoryCount = {};
    categories.forEach(cat => categoryCount[cat] = (categoryCount[cat] || 0) + 1);
    const mostCommonCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b
    );

    // Get sentiment consensus
    const sentiments = results.map(r => r.sentiment.label);
    const sentimentCount = {};
    sentiments.forEach(sent => sentimentCount[sent] = (sentimentCount[sent] || 0) + 1);
    const consensusSentiment = Object.keys(sentimentCount).reduce((a, b) => 
      sentimentCount[a] > sentimentCount[b] ? a : b
    );

    return {
      source: 'combined_ai',
      category: mostCommonCategory,
      confidence: avgConfidence,
      toxicity: { score: avgToxicity },
      sentiment: { label: consensusSentiment },
      explanation: `Combined AI analysis from ${results.length} services`,
      individual_results: results
    };
  }

  mapHuggingFaceCategory(label) {
    const mapping = {
      'TOXIC': 'harassment',
      'SEVERE_TOXIC': 'violence',
      'OBSCENE': 'harassment',
      'THREAT': 'violence',
      'INSULT': 'cyberbullying',
      'IDENTITY_HATE': 'hate_speech'
    };
    return mapping[label] || 'other';
  }
}

module.exports = new AIAnalysisService();
