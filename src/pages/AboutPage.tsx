import React from 'react';
import Navigation from '../components/layout/Navigation';
import { Building2, Users2, Trophy, Target } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { number: '10K+', label: 'Properties Listed' },
    { number: '50K+', label: 'Active Users' },
    { number: '95%', label: 'Customer Satisfaction' },
    { number: '24/7', label: 'AI Support' },
  ];

  const values = [
    {
      icon: <Building2 className="h-8 w-8 text-emerald-600" />,
      title: 'Innovation in Property',
      description: 'Revolutionizing real estate through cutting-edge AI technology and user-centric design.'
    },
    {
      icon: <Users2 className="h-8 w-8 text-emerald-600" />,
      title: 'Community First',
      description: 'Building a transparent and efficient property marketplace that serves both buyers and sellers.'
    },
    {
      icon: <Trophy className="h-8 w-8 text-emerald-600" />,
      title: 'Excellence',
      description: 'Committed to providing the highest quality service and most accurate property insights.'
    },
    {
      icon: <Target className="h-8 w-8 text-emerald-600" />,
      title: 'User Focus',
      description: 'Every feature is designed with our users\' needs in mind, ensuring a seamless experience.'
    }
  ];

  const teamMembers = [
    {
      name: 'Team Member 1',
      role: 'CEO & Founder',
      image: 'https://via.placeholder.com/150',
      description: 'Brief description about the team member and their background.'
    },
    {
      name: 'Team Member 2',
      role: 'CTO',
      image: 'https://via.placeholder.com/150',
      description: 'Brief description about the team member and their background.'
    },
    {
      name: 'Team Member 3',
      role: 'Head of AI',
      image: 'https://via.placeholder.com/150',
      description: 'Brief description about the team member and their background.'
    },
    {
      name: 'Team Member 4',
      role: 'Lead Developer',
      image: 'https://via.placeholder.com/150',
      description: 'Brief description about the team member and their background.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-6">
              About MaiSON
            </h1>
            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
              We're transforming the property market through artificial intelligence,
              making buying and selling homes simpler, faster, and more transparent.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Our Team</h2>
            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Meet the people behind MaiSON who are revolutionizing the property market.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-emerald-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To make property transactions intelligent, efficient, and accessible to everyone
              through innovative technology and exceptional service.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage; 