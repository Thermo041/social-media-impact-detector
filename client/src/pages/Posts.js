import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    platform: '',
    status: '',
    myPosts: false,
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchPosts();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const response = await axios.get('/posts', { params });
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      fake_news: 'bg-danger-100 text-danger-800',
      hate_speech: 'bg-orange-100 text-orange-800',
      harassment: 'bg-red-100 text-red-800',
      scam: 'bg-yellow-100 text-yellow-800',
      misinformation: 'bg-purple-100 text-purple-800',
      cyberbullying: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-4 w-4 text-success-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-warning-500" />;
      case 'disputed':
        return <ExclamationTriangleIcon className="h-4 w-4 text-danger-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const truncateContent = (content, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Media Posts</h1>
          <p className="text-gray-600">Browse and analyze submitted social media content</p>
        </div>
        <Link to="/submit" className="btn-primary">
          Submit New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        {/* My Posts Toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.myPosts}
              onChange={(e) => handleFilterChange('myPosts', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Show only my posts</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Category */}
          <select
            className="input"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="violence">Violence</option>
            <option value="hate_speech">Hate Speech</option>
            <option value="harassment">Harassment</option>
            <option value="cyberbullying">Cyberbullying</option>
            <option value="sexual_harassment">Sexual Harassment</option>
            <option value="fake_news">Fake News</option>
            <option value="scam">Scam</option>
            <option value="misinformation">Misinformation</option>
            <option value="other">Other</option>
          </select>

          {/* Platform */}
          <select
            className="input"
            value={filters.platform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
          >
            <option value="">All Platforms</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="reddit">Reddit</option>
            <option value="other">Other</option>
          </select>

          {/* Status */}
          <select
            className="input"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="disputed">Disputed</option>
            <option value="false_positive">False Positive</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or submit a new post.</p>
          <Link to="/submit" className="btn-primary">
            Submit New Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`badge ${getCategoryColor(post.analysis.category)}`}>
                      {post.analysis.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="badge badge-gray">
                      {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(post.verification.status)}
                      <span className="text-sm text-gray-500 capitalize">
                        {post.verification.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-900 mb-3">
                    {truncateContent(post.content)}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>By @{post.author.username}</span>
                    <span>•</span>
                    <span>Submitted by {post.submittedBy?.username}</span>
                    <span>•</span>
                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                    {post.metadata.likes > 0 && (
                      <>
                        <span>•</span>
                        <span>{post.metadata.likes.toLocaleString()} likes</span>
                      </>
                    )}
                  </div>

                  {/* Analysis Summary */}
                  <div className="mt-3 flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Confidence:</span>
                      <span className="font-medium text-gray-900">
                        {(post.analysis.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Sentiment:</span>
                      <span className={`font-medium ${
                        post.analysis.sentiment.label === 'positive' ? 'text-success-600' :
                        post.analysis.sentiment.label === 'negative' ? 'text-danger-600' : 'text-gray-600'
                      }`}>
                        {post.analysis.sentiment.label.charAt(0).toUpperCase() + post.analysis.sentiment.label.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Toxicity:</span>
                      <span className="font-medium text-danger-600">
                        {(post.analysis.toxicity.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 ml-4">
                  <Link
                    to={`/posts/${post._id}`}
                    className="btn-outline flex items-center space-x-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.current * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm rounded-md ${
                      page === pagination.current
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
