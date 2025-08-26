import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentPlusIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      name: 'AI-Powered Analysis',
      description: 'Advanced NLP algorithms analyze social media content for harmful patterns, sentiment, and toxicity levels.',
      icon: ShieldCheckIcon,
      color: 'text-primary-600'
    },
    {
      name: 'Real-time Detection',
      description: 'Instantly categorize content into fake news, hate speech, harassment, scams, and other harmful categories.',
      icon: ExclamationTriangleIcon,
      color: 'text-danger-600'
    },
    {
      name: 'Comprehensive Analytics',
      description: 'Visualize trends, patterns, and statistics with interactive charts and detailed reports.',
      icon: ChartBarIcon,
      color: 'text-success-600'
    },
    {
      name: 'Community Driven',
      description: 'Collaborative platform where users can submit, verify, and moderate harmful content together.',
      icon: UserGroupIcon,
      color: 'text-purple-600'
    },
    {
      name: 'Content Submission',
      description: 'Easy-to-use interface for submitting suspicious social media posts for analysis and verification.',
      icon: DocumentPlusIcon,
      color: 'text-warning-600'
    },
    {
      name: 'Transparency',
      description: 'Open platform with detailed analysis results, confidence scores, and verification status.',
      icon: EyeIcon,
      color: 'text-indigo-600'
    }
  ];

  const stats = [
    { name: 'Posts Analyzed', value: '10,000+', description: 'Social media posts processed' },
    { name: 'Categories', value: '6', description: 'Types of harmful content detected' },
    { name: 'Accuracy', value: '94%', description: 'AI classification accuracy' },
    { name: 'Users', value: '500+', description: 'Active community members' }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Detect & Combat
            <span className="text-gradient block">Social Media Harm</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI-powered tool to automatically identify and analyze adverse societal impacts 
            of social media content including fake news, hate speech, harassment, and scams.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                Go to Dashboard
              </Link>
              <Link to="/submit" className="btn-outline text-lg px-8 py-3">
                Submit Content
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
              <Link to="/posts" className="btn-outline text-lg px-8 py-3">
                View Posts
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.name} className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{stat.name}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Powerful Features for Social Media Safety
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with community collaboration 
            to identify and combat harmful social media content.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.name} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 ${feature.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.name}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-100 rounded-2xl p-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="text-lg text-gray-600">
            Simple 4-step process to analyze and combat harmful social media content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Submit Content</h3>
            <p className="text-gray-600">
              Users submit suspicious social media posts for analysis
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
            <p className="text-gray-600">
              Advanced NLP algorithms analyze content for harmful patterns
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Categorization</h3>
            <p className="text-gray-600">
              Content is classified into categories like fake news, hate speech, etc.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary-600">4</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
            <p className="text-gray-600">
              Generate reports and visualizations to understand trends
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-primary-600 text-white rounded-2xl p-12 space-y-6">
        <h2 className="text-3xl font-bold">Ready to Make Social Media Safer?</h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Join our community of researchers, analysts, and concerned citizens working together 
          to identify and combat harmful social media content.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAuthenticated && (
            <>
              <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium transition-colors">
                Sign Up Now
              </Link>
              <Link to="/analytics" className="border border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-md font-medium transition-colors">
                View Analytics
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
