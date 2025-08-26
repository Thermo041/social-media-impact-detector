import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  UserIcon,
  CalendarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/posts/${id}`);
      setPost(response.data.post);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      setError(error.response?.status === 404 ? 'Post not found' : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-danger-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/posts" className="btn-primary">
          Back to Posts
        </Link>
      </div>
    );
  }

  const getCategoryColor = (category) => {
    const colors = {
      fake_news: 'bg-danger-100 text-danger-800 border-danger-200',
      hate_speech: 'bg-orange-100 text-orange-800 border-orange-200',
      harassment: 'bg-red-100 text-red-800 border-red-200',
      scam: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      misinformation: 'bg-purple-100 text-purple-800 border-purple-200',
      cyberbullying: 'bg-pink-100 text-pink-800 border-pink-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || colors.other;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      case 'disputed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-danger-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/posts"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Posts</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Header */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(post.analysis.category)}`}>
                  {post.analysis.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="badge badge-gray">
                  {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusIcon(post.verification.status)}
                <span className="text-sm text-gray-600 capitalize">
                  {post.verification.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-4">
              <UserIcon className="h-8 w-8 text-gray-400" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">@{post.author.username}</span>
                  {post.author.verified && (
                    <CheckCircleIcon className="h-4 w-4 text-primary-500" />
                  )}
                </div>
                {post.author.profileUrl && (
                  <a
                    href={post.author.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                  >
                    <LinkIcon className="h-3 w-3" />
                    <span>View Profile</span>
                  </a>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Original URL */}
            {post.originalUrl && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <a
                  href={post.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center space-x-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>View Original Post</span>
                </a>
              </div>
            )}

            {/* Engagement Metrics */}
            {(post.metadata.likes > 0 || post.metadata.shares > 0 || post.metadata.comments > 0) && (
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                {post.metadata.likes > 0 && (
                  <div className="flex items-center space-x-1">
                    <HeartIcon className="h-4 w-4" />
                    <span>{post.metadata.likes.toLocaleString()} likes</span>
                  </div>
                )}
                {post.metadata.shares > 0 && (
                  <div className="flex items-center space-x-1">
                    <ArrowPathIcon className="h-4 w-4" />
                    <span>{post.metadata.shares.toLocaleString()} shares</span>
                  </div>
                )}
                {post.metadata.comments > 0 && (
                  <div className="flex items-center space-x-1">
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    <span>{post.metadata.comments.toLocaleString()} comments</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analysis Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h2>
            
            <div className="space-y-6">
              {/* Sentiment Analysis */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sentiment Analysis</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Sentiment Score</span>
                      <span className="text-sm font-medium text-gray-900">
                        {post.analysis.sentiment.score.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          post.analysis.sentiment.score > 0 ? 'bg-success-500' :
                          post.analysis.sentiment.score < 0 ? 'bg-danger-500' : 'bg-gray-500'
                        }`}
                        style={{
                          width: `${Math.abs(post.analysis.sentiment.score) * 50 + 50}%`,
                          marginLeft: post.analysis.sentiment.score < 0 ? '0' : 'auto'
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    post.analysis.sentiment.label === 'positive' ? 'bg-success-100 text-success-800' :
                    post.analysis.sentiment.label === 'negative' ? 'bg-danger-100 text-danger-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {post.analysis.sentiment.label.charAt(0).toUpperCase() + post.analysis.sentiment.label.slice(1)}
                  </span>
                </div>
              </div>

              {/* Toxicity Analysis */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Toxicity Analysis</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Overall Toxicity</span>
                      <span className="text-sm font-medium text-gray-900">
                        {(post.analysis.toxicity.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-danger-500 h-2 rounded-full"
                        style={{ width: `${post.analysis.toxicity.score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {post.analysis.toxicity.categories && post.analysis.toxicity.categories.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Toxicity Categories:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {post.analysis.toxicity.categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-danger-100 text-danger-800 rounded text-xs"
                          >
                            {category.name}: {(category.score * 100).toFixed(1)}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Keywords */}
              {post.analysis.keywords && post.analysis.keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Key Terms</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.analysis.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Analysis Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Confidence Score</label>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full"
                      style={{ width: `${post.analysis.confidence * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {(post.analysis.confidence * 100).toFixed(1)}% confident
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Risk Level</label>
                <div className={`mt-1 px-3 py-2 rounded-md text-sm font-medium ${
                  post.analysis.toxicity.score > 0.7 ? 'bg-danger-100 text-danger-800' :
                  post.analysis.toxicity.score > 0.4 ? 'bg-warning-100 text-warning-800' :
                  'bg-success-100 text-success-800'
                }`}>
                  {post.analysis.toxicity.score > 0.7 ? 'High Risk' :
                   post.analysis.toxicity.score > 0.4 ? 'Medium Risk' : 'Low Risk'}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Submitted by:</span>
                <span className="font-medium text-gray-900">{post.submittedBy?.username}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">
                  {format(new Date(post.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>

              {post.verification.verifiedBy && (
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Verified by:</span>
                  <span className="font-medium text-gray-900">{post.verification.verifiedBy.username}</span>
                </div>
              )}
            </div>
          </div>

          {/* Verification Notes */}
          {post.verification.notes && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Notes</h3>
              <p className="text-sm text-gray-700">{post.verification.notes}</p>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default PostDetail;
