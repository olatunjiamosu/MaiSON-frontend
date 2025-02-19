import React from 'react';
import { Brain, Users, Clock, Shield } from 'lucide-react';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MaisonLanding = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tight">
            <span>M</span>
            <span className="text-emerald-600">ai</span>
            <span>SON</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link 
              to="/features" 
              className="text-gray-600 hover:text-gray-900"
            >
              Features
            </Link>
            <Link 
              to="/listings"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View Listings
            </Link>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Contact
            </a>
            {user ? (
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            ) : (
              <>
                <button className="text-emerald-600 hover:text-emerald-700">
                  <Link to="/login" className="text-emerald-600 hover:text-emerald-700">
                    Login
                  </Link>
                </button>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                  <Link to="/sign-up">Get Started</Link>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6">
            Property Done The Intelligent Way
          </h1>
          <p className="text-xl mb-8 text-emerald-50">
            Experience the future of property transactions with our AI-powered
            platform. Save on agent commissions while getting a better service.
          </p>
          <button className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50">
            <Link to="/sign-up">Start Your Journey</Link>
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Why Choose MaiSON
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-emerald-600" />}
              title="AI-Powered Matching"
              description="Intelligent property matching based on deep learning algorithms"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-emerald-600" />}
              title="Direct Connections"
              description="Connect buyers and sellers with a 24/7 AI assistant"
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8 text-emerald-600" />}
              title="Time Saving"
              description="Automated scheduling and viewing management"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-emerald-600" />}
              title="Secure Process"
              description="End-to-end security for all documententation"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);

export default MaisonLanding;
