# Deployment Guide

This guide covers deploying the Social Media Impact Detector to various platforms.

## 🚀 Quick Deployment Options

### Option 1: Replit (Recommended for Hackathons)

1. **Import Project to Replit**
   - Go to [Replit](https://replit.com)
   - Click "Create Repl" → "Import from GitHub"
   - Paste your repository URL

2. **Configure Environment**
   - Create `.env` file in the server directory
   - Add required environment variables (see README.md)
   - For MongoDB, use MongoDB Atlas free tier

3. **Install Dependencies**
   ```bash
   npm run install-all
   ```

4. **Seed Database**
   ```bash
   npm run seed
   ```

5. **Start Application**
   ```bash
   npm run dev
   ```

### Option 2: Railway

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Services**
   - Create two services: one for backend, one for frontend
   - Set root directory for backend: `server`
   - Set root directory for frontend: `client`

3. **Environment Variables**
   - Add environment variables in Railway dashboard
   - Use Railway's MongoDB plugin or MongoDB Atlas

4. **Deploy**
   - Railway will automatically deploy on git push

### Option 3: Heroku + Netlify

#### Backend (Heroku)

1. **Create Heroku App**
   ```bash
   heroku create your-app-name-api
   ```

2. **Configure Environment**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set CLIENT_URL=https://your-frontend-url.netlify.app
   ```

3. **Deploy**
   ```bash
   git subtree push --prefix server heroku main
   ```

#### Frontend (Netlify)

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Base directory: `client`

2. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-app-name-api.herokuapp.com/api
   ```

3. **Deploy**
   - Connect GitHub repository to Netlify
   - Auto-deploy on git push

## 🔧 Production Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social-media-impact
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
CLIENT_URL=https://your-frontend-domain.com
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

#### Frontend
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create free cluster
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for development)

2. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

### Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable CORS only for your domain
- [ ] Set up rate limiting
- [ ] Use HTTPS in production
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Keep dependencies updated

## 📊 Performance Optimization

### Backend Optimizations

1. **Database Indexing**
   ```javascript
   // Add to your models
   postSchema.index({ 'analysis.category': 1, createdAt: -1 });
   postSchema.index({ platform: 1, createdAt: -1 });
   postSchema.index({ submittedBy: 1, createdAt: -1 });
   ```

2. **Caching** (Optional)
   ```bash
   npm install redis
   ```

3. **Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

### Frontend Optimizations

1. **Code Splitting**
   ```javascript
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```

2. **Image Optimization**
   - Use WebP format
   - Implement lazy loading
   - Optimize bundle size

## 🔍 Monitoring & Logging

### Error Tracking
```bash
npm install @sentry/node @sentry/react
```

### Analytics
```bash
npm install @google-analytics/gtag
```

### Health Checks
```javascript
// Add to server/index.js
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CLIENT_URL environment variable
   - Verify CORS configuration

2. **Database Connection**
   - Check MongoDB URI format
   - Verify network access in MongoDB Atlas

3. **Build Failures**
   - Check Node.js version compatibility
   - Clear node_modules and reinstall

4. **Authentication Issues**
   - Verify JWT secret is set
   - Check token expiration

### Debug Commands

```bash
# Check environment variables
printenv | grep -E "(NODE_ENV|MONGODB_URI|JWT_SECRET)"

# Test database connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('DB Connected')).catch(console.error)"

# Check API endpoints
curl https://your-api-url.com/api/health
```

## 📱 Mobile Considerations

- Responsive design is already implemented
- Test on various screen sizes
- Consider PWA features for mobile app-like experience

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm run install-all
    - name: Run tests
      run: npm test
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Create an issue in the repository
4. Contact support team

---

**Happy Deploying! 🚀**
