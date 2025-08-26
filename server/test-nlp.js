const nlpService = require('./services/nlpService');

async function testNLP() {
  console.log('🧪 Testing NLP Service...\n');
  
  const testTexts = [
    // English Positive
    'This is amazing! I love this game so much!',
    'Absolutely fantastic and wonderful experience!',
    'Outstanding performance, brilliant work!',

    // English Negative
    'This is terrible and I hate it. Worst game ever!',
    'Disgusting and pathetic, completely useless!',
    'Boring and disappointing, waste of time!',

    // English Neutral
    'This game is okay, nothing special.',
    'The weather is nice today.',
    'game',

    // English Toxic/Violence
    'You are stupid and ugly, go kill yourself!',
    'I will murder you and destroy everything!',
    'Beat him up and torture that bastard!',

    // English Fake News
    'This is fake news and a complete hoax!',
    'Government conspiracy to control population with vaccines!',
    'Miracle cure that doctors dont want you to know!',

    // English Sexual Harassment
    'Send me your nude pics baby',
    'You look so sexy, want to sleep with you',
    'Show me your private parts',

    // English Scam
    'Congratulations! You won 1 million dollars! Click here now!',
    'Work from home and earn thousands daily, guaranteed!',
    'Limited time offer, act now or miss forever!',

    // Hindi Positive
    'Yeh game bahut accha hai, main ise bahut pasand karta hun',
    'Zabardast aur kamaal ka kaam hai yeh!',
    'Bahut sundar aur khoobsurat hai!',

    // Hindi Negative
    'Yeh bahut ganda aur bekaar hai',
    'Bilkul faltu aur bakwas cheez hai',
    'Bura aur kharab experience tha',

    // Hindi Toxic/Violence
    'Tum bewakoof ho aur badsurat ho, mar jao!',
    'Main tumse nafrat karta hun, tum nikamma ho',
    'Khudkhushi kar lo, koi tumhe pasand nahi karta',
    'Tujhe maar dunga aur khatam kar dunga!',
    'Chaku se stab karunga, bandook se shoot karunga!',

    // Hindi Fake News
    'Yeh jhooth hai aur fake news hai',
    'Sarkar ki saazish hai, vaccine mein chip hai',
    'Desi nuskha se corona ka ilaj, doctor chhupate hain',

    // Hindi Sexual Harassment
    'Photo bhejo nanga wala, bahut sexy ho',
    'Chumma dena hai, saath sona hai',
    'Private parts dikhao, bahut hot ho',

    // Hindi Scam
    'Lottery jeet gaye ho, 50 lakh rupaye mile hain!',
    'Ghar baithe paisa kamao, guarantee hai pakka!',
    'Sirf aaj ka offer, kal chhoot jayega mauka!',

    // Mixed Hinglish
    'Yeh game bilkul bakwas hai, hate karta hun!',
    'Tum stupid ho aur main tumhe kill kar dunga!',
    'Fake news spread kar rahe ho, jhooth bol rahe ho!',
    'Send pics baby, bahut sexy lag rahi ho!',
    'Easy money kamao, work from home karo!'
  ];
  
  for (let i = 0; i < testTexts.length; i++) {
    const text = testTexts[i];
    console.log(`📝 Test ${i + 1}: "${text}"`);
    
    try {
      const result = await nlpService.analyzeText(text);
      console.log(`   Sentiment: ${result.sentiment.score.toFixed(2)} (${result.sentiment.label})`);
      console.log(`   Category: ${result.category}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   Toxicity: ${(result.toxicity.score * 100).toFixed(1)}%`);
      console.log(`   Keywords: ${result.keywords.join(', ')}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

testNLP().catch(console.error);
