# Social Media Impact Detector

A comprehensive web application for automatically collecting and analyzing adverse societal impacts of social media content using AI-powered NLP techniques.

## 🚀 Features

### Core Functionality
- **AI-Powered Content Analysis**: Advanced NLP pipeline using sentiment analysis and text classification
- **Multi-Category Detection**: Identifies fake news, hate speech, harassment, scams, misinformation, and cyberbullying
- **Real-time Processing**: Instant analysis of submitted social media content
- **Comprehensive Dashboard**: Interactive analytics with charts and statistics
- **User Authentication**: Secure registration, login, and role-based access control

### Technical Features
- **Modern Tech Stack**: React + TailwindCSS frontend, Node.js/Express backend
- **Database Integration**: MongoDB with Mongoose ODM
- **NLP Processing**: Natural language processing with sentiment analysis and toxicity detection
- **Data Visualization**: Interactive charts using Chart.js
- **Responsive Design**: Mobile-first responsive UI
- **API-First Architecture**: RESTful API with comprehensive endpoints

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TailwindCSS** - Utility-first CSS framework
- **Chart.js** - Interactive data visualization
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Natural** - Natural language processing
- **Sentiment** - Sentiment analysis

### NLP & AI
- **Natural.js** - Tokenization, stemming, stopword removal
- **Sentiment.js** - Sentiment analysis
- **Custom Classification** - Keyword-based content categorization
- **Toxicity Detection** - Pattern-based harmful content detection

## 📁 Project Structure

```
social-media-impact-detector/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Custom middleware
│   ├── scripts/            # Utility scripts
│   └── index.js
├── package.json            # Root package.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd social-media-impact-detector
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, client)
npm run install-all
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/social-media-impact

# JWT Secret (Change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL
CLIENT_URL=http://localhost:3000

# Optional: HuggingFace API Key for advanced NLP
HUGGINGFACE_API_KEY=your-huggingface-api-key-here
```

### 4. Database Setup
Start MongoDB and seed the database with sample data:

```bash
# Seed the database with sample data
npm run seed
```

### 5. Start the Application
```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
# Backend (http://localhost:5000)
npm run server

# Frontend (http://localhost:3000)
npm run client
```

## 🎯 Usage

### Demo Accounts
The seeded database includes these test accounts:

- **Admin**: `admin@example.com` / `Admin123!`
- **Moderator**: `mod1@example.com` / `Mod123!`
- **User**: `researcher@example.com` / `Research123!`

### Key Workflows

1. **Submit Content**: Users can submit suspicious social media posts for analysis
2. **AI Analysis**: The system automatically analyzes content for harmful patterns
3. **View Results**: Browse analyzed posts with detailed insights
4. **Analytics Dashboard**: View comprehensive statistics and trends
5. **Moderation**: Moderators can verify and manage submitted content

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Posts
- `GET /api/posts` - Get all posts (with filtering)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Submit new post for analysis
- `PATCH /api/posts/:id/verify` - Update verification status
- `DELETE /api/posts/:id` - Delete post (soft delete)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/trends` - Trend data over time
- `GET /api/analytics/categories/:category` - Category-specific analytics
- `GET /api/analytics/export` - Export data (JSON/CSV)

## 🧠 NLP Pipeline

The application uses a comprehensive NLP pipeline:

### 1. Text Preprocessing
- Tokenization using Natural.js
- Stopword removal
- Stemming with Porter Stemmer
- Text normalization

### 2. Sentiment Analysis
- Sentiment scoring (-1 to 1 range)
- Positive/Negative/Neutral classification
- Comparative sentiment analysis

### 3. Content Categorization
- Keyword-based classification
- Categories: fake_news, hate_speech, harassment, scam, misinformation, cyberbullying
- Confidence scoring for predictions

### 4. Toxicity Detection
- Pattern-based harmful content detection
- Multiple toxicity categories
- Severity scoring (0-1 range)

## 📊 Data Models

### User Model
- Authentication information
- Profile data
- Role-based permissions
- Contribution statistics

### Post Model
- Original content and metadata
- Author information
- NLP analysis results
- Verification status
- Engagement metrics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Comprehensive input validation
- **CORS Protection**: Cross-origin request security
- **Helmet.js**: Security headers

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-domain.com
```

### Build for Production
```bash
# Build the React app
npm run build

# Start production server
npm start
```

### Deployment Platforms
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: MongoDB Atlas, AWS DocumentDB

## 🧪 Testing

```bash
# Run frontend tests
cd client && npm test

# Run backend tests (if implemented)
cd server && npm test
```

## 📈 Performance Considerations

- **Database Indexing**: Optimized MongoDB indexes for queries
- **Pagination**: Efficient pagination for large datasets
- **Caching**: Consider Redis for frequently accessed data
- **CDN**: Use CDN for static assets in production
- **Monitoring**: Implement logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Natural.js for NLP processing
- Chart.js for data visualization
- TailwindCSS for styling
- MongoDB for database
- React ecosystem for frontend development


