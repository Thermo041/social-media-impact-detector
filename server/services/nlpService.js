const natural = require('natural');
const Sentiment = require('sentiment');
const axios = require('axios');

class NLPService {
  constructor() {
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Initialize stopwords (English + Hindi)
    this.stopwords = new Set([
      // English stopwords
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
      'had', 'what', 'said', 'each', 'which', 'she', 'do', 'how', 'their',
      'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some',
      'her', 'would', 'make', 'like', 'into', 'him', 'time', 'two', 'more',
      'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call',
      'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get',
      'come', 'made', 'may', 'part',
      // Hindi stopwords
      'ka', 'ki', 'ke', 'ko', 'se', 'me', 'par', 'hai', 'hain', 'tha', 'thi', 'the',
      'aur', 'ya', 'jo', 'yah', 'vah', 'is', 'us', 'ek', 'do', 'teen', 'char',
      'main', 'tum', 'aap', 'hum', 'woh', 'kya', 'kaise', 'kahan', 'kab', 'kyun'
    ]);

    // Positive sentiment words (English + Hindi)
    this.positiveWords = new Set([
      // English
      'amazing', 'awesome', 'excellent', 'fantastic', 'great', 'wonderful', 'brilliant', 'outstanding',
      'superb', 'magnificent', 'marvelous', 'incredible', 'fabulous', 'terrific', 'perfect', 'beautiful',
      'lovely', 'gorgeous', 'stunning', 'impressive', 'remarkable', 'extraordinary', 'phenomenal',
      'spectacular', 'breathtaking', 'mind-blowing', 'jaw-dropping', 'awe-inspiring', 'heart-warming',
      // Hindi
      'bahut accha', 'zabardast', 'kamaal', 'shandar', 'behtreen', 'lajawab', 'khoobsurat', 'sundar',
      'pyara', 'meetha', 'mazedaar', 'dilchasp', 'rochak', 'anokha', 'adbhut', 'vishesh', 'uttam'
    ]);

    // Negative sentiment words (English + Hindi)
    this.negativeWords = new Set([
      // English
      'terrible', 'awful', 'horrible', 'disgusting', 'pathetic', 'useless', 'worthless', 'disappointing',
      'frustrating', 'annoying', 'irritating', 'boring', 'dull', 'bland', 'mediocre', 'poor', 'bad',
      'worst', 'hate', 'dislike', 'despise', 'loathe', 'detest', 'abhor', 'can\'t stand',
      // Hindi
      'ganda', 'bura', 'bekaar', 'ghatiya', 'faltu', 'bakwas', 'bekar', 'kharab', 'galat', 'nafrat',
      'pasand nahi', 'bore', 'sust', 'thanda', 'fika', 'kamzor', 'ganda', 'badsurat'
    ]);

    // COMPREHENSIVE Keywords for different categories (English + Hindi + Hinglish)
    this.categoryKeywords = {
      fake_news: [
        // English
        'fake', 'hoax', 'conspiracy', 'false', 'misleading', 'debunked', 'unverified', 'rumor', 'misinformation',
        'propaganda', 'lie', 'lies', 'fabricated', 'doctored', 'manipulated', 'staged', 'planted', 'bogus',
        'phony', 'counterfeit', 'forged', 'altered', 'photoshopped', 'deepfake', 'clickbait', 'sensational',
        // Hindi
        'jhooth', 'jhoothi', 'jhootha', 'galat', 'fake news', 'bakwas', 'dhokha', 'fraud', 'farzi', 'nakli',
        'banawati', 'ghadha hua', 'saazish', 'chalaki', 'makkar', 'chhupana', 'chhalawa', 'bewakoofi',
        'andha vishwas', 'afwah', 'khabar', 'gumrah', 'bhramit', 'galat jaankari'
      ],
      hate_speech: [
        // English
        'hate', 'racist', 'discrimination', 'bigot', 'prejudice', 'supremacist', 'nazi', 'fascist', 'xenophobic',
        'homophobic', 'transphobic', 'islamophobic', 'antisemitic', 'casteist', 'communal', 'sectarian',
        'ethnic cleansing', 'genocide', 'apartheid', 'segregation', 'lynch', 'mob justice', 'vigilante',
        // Hindi
        'nafrat', 'ghrina', 'jaati', 'dharm', 'muslim', 'hindu', 'sikh', 'christian', 'bhed-bhaav', 'untouchable',
        'neech', 'kamina', 'harijan', 'dalit', 'brahmin', 'kshatriya', 'vaishya', 'shudra', 'achhoot', 'chhoti jaati',
        'oonchi jaati', 'jaat-paat', 'sampradayik', 'mazhabi', 'kafir', 'mleccha', 'vidharmi', 'gaddaar', 'deshdrohi'
      ],
      harassment: [
        // English
        'harass', 'bully', 'threat', 'intimidate', 'stalk', 'abuse', 'cyberbully', 'troll', 'doxx', 'blackmail',
        'extort', 'menace', 'terrorize', 'persecute', 'torment', 'victimize', 'oppress', 'coerce', 'pressure',
        'force', 'violate', 'assault', 'molest', 'grope', 'touch inappropriately', 'sexual harassment',
        // Hindi
        'pareshan', 'tang', 'dhamki', 'dhamkana', 'blackmail', 'torture', 'satana', 'preshan karna', 'zalim',
        'zulm', 'anyay', 'attyachar', 'hinsa', 'maar-peet', 'dabana', 'dabav', 'zorjabardasti', 'majboor karna',
        'gunda gardi', 'badmashi', 'goonda', 'lafanga', 'chheda chhedi', 'badtameezi', 'gandi harkat'
      ],
      scam: [
        // English
        'scam', 'fraud', 'phishing', 'ponzi', 'pyramid', 'bitcoin', 'cryptocurrency', 'investment', 'money',
        'prize', 'winner', 'urgent', 'limited time', 'act now', 'guaranteed', 'lottery', 'jackpot', 'millionaire',
        'rich quick', 'easy money', 'work from home', 'earn thousands', 'no experience', 'click here', 'free gift',
        'congratulations', 'selected', 'exclusive offer', 'limited offer', 'hurry up', 'dont miss', 'last chance',
        // Hindi
        'dhokha', 'thagana', 'paisa', 'lottery', 'jeet', 'prize', 'inaam', 'jaldi', 'turant', 'guarantee', 'pakka',
        'crorepati', 'lakhpati', 'ameer', 'daulat', 'sampatti', 'ghar baithe', 'aasaan paisa', 'jhatpat', 'tez',
        'mauka', 'avsar', 'chhoot jayega', 'antim mauka', 'sirf aaj', 'free mein', 'muft', 'bedaag'
      ],
      misinformation: [
        // English
        'vaccine', 'covid', 'coronavirus', 'cure', 'treatment', 'medicine', 'health', 'doctor', 'medical',
        'study', 'research', 'science', 'miracle cure', 'natural remedy', 'home remedy', 'alternative medicine',
        'conspiracy', 'government cover up', 'big pharma', 'side effects', 'dangerous', 'toxic', 'poison',
        'autism', 'infertility', 'death', 'microchip', '5g', 'bill gates', 'population control',
        // Hindi
        'vaccine', 'corona', 'covid', 'ilaj', 'dawa', 'doctor', 'hospital', 'bimari', 'sehat', 'swasthya',
        'gharelu nuskha', 'ayurveda', 'homeopathy', 'unani', 'desi ilaj', 'nuskha', 'totka', 'upay',
        'saazish', 'sarkar', 'chhupana', 'dawa company', 'nuksan', 'kharab', 'zeher', 'maut', 'chip'
      ],
      cyberbullying: [
        // English
        'ugly', 'stupid', 'loser', 'kill yourself', 'die', 'worthless', 'pathetic', 'freak', 'weirdo',
        'nobody likes you', 'fat', 'skinny', 'short', 'tall', 'dark', 'fair', 'bald', 'hairy', 'smelly',
        'disgusting', 'gross', 'hideous', 'monster', 'beast', 'pig', 'dog', 'rat', 'cockroach', 'trash',
        'garbage', 'waste', 'useless', 'hopeless', 'failure', 'reject', 'outcast', 'loner', 'nerd', 'geek',
        // Hindi
        'bewakoof', 'pagal', 'ganda', 'badsurat', 'marjayega', 'mar ja', 'khudkhushi', 'suicide', 'khatam',
        'nikamma', 'faltu', 'bekar', 'koi pasand nahi karta', 'sab nafrat karte hain', 'mota', 'patla',
        'chota', 'lamba', 'kala', 'gora', 'takla', 'baal wala', 'badbu', 'gandi smell', 'ghatiya',
        'janwar', 'kutta', 'suar', 'chuha', 'kachra', 'gandagi', 'bekaar', 'nalayak', 'kamchor', 'aalsi'
      ],
      sexual_harassment: [
        // English
        'sexy', 'hot', 'beautiful', 'gorgeous', 'send pics', 'nude', 'naked', 'strip', 'undress', 'kiss',
        'hug', 'touch', 'feel', 'grab', 'squeeze', 'fondle', 'grope', 'molest', 'rape', 'sex', 'sleep with',
        'bed', 'bedroom', 'private parts', 'breast', 'boobs', 'ass', 'butt', 'penis', 'vagina',
        // Hindi
        'sexy', 'hot', 'sundar', 'khoobsurat', 'photo bhejo', 'nanga', 'kapde utaro', 'chumma', 'pappi',
        'gale lagana', 'chhuna', 'haath lagana', 'dabana', 'chheda chhedi', 'balatkar', 'sex', 'saath sona',
        'bistar', 'kamra', 'private', 'chhati', 'gaand', 'lund', 'choot', 'randi', 'raand'
      ],
      violence: [
        // English
        'kill', 'murder', 'assassinate', 'execute', 'slaughter', 'massacre', 'genocide', 'torture', 'beat',
        'hit', 'punch', 'kick', 'slap', 'stab', 'shoot', 'gun', 'knife', 'weapon', 'bomb', 'blast',
        'attack', 'assault', 'fight', 'war', 'battle', 'destroy', 'demolish', 'burn', 'fire',
        // Hindi (with all variations)
        'marna', 'maar dena', 'hatya', 'qatl', 'jaan lena', 'khatam karna', 'torture', 'peetna', 'maarna',
        'ghoonsa', 'laat', 'thappad', 'chaku', 'bandook', 'hathiyar', 'bomb', 'dhamaka', 'hamla',
        'ladai', 'jung', 'tabah karna', 'jalana', 'aag', 'phoonkna', 'barbaad karna',
        // Hindi verb forms
        'marunga', 'mardunga', 'marduunga', 'maar dunga', 'maar denge', 'khatam karunga', 'khatam kar dunga',
        'peet dunga', 'peetenge', 'tod dunga', 'tod denge', 'jaan se maar dunga', 'zinda nahi chodunga'
      ]
    };
  }

