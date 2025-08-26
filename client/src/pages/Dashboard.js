import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  ChartBarIcon,
  DocumentPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { overview, distributions } = dashboardData;

  // Chart configurations
  const categoryChartData = {
    labels: distributions.categories.map(item => 
      item._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        label: 'Posts',
        data: distributions.categories.map(item => item.count),
        backgroundColor: [
          '#ef4444', // fake_news - red
          '#f97316', // hate_speech - orange
          '#eab308', // harassment - yellow
          '#22c55e', // scam - green
          '#3b82f6', // misinformation - blue
          '#8b5cf6', // cyberbullying - purple
          '#6b7280'  // other - gray
        ],
        borderWidth: 0
      }
    ]
  };

  const platformChartData = {
    labels: distributions.platforms.map(item => 
      item._id.charAt(0).toUpperCase() + item._id.slice(1)
    ),
    datasets: [
      {
        label: 'Posts by Platform',
        data: distributions.platforms.map(item => item.count),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1
      }
    ]
  };

  const sentimentChartData = {
    labels: distributions.sentiment.map(item => 
      item._id.charAt(0).toUpperCase() + item._id.slice(1)
    ),
    datasets: [
      {
        data: distributions.sentiment.map(item => item.count),
        backgroundColor: ['#22c55e', '#ef4444', '#6b7280'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.profile?.firstName || user?.username}!
        </h1>
        <p className="opacity-90">
          Here's an overview of social media impact detection activities.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentPlusIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{overview.totalPosts.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{overview.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{overview.postsThisMonth.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overview.growthRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/submit"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentPlusIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Submit New Post</h3>
              <p className="text-sm text-gray-500">Add suspicious content for analysis</p>
            </div>
          </Link>

          <Link
            to="/posts"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExclamationTriangleIcon className="h-8 w-8 text-warning-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">View All Posts</h3>
              <p className="text-sm text-gray-500">Browse submitted content</p>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 text-success-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">View Analytics</h3>
              <p className="text-sm text-gray-500">Detailed insights and trends</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Categories</h2>
          <div className="h-64">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h2>
          <div className="h-64">
            <Bar data={platformChartData} options={chartOptions} />
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h2>
          <div className="h-64">
            <Doughnut data={sentimentChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Verification Status */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h2>
          <div className="space-y-3">
            {distributions.verification.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  {item._id === 'verified' && <CheckCircleIcon className="h-5 w-5 text-success-500 mr-2" />}
                  {item._id === 'pending' && <ClockIcon className="h-5 w-5 text-warning-500 mr-2" />}
                  {item._id === 'disputed' && <ExclamationTriangleIcon className="h-5 w-5 text-danger-500 mr-2" />}
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {item._id.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Stats (if available) */}
      {user?.statistics && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Contributions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{user.statistics.postsSubmitted}</p>
              <p className="text-sm text-gray-500">Posts Submitted</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success-600">{user.statistics.postsVerified}</p>
              <p className="text-sm text-gray-500">Posts Verified</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{user.statistics.contributionScore}</p>
              <p className="text-sm text-gray-500">Contribution Score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
