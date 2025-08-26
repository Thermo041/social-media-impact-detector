const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Post = require('../models/Post');
const nlpService = require('../services/nlpService');

// Sample social media posts with adverse impact
const samplePosts = [
  {
    content: "BREAKING: Scientists have discovered that vaccines contain microchips to track your location! Don't let them control you! Share this before they delete it!",
    platform: "facebook",
    author: { username: "truthseeker2023", verified: false },
    metadata: { likes: 1250, shares: 890, comments: 234 }
  },
  {
    content: "You're so ugly and stupid. Nobody likes you. Why don't you just disappear forever? The world would be better without losers like you.",
    platform: "twitter",
    author: { username: "anonymous_troll", verified: false },
    metadata: { likes: 12, shares: 3, comments: 45 }
  },
  {
    content: "🚨 URGENT: Send me $500 in Bitcoin and I'll send you $5000 back! This is a limited time offer from Elon Musk's new crypto project! Act now!",
    platform: "instagram",
    author: { username: "crypto_millionaire", verified: false },
    metadata: { likes: 234, shares: 67, comments: 123 }
  },
  {
    content: "All immigrants are criminals and terrorists. They're destroying our country and taking our jobs. We need to get rid of them all!",
    platform: "facebook",
    author: { username: "patriot_warrior", verified: false },
    metadata: { likes: 567, shares: 234, comments: 89 }
  },
  {
    content: "COVID-19 is just a hoax created by the government to control us. The hospitals are empty and doctors are lying for money. Wake up sheeple!",
    platform: "youtube",
    author: { username: "freedom_fighter", verified: false },
    metadata: { likes: 2340, shares: 1200, comments: 567 }
  },
  {
    content: "Hey girl, I know where you live and work. You better watch your back. I'm coming for you and there's nothing you can do to stop me.",
    platform: "instagram",
    author: { username: "stalker_guy", verified: false },
    metadata: { likes: 5, shares: 1, comments: 23 }
  },
  {
    content: "MIRACLE CURE: This one weird trick doctors don't want you to know! Drink bleach to cure cancer, COVID, and all diseases! Order now for $99.99!",
    platform: "tiktok",
    author: { username: "health_guru", verified: false },
    metadata: { likes: 890, shares: 456, comments: 234 }
  },
  {
    content: "Women are inferior to men and should stay in the kitchen. They're too emotional and stupid to make important decisions. #MenRule",
    platform: "reddit",
    author: { username: "alpha_male", verified: false },
    metadata: { likes: 123, shares: 45, comments: 234 }
  },
  {
    content: "I'm a Nigerian prince and I need your help to transfer $10 million. Send me your bank details and I'll share 50% with you!",
    platform: "facebook",
    author: { username: "prince_nigeria", verified: false },
    metadata: { likes: 23, shares: 12, comments: 67 }
  },
  {
    content: "The Earth is flat and NASA is lying to us! All space missions are fake and filmed in Hollywood studios. Don't believe the government propaganda!",
    platform: "youtube",
    author: { username: "flat_earth_truth", verified: false },
    metadata: { likes: 1456, shares: 789, comments: 345 }
  },
  {
    content: "Kill yourself you worthless piece of trash. You're a waste of oxygen and everyone hates you. Do the world a favor and end it all.",
    platform: "twitter",
    author: { username: "hate_spreader", verified: false },
    metadata: { likes: 8, shares: 2, comments: 56 }
  },
  {
    content: "EXCLUSIVE: Celebrity death hoax spreads on social media. Fans are devastated by the fake news about their favorite star's supposed accident.",
    platform: "instagram",
    author: { username: "gossip_central", verified: false },
    metadata: { likes: 3456, shares: 1234, comments: 567 }
  },
  {
    content: "Jews control all the banks and media. They're behind every conspiracy and war. We need to stop them before they destroy the world!",
    platform: "reddit",
    author: { username: "conspiracy_theorist", verified: false },
    metadata: { likes: 234, shares: 89, comments: 123 }
  },
  {
    content: "Your daughter is so pretty. I've been watching her walk to school every day. Maybe I should introduce myself to her personally... 😈",
    platform: "facebook",
    author: { username: "creepy_stranger", verified: false },
    metadata: { likes: 3, shares: 0, comments: 34 }
  },
  {
    content: "BREAKING: 5G towers cause cancer and COVID-19! The government is using them to control our minds! Destroy all 5G towers to save humanity!",
    platform: "tiktok",
    author: { username: "5g_truth", verified: false },
    metadata: { likes: 2345, shares: 1567, comments: 789 }
  }
];

