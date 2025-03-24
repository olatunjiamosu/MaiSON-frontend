import React, { useState } from 'react';
import Navigation from '../components/layout/Navigation';
import { Mail, Phone, MapPin } from 'lucide-react';
import PersistentChat from '../components/chat/PersistentChat';
import Footer from '../components/layout/Footer';
import PageTitle from '../components/PageTitle';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-emerald-600" />,
      title: 'Email',
      description: 'contact@maison.ai',
      action: 'mailto:contact@maison.ai'
    },
    {
      icon: <Phone className="h-6 w-6 text-emerald-600" />,
      title: 'Phone',
      description: '+44 (0) 20 1234 5678',
      action: 'tel:+442012345678'
    },
    {
      icon: <MapPin className="h-6 w-6 text-emerald-600" />,
      title: 'Office',
      description: 'London, United Kingdom',
      action: '#'
    }
  ];

  return (
    <>
      <PageTitle title="Contact Us" />
      <div className="min-h-screen flex flex-col">
        <Navigation />

        <main className="flex-grow bg-white">
          {/* Hero Section */}
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-4xl font-bold text-center mb-6">
                Contact Us
              </h1>
              <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
                Have questions about MaiSON? We're here to help.
              </p>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="max-w-7xl mx-auto px-4 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {contactMethods.map((method, index) => (
                <a
                  key={index}
                  href={method.action}
                  className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {method.icon}
                  <h3 className="mt-4 font-semibold">{method.title}</h3>
                  <p className="text-gray-600 text-center">{method.description}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto px-4 pb-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </main>

        <PersistentChat />
        <Footer />
      </div>
    </>
  );
};

export default ContactPage; 