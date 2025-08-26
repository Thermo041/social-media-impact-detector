import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PostVerification = ({ post, onVerificationUpdate }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [notes, setNotes] = useState('');

  const handleVerify = async (status) => {
    try {
      setIsVerifying(true);
      
      const response = await axios.patch(`/posts/${post._id}/verify`, {
        status,
        notes: notes.trim() || undefined
      });

      toast.success(`Post ${status} successfully!`);
      
      // Update the post in parent component
      if (onVerificationUpdate) {
        onVerificationUpdate(post._id, {
          ...post.verification,
          status,
          verifiedAt: new Date().toISOString(),
          notes: notes.trim() || undefined
        });
      }

      setNotes('');
    } catch (error) {
      console.error('Verification error:', error);
      const message = error.response?.data?.message || 'Failed to verify post';
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'disputed': return 'text-yellow-600 bg-yellow-100';
      case 'false_positive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return '✅';
      case 'disputed': return '⚠️';
      case 'false_positive': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Post Verification</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(post.verification?.status || 'pending')}`}>
          {getStatusIcon(post.verification?.status || 'pending')} {post.verification?.status || 'pending'}
        </span>
      </div>

      {/* Post Analysis Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-gray-600">Category</div>
          <div className="font-semibold text-gray-900 capitalize">{post.analysis?.category || 'N/A'}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Confidence</div>
          <div className="font-semibold text-gray-900">{((post.analysis?.confidence || 0) * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Toxicity</div>
          <div className="font-semibold text-gray-900">{((post.analysis?.toxicity?.score || 0) * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Sentiment</div>
          <div className="font-semibold text-gray-900 capitalize">{post.analysis?.sentiment?.label || 'N/A'}</div>
        </div>
      </div>

      {/* Verification Actions */}
      {post.verification?.status === 'pending' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this verification..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              maxLength="500"
            />
            <div className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleVerify('verified')}
              disabled={isVerifying}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : '✅ Verify as Accurate'}
            </button>
            
            <button
              onClick={() => handleVerify('disputed')}
              disabled={isVerifying}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : '⚠️ Mark as Disputed'}
            </button>
            
            <button
              onClick={() => handleVerify('false_positive')}
              disabled={isVerifying}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : '❌ Mark as False Positive'}
            </button>
          </div>
        </div>
      )}

      {/* Verification Info */}
      {post.verification?.status !== 'pending' && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">
            Verified on: {new Date(post.verification.verifiedAt).toLocaleDateString()}
          </div>
          {post.verification.notes && (
            <div className="text-sm text-gray-700 mt-2">
              <strong>Notes:</strong> {post.verification.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostVerification;
