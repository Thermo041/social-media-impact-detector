import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminVerification = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedPosts, setSelectedPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/posts?status=${filter}&limit=50`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkVerify = async (status) => {
    if (selectedPosts.length === 0) {
      toast.warning('Please select posts to verify');
      return;
    }

    try {
      await axios.patch('/posts/bulk/verify', {
        postIds: selectedPosts,
        status
      });

      toast.success(`Successfully ${status} ${selectedPosts.length} posts`);
      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      console.error('Bulk verification error:', error);
      toast.error('Failed to bulk verify posts');
    }
  };

  const handleSingleVerify = async (postId, status) => {
    try {
      await axios.patch(`/posts/${postId}/verify`, { status });
      toast.success(`Post ${status} successfully`);
      fetchPosts();
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify post');
    }
  };

  const togglePostSelection = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-yellow-100 text-yellow-800';
      case 'false_positive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'violence': return 'bg-red-100 text-red-800';
      case 'hate_speech': return 'bg-orange-100 text-orange-800';
      case 'cyberbullying': return 'bg-purple-100 text-purple-800';
      case 'sexual_harassment': return 'bg-pink-100 text-pink-800';
      case 'fake_news': return 'bg-blue-100 text-blue-800';
      case 'scam': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post Verification</h1>
        <p className="mt-2 text-gray-600">Review and verify submitted posts</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['pending', 'verified', 'disputed', 'false_positive'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedPosts.length} posts selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkVerify('verified')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                ✅ Verify All
              </button>
              <button
                onClick={() => handleBulkVerify('disputed')}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                ⚠️ Dispute All
              </button>
              <button
                onClick={() => handleBulkVerify('false_positive')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                ❌ False Positive All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No {filter} posts found</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {filter === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post._id)}
                      onChange={() => togglePostSelection(post._id)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.verification?.status || 'pending')}`}>
                        {post.verification?.status || 'pending'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.analysis?.category)}`}>
                        {post.analysis?.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {((post.analysis?.confidence || 0) * 100).toFixed(1)}% confidence
                      </span>
                      <span className="text-xs text-gray-500">
                        {((post.analysis?.toxicity?.score || 0) * 100).toFixed(1)}% toxic
                      </span>
                    </div>
                    
                    <p className="text-gray-900 mb-2">{post.content}</p>
                    
                    <div className="text-sm text-gray-600">
                      <span>@{post.author.username}</span>
                      <span className="mx-2">•</span>
                      <span>{post.platform}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/posts/${post._id}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                  >
                    View Details
                  </Link>
                  
                  {filter === 'pending' && (
                    <>
                      <button
                        onClick={() => handleSingleVerify(post._id, 'verified')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => handleSingleVerify(post._id, 'disputed')}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                      >
                        ⚠️
                      </button>
                      <button
                        onClick={() => handleSingleVerify(post._id, 'false_positive')}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        ❌
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminVerification;
