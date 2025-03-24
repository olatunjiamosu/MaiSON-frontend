import React from 'react';
import { ArrowRight, Brain, Clock, Shield, Home, MessageCircle, Calendar, FileText, BarChart, Scale, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import PersistentChat from '../components/chat/PersistentChat';
import Footer from '../components/layout/Footer';
import PageTitle from '../components/PageTitle';

const FeaturesPage = () => {
  const features = [
    {
      title: 'AI-Powered Property Matching',
      description: 'Our intelligent algorithms match properties with the right buyers, optimising your selling potential.',
      icon: <Brain className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: '24/7 AI Assistant',
      description: 'Get instant answers to questions from both buyers and sellers, streamlining the entire process.',
      icon: <MessageCircle className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: 'Smart Document Management',
      description: 'Securely manage all property documents, from listings to offers, in one centralised place.',
      icon: <FileText className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: 'Real-Time Analytics',
      description: 'Track property views, interested buyers, and market trends to optimise your listing strategy.',
      icon: <BarChart className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: 'Automated Viewing Management',
      description: 'Efficiently manage viewing requests and track potential buyer interest with our automated system.',
      icon: <Calendar className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: 'Offer Management',
      description: 'Compare and analyse multiple offers with AI-powered insights to make informed decisions.',
      icon: <Scale className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: 'Price Intelligence',
      description: 'Get AI-driven price recommendations based on market data and property features.',
      icon: <TrendingUp className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: 'Secure Process',
      description: 'End-to-end security for all property transactions, documents, and communications.',
      icon: <Shield className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: 'Property Performance',
      description: 'Monitor listing performance, viewer demographics, and engagement metrics in real-time.',
      icon: <Activity className="h-8 w-8 text-emerald-600" />,
    },
  ];

  return (
    <>
      <PageTitle title="Features" />
      <div className="min-h-screen flex flex-col">
        <Navigation />

        <main className="flex-grow bg-white">
          {/* Hero Section */}
          <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-4xl font-bold text-center mb-8">
                Revolutionising Property with AI
              </h1>
              <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
                Discover how MaiSON's innovative features make property hunting smarter, faster, and more efficient.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join MaiSON today and experience the future of property transactions.
              </p>
              <Link
                to="/sign-up"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </main>

        <PersistentChat />
        <Footer />
      </div>
    </>
  );
};

export default FeaturesPage; 