  // Preprocess text: tokenize, remove stopwords, stem
  preprocessText(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Convert to lowercase and tokenize
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    // Remove stopwords and non-alphabetic tokens
    const filteredTokens = tokens.filter(token => 
      token.length > 2 && 
      /^[a-zA-Z]+$/.test(token) && 
      !this.stopwords.has(token)
    );

    // Stem tokens
    return filteredTokens.map(token => this.stemmer.stem(token));
  }

  // Analyze sentiment using multiple approaches
  analyzeSentiment(text) {
    try {
      const result = this.sentiment.analyze(text);
      
      // Normalize score to -1 to 1 range
      const normalizedScore = Math.max(-1, Math.min(1, result.score / 10));
      
      let label = 'neutral';
      if (normalizedScore > 0.1) {
        label = 'positive';
      } else if (normalizedScore < -0.1) {
        label = 'negative';
      }

      return {
        score: normalizedScore,
        label,
        comparative: result.comparative,
        tokens: result.tokens,
        words: result.words,
        positive: result.positive,
        negative: result.negative
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        score: 0,
        label: 'neutral',
        comparative: 0,
        tokens: [],
        words: [],
        positive: [],
        negative: []
      };
    }
  }

  // Categorize content based on keywords and patterns
  categorizeContent(text) {
    const preprocessedTokens = this.preprocessText(text);
    const lowerText = text.toLowerCase();
    
    const scores = {};
    let maxScore = 0;
    let predictedCategory = 'other';

    // Calculate scores for each category
    Object.entries(this.categoryKeywords).forEach(([category, keywords]) => {
      let score = 0;
      
      keywords.forEach(keyword => {
        const keywordTokens = this.preprocessText(keyword);
        
        // Check for exact matches in original text
        if (lowerText.includes(keyword.toLowerCase())) {
          score += 2;
        }
        
        // Check for stemmed matches
        keywordTokens.forEach(stemmedKeyword => {
          if (preprocessedTokens.includes(stemmedKeyword)) {
            score += 1;
          }
        });
      });

      scores[category] = score;
      
      if (score > maxScore) {
        maxScore = score;
        predictedCategory = category;
      }
    });

    // Calculate confidence based on score distribution
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0;

    // If confidence is too low, classify as 'other'
    if (confidence < 0.3 || maxScore < 2) {
      predictedCategory = 'other';
    }

    return {
      category: predictedCategory,
      confidence: Math.min(confidence, 1),
      scores
    };
  }

