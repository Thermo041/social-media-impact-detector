const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String
  }
}, {
  timestamps: true
});

// Connect to MongoDB
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedConnection = connection;
  return connection;
}

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Validation functions
const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6 && 
         /[a-z]/.test(password) && 
         /[A-Z]/.test(password) && 
         /\d/.test(password);
};

const validateUsername = (username) => {
  return /^[a-zA-Z0-9_]+$/.test(username) && 
         username.length >= 3 && 
         username.length <= 30;
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    const { username, email, password, firstName, lastName } = req.body;

    // Validation
    const errors = [];
    
    if (!validateUsername(username)) {
      errors.push('Username must be 3-30 characters and contain only letters, numbers, and underscores');
    }
    
    if (!validateEmail(email)) {
      errors.push('Please enter a valid email');
    }
    
    if (!validatePassword(password)) {
      errors.push('Password must be at least 6 characters with uppercase, lowercase, and number');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        error: existingUser.username === username ? 'Username already taken' : 'Email already registered'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      profile: {
        firstName: firstName || '',
        lastName: lastName || ''
      }
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: 'Registration failed',
        error: `${field} already exists`
      });
    }

    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
}
