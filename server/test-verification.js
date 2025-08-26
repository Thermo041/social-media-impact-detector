const verificationService = require('./services/verificationService');

async function testVerification() {
  console.log('🔍 Testing Verification Service...\n');
  
  const testPosts = [
    {
      name: 'High Quality Verified Post',
      data: {
        content: 'This is a detailed post about social media impact with proper analysis and research.',
        platform: 'twitter',
        originalUrl: 'https://twitter.com/user/status/1234567890',
        author: {
          username: '@verified_user',
          profileUrl: 'https://twitter.com/verified_user',
          verified: true
        },
        metadata: {
          likes: 150,
          shares: 25,
          comments: 30
        }
      }
    },
    {
      name: 'Low Quality Unverified Post',
      data: {
        content: 'bad',
        platform: 'instagram',
        originalUrl: 'https://example.com/fake-url',
        author: {
          username: '@fake_user',
          verified: false
        },
        metadata: {
          likes: 0,
          shares: 0,
          comments: 0
        }
      }
    },
    {
      name: 'Medium Quality Post',
      data: {
        content: 'This is a medium length post about current events. It has some content but lacks verification.',
        platform: 'youtube',
        originalUrl: 'https://youtube.com/watch?v=abc123',
        author: {
          username: '@content_creator',
          profileUrl: 'https://youtube.com/@content_creator',
          verified: false
        },
        metadata: {
          likes: 50,
          shares: 5,
          comments: 10
        }
      }
    },
    {
      name: 'No URL Post',
      data: {
        content: 'This post has no original URL, which affects verification score.',
        platform: 'other',
        author: {
          username: '@anonymous',
          verified: false
        },
        metadata: {
          likes: 10,
          shares: 2,
          comments: 1
        }
      }
    }
  ];
  
  for (let i = 0; i < testPosts.length; i++) {
    const test = testPosts[i];
    console.log(`📝 Test ${i + 1}: ${test.name}`);
    console.log(`Content: "${test.data.content.substring(0, 50)}..."`);
    console.log(`Platform: ${test.data.platform}`);
    console.log(`URL: ${test.data.originalUrl || 'None'}`);
    console.log(`Author Verified: ${test.data.author.verified}`);
    
    try {
      const result = await verificationService.verifyPost(test.data);
      
      if (result.success) {
        console.log(`✅ Verification Score: ${result.verification.score}/100`);
        console.log(`📊 Verification Level: ${result.verification.level}`);
        console.log(`🔍 Factors:`);
        
        result.verification.factors.forEach(factor => {
          const status = factor.status === 'pass' ? '✅' : factor.status === 'partial' ? '⚠️' : '❌';
          console.log(`   ${status} ${factor.factor}: ${factor.score} points ${factor.reason ? `(${factor.reason})` : ''}`);
        });
        
        if (result.metadata) {
          console.log(`🌐 URL Accessible: ${result.metadata.accessible ? 'Yes' : 'No'}`);
          if (result.metadata.title) console.log(`📄 Page Title: ${result.metadata.title.substring(0, 50)}...`);
        }
      } else {
        console.log(`❌ Verification Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 Error: ${error.message}`);
    }
    
    console.log('');
  }
}

testVerification().catch(console.error);
