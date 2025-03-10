import React from 'react';
import Navigation from '../components/layout/Navigation';
import { Building2, Users2, Trophy, Target } from 'lucide-react';
import PersistentChat from '../components/chat/PersistentChat';
import Footer from '../components/layout/Footer';

const AboutPage = () => {
  const stats = [
    { number: '-K+', label: 'Properties Listed' },
    { number: '-K+', label: 'Active Users' },
    { number: '-%', label: 'Customer Satisfaction' },
    { number: '24/7', label: 'AI Support' },
  ];

  const values = [
    {
      icon: <Building2 className="h-8 w-8 text-emerald-600" />,
      title: 'Innovation in Property',
      description: 'Revolutionising real estate through cutting-edge AI technology and user-centric design.'
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
      name: "Alex Bull",
      role: "Co-Founder",
      image: "/teamphotos/alex.jpeg"
    },
    {
      name: "Nell Norman",
      role: "Co-Founder",
      image: "/teamphotos/nell.jpeg"
    },
    {
      name: "William Holy-Hasted",
      role: "Co-Founder",
      image: "/teamphotos/will.jpeg"
    },
    {
      name: "Olatunji Amosu",
      role: "Co-Founder",
      image: "/teamphotos/ola.jpeg"
    },
    {
      name: "Rob Lovegrove",
      role: "Co-Founder",
      image: "/teamphotos/rob.jpeg"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-grow bg-white">
        {/* Hero Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-6">
              About MaiSON
            </h1>
            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
              We&apos;re transforming the property market through artificial intelligence,
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

        {/* Team Section - Updated Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.slice(0, 3).map((member) => (
                <div 
                  key={member.name}
                  className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  {member.name === "Alex Bull" || member.name === "Nell Norman" || member.name === "William Holy-Hasted"? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 mb-4" />
                  )}
                  <h3 className="text-xl font-semibold text-center">{member.name}</h3>
                  <p className="text-gray-600 text-center">{member.role}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:px-[16.666%]">
              {teamMembers.slice(3).map((member) => (
                <div 
                  key={member.name}
                  className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  {member.name === "Olatunji Amosu" || member.name === "Rob Lovegrove" ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 mb-4" />
                  )}
                  <h3 className="text-xl font-semibold text-center">{member.name}</h3>
                  <p className="text-gray-600 text-center">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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

      <PersistentChat />
      <Footer />
    </div>
  );
};

export default AboutPage; 