import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

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

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, trendsResponse] = await Promise.all([
        axios.get('/analytics/dashboard'),
        axios.get('/analytics/trends', {
          params: {
            period: selectedPeriod,
            ...(selectedCategory && { category: selectedCategory })
          }
        })
      ]);
      
      setDashboardData(dashboardResponse.data);
      setTrendsData(trendsResponse.data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format = 'json') => {
    try {
      const response = await axios.get('/analytics/export', {
        params: { format, category: selectedCategory },
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'social_media_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'social_media_data.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    );
  }

  const { overview, distributions, insights } = dashboardData;

  // Prepare chart data
  const categoryChartData = {
    labels: distributions.categories.map(item => 
      item._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        label: 'Posts',
        data: distributions.categories.map(item => item.count),
        backgroundColor: [
          '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#6b7280'
        ]
      }
    ]
  };

  const toxicityChartData = {
    labels: insights.toxicityByCategory.map(item => 
      item._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        label: 'Average Toxicity Score',
        data: insights.toxicityByCategory.map(item => (item.avgToxicity * 100).toFixed(1)),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1
      }
    ]
  };

  const trendsChartData = trendsData ? {
    labels: trendsData.timeSeries.map(item => item._id),
    datasets: [
      {
        label: 'Posts Count',
        data: trendsData.timeSeries.map(item => item.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Avg Toxicity (%)',
        data: trendsData.timeSeries.map(item => (item.avgToxicity * 100).toFixed(1)),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Posts Count'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Toxicity %'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into social media impact detection</p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => exportData('json')}
            className="btn-outline flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => exportData('csv')}
            className="btn-outline flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Time Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <div>
            <label className="label">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              <option value="fake_news">Fake News</option>
              <option value="hate_speech">Hate Speech</option>
              <option value="harassment">Harassment</option>
              <option value="scam">Scam</option>
              <option value="misinformation">Misinformation</option>
              <option value="cyberbullying">Cyberbullying</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-900">Total Posts</h3>
          <p className="text-3xl font-bold text-primary-600">{overview.totalPosts.toLocaleString()}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
        
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
          <p className="text-3xl font-bold text-success-600">{overview.postsThisMonth.toLocaleString()}</p>
          <p className="text-sm text-gray-500">+{overview.growthRate}% growth</p>
        </div>
        
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
          <p className="text-3xl font-bold text-purple-600">{overview.totalUsers.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Contributors</p>
        </div>
        
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
          <p className="text-3xl font-bold text-warning-600">{overview.postsThisWeek.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Recent activity</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Categories</h2>
          <div className="h-80">
            <Doughnut data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Toxicity by Category */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Toxicity by Category</h2>
          <div className="h-80">
            <Bar data={toxicityChartData} options={chartOptions} />
          </div>
        </div>

        {/* Trends Over Time */}
        {trendsChartData && (
          <div className="card lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Trends Over Time ({selectedPeriod})
            </h2>
            <div className="h-80">
              <Line data={trendsChartData} options={lineChartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Top Keywords */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {insights.topKeywords.map((keyword, index) => (
            <span
              key={keyword._id}
              className={`badge ${
                index < 3 ? 'badge-danger' : 
                index < 6 ? 'badge-warning' : 'badge-gray'
              }`}
            >
              {keyword._id} ({keyword.count})
            </span>
          ))}
        </div>
      </div>

      {/* Platform and Sentiment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h2>
          <div className="space-y-3">
            {distributions.platforms.map((platform) => (
              <div key={platform._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {platform._id}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${(platform.count / Math.max(...distributions.platforms.map(p => p.count))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{platform.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h2>
          <div className="space-y-3">
            {distributions.sentiment.map((sentiment) => (
              <div key={sentiment._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {sentiment._id}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        sentiment._id === 'positive' ? 'bg-success-600' :
                        sentiment._id === 'negative' ? 'bg-danger-600' : 'bg-gray-600'
                      }`}
                      style={{
                        width: `${(sentiment.count / Math.max(...distributions.sentiment.map(s => s.count))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{sentiment.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
