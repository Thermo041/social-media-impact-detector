import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profile: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      bio: user?.profile?.bio || ''
    }
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: value
      }
    }));

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

    if (formData.profile.firstName && formData.profile.firstName.length > 50) {
      newErrors.firstName = 'First name cannot exceed 50 characters';
    }

    if (formData.profile.lastName && formData.profile.lastName.length > 50) {
      newErrors.lastName = 'Last name cannot exceed 50 characters';
    }

    if (formData.profile.bio && formData.profile.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      profile: {
        firstName: user?.profile?.firstName || '',
        lastName: user?.profile?.lastName || '',
        bio: user?.profile?.bio || ''
      }
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Username and Email (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Username</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="input bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="label">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.firstName ? 'input-error' : ''}`}
                    value={formData.profile.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <p className="error-message">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="label">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.lastName ? 'input-error' : ''}`}
                    value={formData.profile.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <p className="error-message">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="label">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  disabled={!isEditing}
                  className={`input ${!isEditing ? 'bg-gray-50' : ''} ${errors.bio ? 'input-error' : ''}`}
                  placeholder="Tell us about yourself..."
                  value={formData.profile.bio}
                  onChange={handleChange}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="error-message">{errors.bio}</p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {formData.profile.bio.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Account Info */}
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Role</label>
                    <input
                      type="text"
                      value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ''}
                      disabled
                      className="input bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="label">Member Since</label>
                    <input
                      type="text"
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                      disabled
                      className="input bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* Contribution Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Contributions</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600">
                  {user?.statistics?.postsSubmitted || 0}
                </p>
                <p className="text-sm text-gray-500">Posts Submitted</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-success-600">
                  {user?.statistics?.postsVerified || 0}
                </p>
                <p className="text-sm text-gray-500">Posts Verified</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {user?.statistics?.contributionScore || 0}
                </p>
                <p className="text-sm text-gray-500">Contribution Score</p>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user?.isActive ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href="/submit"
                className="block w-full text-center btn-primary"
              >
                Submit New Post
              </a>
              <a
                href="/posts"
                className="block w-full text-center btn-outline"
              >
                View All Posts
              </a>
              <a
                href="/analytics"
                className="block w-full text-center btn-outline"
              >
                View Analytics
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