// Sample users
const sampleUsers = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "Admin123!",
    role: "admin",
    profile: {
      firstName: "System",
      lastName: "Administrator",
      bio: "System administrator account"
    }
  },
  {
    username: "moderator1",
    email: "mod1@example.com",
    password: "Mod123!",
    role: "moderator",
    profile: {
      firstName: "Jane",
      lastName: "Smith",
      bio: "Content moderator specializing in hate speech detection"
    }
  },
  {
    username: "researcher",
    email: "researcher@example.com",
    password: "Research123!",
    role: "user",
    profile: {
      firstName: "Dr. John",
      lastName: "Doe",
      bio: "Social media researcher studying online harmful content"
    }
  },
  {
    username: "analyst",
    email: "analyst@example.com",
    password: "Analyst123!",
    role: "user",
    profile: {
      firstName: "Sarah",
      lastName: "Johnson",
      bio: "Data analyst working on social media impact studies"
    }
  },
  {
    username: "volunteer",
    email: "volunteer@example.com",
    password: "Volunteer123!",
    role: "user",
    profile: {
      firstName: "Mike",
      lastName: "Wilson",
      bio: "Community volunteer helping to identify harmful content"
    }
  }
];

async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-media-impact';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

async function seedUsers() {
  try {
    console.log('👥 Creating users...');
    const users = [];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`   ✓ Created user: ${user.username} (${user.role})`);
    }

    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedPosts(users) {
  try {
    console.log('📝 Creating posts with NLP analysis...');
    const posts = [];

    // Get non-admin users for post submission
    const regularUsers = users.filter(user => user.role !== 'admin');

    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      
      try {
        // Analyze content using NLP service
        console.log(`   🔍 Analyzing post ${i + 1}/${samplePosts.length}...`);
        const analysis = await nlpService.analyzeText(postData.content);

        // Random user submission
        const submittedBy = regularUsers[Math.floor(Math.random() * regularUsers.length)];

        const post = new Post({
          content: postData.content,
          platform: postData.platform,
          author: postData.author,
          submittedBy: submittedBy._id,
          analysis: {
            category: analysis.category,
            confidence: analysis.confidence,
            sentiment: analysis.sentiment,
            keywords: analysis.keywords,
            toxicity: analysis.toxicity
          },
          metadata: {
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
            likes: postData.metadata.likes,
            shares: postData.metadata.shares,
            comments: postData.metadata.comments,
            reach: Math.floor(postData.metadata.likes * 10 + Math.random() * 1000)
          },
          verification: {
            status: Math.random() > 0.7 ? 'verified' : 'pending' // 30% verified
          }
        });

        await post.save();
        posts.push(post);

        console.log(`   ✓ Created post: ${analysis.category} (confidence: ${(analysis.confidence * 100).toFixed(1)}%)`);
      } catch (error) {
        console.error(`   ❌ Error processing post ${i + 1}:`, error.message);
      }
    }

    return posts;
  } catch (error) {
    console.error('Error seeding posts:', error);
    throw error;
  }
}

async function updateUserStats(users, posts) {
  try {
    console.log('📊 Updating user statistics...');

    for (const user of users) {
      const userPosts = posts.filter(post => post.submittedBy.toString() === user._id.toString());
      const verifiedPosts = userPosts.filter(post => post.verification.status === 'verified');

      user.statistics.postsSubmitted = userPosts.length;
      user.statistics.postsVerified = verifiedPosts.length;
      user.statistics.contributionScore = verifiedPosts.length * 10 + userPosts.length * 2;

      await user.save();
      console.log(`   ✓ Updated stats for ${user.username}: ${userPosts.length} posts, ${verifiedPosts.length} verified`);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();
    await clearDatabase();

    const users = await seedUsers();
    console.log(`✅ Created ${users.length} users\n`);

    const posts = await seedPosts(users);
    console.log(`✅ Created ${posts.length} posts\n`);

    await updateUserStats(users, posts);
    console.log('✅ Updated user statistics\n');

    // Print summary
    console.log('📈 SEEDING SUMMARY:');
    console.log('==================');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📝 Posts: ${posts.length}`);
    
    const categoryStats = {};
    posts.forEach(post => {
      categoryStats[post.analysis.category] = (categoryStats[post.analysis.category] || 0) + 1;
    });
    
    console.log('\n📊 Posts by Category:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    console.log('\n🔐 Test Accounts:');
    console.log('   Admin: admin@example.com / Admin123!');
    console.log('   Moderator: mod1@example.com / Mod123!');
    console.log('   User: researcher@example.com / Research123!');

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