  // Extract keywords from text
  extractKeywords(text, limit = 10) {
    const tokens = this.preprocessText(text);
    const frequency = {};

    // Count token frequency
    tokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([word]) => word);
  }

  // Calculate toxicity score based on negative sentiment and harmful keywords
  calculateToxicity(text, sentimentAnalysis) {
    const harmfulPatterns = [
      // Violence (English + Hindi)
      /\b(kill|die|death|murder|suicide|assassinate|slaughter|massacre|torture|beat|hit|punch|kick|slap|stab|shoot|marjayega|mar ja|khudkhushi|khatam|maar|marna|hatya|qatl|jaan lena|peetna|ghoonsa|laat|thappad|marunga|mardunga|marduunga|maar dunga|khatam karunga|peet dunga|tod dunga)\b/gi,
      // Hate (English + Hindi)
      /\b(hate|hatred|despise|loathe|racist|discrimination|bigot|nafrat|ghrina|bura|ganda|jaati|bhed-bhaav|neech|kamina|deshdrohi|gaddaar)\b/gi,
      // Insults (English + Hindi)
      /\b(stupid|idiot|moron|dumb|retard|loser|freak|weirdo|bewakoof|pagal|gadha|ullu|nikamma|faltu|bekar|nalayak|kamchor|aalsi|kutta|suar|janwar)\b/gi,
      // Appearance (English + Hindi)
      /\b(ugly|disgusting|gross|hideous|fat|skinny|dark|bald|smelly|monster|beast|badsurat|ganda|ghatiya|bekaar|mota|patla|kala|takla|badbu)\b/gi,
      // Threats (English + Hindi)
      /\b(threat|threaten|intimidate|scare|blackmail|extort|dhamki|dhamkana|pareshan|tang|zorjabardasti|majboor karna)\b/gi,
      // Sexual harassment (English + Hindi)
      /\b(rape|molest|grope|fondle|nude|naked|strip|undress|balatkar|chheda chhedi|nanga|kapde utaro|chhuna|haath lagana)\b/gi,
      // Profanity (English + Hindi)
      /\b(fuck|shit|bitch|asshole|bastard|damn|hell|crap|lund|choot|gaand|randi|raand|madarchod|behenchod|chutiya)\b/gi
    ];

    let toxicityScore = 0;
    const categories = [];

    // Base toxicity from negative sentiment
    if (sentimentAnalysis.score < -0.3) {
      toxicityScore += Math.abs(sentimentAnalysis.score) * 0.3;
      categories.push({ name: 'negative_sentiment', score: Math.abs(sentimentAnalysis.score) });
    }

    // Check for harmful patterns
    harmfulPatterns.forEach((pattern, index) => {
      const matches = text.match(pattern);
      if (matches) {
        const patternScore = matches.length * 0.2;
        toxicityScore += patternScore;
        
        const categoryNames = ['violence', 'hate', 'insult', 'appearance', 'threat'];
        categories.push({ 
          name: categoryNames[index], 
          score: Math.min(patternScore, 1) 
        });
      }
    });

    return {
      score: Math.min(toxicityScore, 1),
      categories
    };
  }

  // Main analysis function
  async analyzeText(text) {
    try {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('Invalid text input');
      }

      // Perform all analyses
      const sentimentAnalysis = this.analyzeSentiment(text);
      const categoryAnalysis = this.categorizeContent(text);
      const keywords = this.extractKeywords(text);
      const toxicity = this.calculateToxicity(text, sentimentAnalysis);

      return {
        sentiment: {
          score: sentimentAnalysis.score,
          label: sentimentAnalysis.label
        },
        category: categoryAnalysis.category,
        confidence: categoryAnalysis.confidence,
        keywords,
        toxicity,
        metadata: {
          textLength: text.length,
          wordCount: text.split(/\s+/).length,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Text analysis error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  // Batch analysis for multiple texts
  async analyzeTexts(texts) {
    const results = [];
    
    for (const text of texts) {
      try {
        const analysis = await this.analyzeText(text);
        results.push({ success: true, analysis });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }
}

module.exports = new NLPService();
