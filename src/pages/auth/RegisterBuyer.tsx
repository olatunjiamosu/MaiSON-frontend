import React, { useState } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegisterBuyer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Step 1: Basic Property Preferences
    location: '',
    squareFootage: '',
    epcRating: '',
    bedrooms: '',
    bathrooms: '',
    receptionRooms: '',

    // Step 2: Property Type & Features
    propertyType: [],
    gardenPreference: '',

    // Step 3: Price & Details
    priceRange: '',
    description: '',
  });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = e => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      propertyType: checked
        ? [...prev.propertyType, name]
        : prev.propertyType.filter(type => type !== name),
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Home className="h-6 w-6 text-emerald-600" />
              <span className="text-2xl font-bold">
                <span>M</span>
                <span className="text-emerald-600">ai</span>
                <span>SON</span>
              </span>
            </div>
            <div className="flex space-x-6">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Home
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                Help
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative pt-1">
            <div className="flex mb-2 justify-end">
              <span className="text-xs font-semibold text-emerald-600">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="flex h-2 mb-4 overflow-hidden bg-emerald-100 rounded">
              <div
                className="bg-emerald-600 transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Step 1: Basic Property Preferences */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Basic Property Preferences
              </h2>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter city, area, or postcode"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Square Footage
                  </label>
                  <input
                    type="number"
                    name="squareFootage"
                    value={formData.squareFootage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g. 1500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    EPC Rating (Minimum)
                  </label>
                  <select
                    name="epcRating"
                    value={formData.epcRating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select rating</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Reception Rooms
                  </label>
                  <input
                    type="number"
                    name="receptionRooms"
                    value={formData.receptionRooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Room inputs */}
              </div>
            </div>
          )}

          {/* Step 2: Property Type & Features */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Preferred Property Type & Features
              </h2>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Property Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Detached', 'Semi-Detached', 'Apartment', 'Bungalow'].map(
                    type => (
                      <label
                        key={type}
                        className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500"
                      >
                        <input
                          type="checkbox"
                          name={type}
                          checked={formData.propertyType.includes(type)}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                        />
                        <span>{type}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Garden Preference
                </label>
                <select
                  name="gardenPreference"
                  value={formData.gardenPreference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select preference</option>
                  <option value="none">No Garden</option>
                  <option value="front">Front Garden Only</option>
                  <option value="back">Back Garden Only</option>
                  <option value="both">Front & Back Garden</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Price & Additional Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Price & Additional Details
              </h2>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Desired Price Range (£)
                </label>
                <input
                  type="text"
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. 250,000 - 400,000"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Property Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Describe your ideal property"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                Previous
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="ml-auto px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Submit Preferences
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterBuyer;
