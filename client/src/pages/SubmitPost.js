import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DocumentPlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SubmitPost = () => {
  const [formData, setFormData] = useState({
    content: '',
    platform: '',
    originalUrl: '',
    author: {
      username: '',
      profileUrl: '',
      verified: false
    },
    metadata: {
      likes: '',
      shares: '',
      comments: '',
      timestamp: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const navigate = useNavigate();

  const platforms = [
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > 5000) {
      newErrors.content = 'Content cannot exceed 5000 characters';
    }

    if (!formData.platform) {
      newErrors.platform = 'Platform is required';
    }

    if (!formData.author.username.trim()) {
      newErrors['author.username'] = 'Author username is required';
    }

    if (formData.originalUrl && !/^https?:\/\/.+/.test(formData.originalUrl)) {
      newErrors.originalUrl = 'Please enter a valid URL';
    }

    if (formData.author.profileUrl && !/^https?:\/\/.+/.test(formData.author.profileUrl)) {
      newErrors['author.profileUrl'] = 'Please enter a valid profile URL';
    }

    // Validate numeric fields
    ['likes', 'shares', 'comments'].forEach(field => {
      if (formData.metadata[field] && (isNaN(formData.metadata[field]) || formData.metadata[field] < 0)) {
        newErrors[`metadata.${field}`] = `${field} must be a non-negative number`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        metadata: {
          ...formData.metadata,
          likes: formData.metadata.likes ? parseInt(formData.metadata.likes) : 0,
          shares: formData.metadata.shares ? parseInt(formData.metadata.shares) : 0,
          comments: formData.metadata.comments ? parseInt(formData.metadata.comments) : 0,
          timestamp: formData.metadata.timestamp || new Date().toISOString()
        }
      };

      const response = await axios.post('/posts', submitData);
      
      setAnalysisResult(response.data.analysis);
      toast.success('Post submitted successfully!');
      
      // Reset form
      setFormData({
        content: '',
        platform: '',
        originalUrl: '',
        author: {
          username: '',
          profileUrl: '',
          verified: false
        },
        metadata: {
          likes: '',
          shares: '',
          comments: '',
          timestamp: ''
        }
      });

    } catch (error) {
      console.error('Submission error:', error);
      const message = error.response?.data?.message || 'Failed to submit post';
      toast.error(message);
      
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.path || err.param] = err.msg;
        });
        setErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      fake_news: 'text-danger-600 bg-danger-50',
      hate_speech: 'text-orange-600 bg-orange-50',
      harassment: 'text-red-600 bg-red-50',
      scam: 'text-yellow-600 bg-yellow-50',
      misinformation: 'text-purple-600 bg-purple-50',
      cyberbullying: 'text-pink-600 bg-pink-50',
      other: 'text-gray-600 bg-gray-50'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <DocumentPlusIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Submit Social Media Content</h1>
        <p className="text-gray-600 mt-2">
          Submit suspicious or harmful social media content for AI-powered analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-6">
            {/* Content */}
            <div>
              <label htmlFor="content" className="label">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                className={`input ${errors.content ? 'input-error' : ''}`}
                placeholder="Paste the social media content here..."
                value={formData.content}
                onChange={handleChange}
                required
              />
              <div className="flex justify-between items-center mt-1">
                {errors.content && (
                  <p className="error-message">{errors.content}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.content.length}/5000 characters
                </p>
              </div>
            </div>

            {/* Platform and URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="platform" className="label">
                  Platform *
                </label>
                <select
                  id="platform"
                  name="platform"
                  className={`input ${errors.platform ? 'input-error' : ''}`}
                  value={formData.platform}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select platform</option>
                  {platforms.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
                {errors.platform && (
                  <p className="error-message">{errors.platform}</p>
                )}
              </div>

              <div>
                <label htmlFor="originalUrl" className="label">
                  Original URL
                </label>
                <input
                  id="originalUrl"
                  name="originalUrl"
                  type="url"
                  className={`input ${errors.originalUrl ? 'input-error' : ''}`}
                  placeholder="https://..."
                  value={formData.originalUrl}
                  onChange={handleChange}
                />
                {errors.originalUrl && (
                  <p className="error-message">{errors.originalUrl}</p>
                )}
              </div>
            </div>

            {/* Author Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Author Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="author.username" className="label">
                    Username *
                  </label>
                  <input
                    id="author.username"
                    name="author.username"
                    type="text"
                    className={`input ${errors['author.username'] ? 'input-error' : ''}`}
                    placeholder="@username"
                    value={formData.author.username}
                    onChange={handleChange}
                    required
                  />
                  {errors['author.username'] && (
                    <p className="error-message">{errors['author.username']}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="author.profileUrl" className="label">
                    Profile URL
                  </label>
                  <input
                    id="author.profileUrl"
                    name="author.profileUrl"
                    type="url"
                    className={`input ${errors['author.profileUrl'] ? 'input-error' : ''}`}
                    placeholder="https://..."
                    value={formData.author.profileUrl}
                    onChange={handleChange}
                  />
                  {errors['author.profileUrl'] && (
                    <p className="error-message">{errors['author.profileUrl']}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="author.verified"
                  name="author.verified"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={formData.author.verified}
                  onChange={handleChange}
                />
                <label htmlFor="author.verified" className="ml-2 block text-sm text-gray-900">
                  Verified account
                </label>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Engagement Metrics (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="metadata.likes" className="label">
                    Likes
                  </label>
                  <input
                    id="metadata.likes"
                    name="metadata.likes"
                    type="number"
                    min="0"
                    className={`input ${errors['metadata.likes'] ? 'input-error' : ''}`}
                    placeholder="0"
                    value={formData.metadata.likes}
                    onChange={handleChange}
                  />
                  {errors['metadata.likes'] && (
                    <p className="error-message">{errors['metadata.likes']}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="metadata.shares" className="label">
                    Shares
                  </label>
                  <input
                    id="metadata.shares"
                    name="metadata.shares"
                    type="number"
                    min="0"
                    className={`input ${errors['metadata.shares'] ? 'input-error' : ''}`}
                    placeholder="0"
                    value={formData.metadata.shares}
                    onChange={handleChange}
                  />
                  {errors['metadata.shares'] && (
                    <p className="error-message">{errors['metadata.shares']}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="metadata.comments" className="label">
                    Comments
                  </label>
                  <input
                    id="metadata.comments"
                    name="metadata.comments"
                    type="number"
                    min="0"
                    className={`input ${errors['metadata.comments'] ? 'input-error' : ''}`}
                    placeholder="0"
                    value={formData.metadata.comments}
                    onChange={handleChange}
                  />
                  {errors['metadata.comments'] && (
                    <p className="error-message">{errors['metadata.comments']}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="metadata.timestamp" className="label">
                  Post Timestamp
                </label>
                <input
                  id="metadata.timestamp"
                  name="metadata.timestamp"
                  type="datetime-local"
                  className="input"
                  value={formData.metadata.timestamp}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/posts')}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  'Submit for Analysis'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Analysis Result */}
        <div className="space-y-6">
          {analysisResult && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Result</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(analysisResult.category)}`}>
                    {analysisResult.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Confidence</label>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${analysisResult.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {(analysisResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Sentiment</label>
                  <p className={`text-sm font-medium ${
                    analysisResult.sentiment === 'positive' ? 'text-success-600' :
                    analysisResult.sentiment === 'negative' ? 'text-danger-600' : 'text-gray-600'
                  }`}>
                    {analysisResult.sentiment.charAt(0).toUpperCase() + analysisResult.sentiment.slice(1)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Toxicity Score</label>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-danger-600 h-2 rounded-full"
                        style={{ width: `${analysisResult.toxicityScore * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {(analysisResult.toxicityScore * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
              Submission Guidelines
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Submit content that you believe may be harmful or misleading</p>
              <p>• Include as much context as possible (platform, author, engagement)</p>
              <p>• Original URLs help with verification</p>
              <p>• All submissions are analyzed using AI and may be reviewed by moderators</p>
              <p>• False or spam submissions may result in account restrictions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitPost;
