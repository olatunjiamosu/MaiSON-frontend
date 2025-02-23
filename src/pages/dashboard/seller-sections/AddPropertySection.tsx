import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Info, 
  Upload,
  Plus,
  X,
  Sparkles
} from 'lucide-react';

interface PropertyFormData {
  propertyType: string;
  price: string;
  road: string;
  city: string;
  postcode: string;
  beds: string;
  baths: string;
  reception: string;
  sqft: string;
  description: string;
  images: File[];
}

const AddPropertySection = () => {
  const [formData, setFormData] = useState<PropertyFormData>({
    propertyType: '',
    price: '',
    road: '',
    city: '',
    postcode: '',
    beds: '',
    baths: '',
    reception: '',
    sqft: '',
    description: '',
    images: []
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Implement form submission
  };

  const getAIDescription = async () => {
    // TODO: Implement AI description generation
    const mockResponse = "This stunning property offers a perfect blend of modern comfort and classic charm. Located in a sought-after area, it features spacious rooms with natural light throughout. The well-appointed kitchen and elegant bathrooms have been recently updated with high-quality fixtures.";
    setFormData(prev => ({ ...prev, description: mockResponse }));
  };

  const getAIPrice = async () => {
    // TODO: Implement AI price suggestion
    const mockResponse = "495000";
    setFormData(prev => ({ ...prev, price: mockResponse }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
        <p className="text-gray-500">Enter your property details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Property Type
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value }))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select type</option>
            <option value="house">House</option>
            <option value="flat">Flat/Apartment</option>
            <option value="bungalow">Bungalow</option>
            <option value="maisonette">Maisonette</option>
          </select>
        </div>

        {/* Price with AI suggestion */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-gray-500">£</span>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full pl-7 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter price"
              />
            </div>
            <button
              type="button"
              onClick={getAIPrice}
              className="flex items-center gap-2 px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Get Mia's Suggestion</span>
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Let Mia suggest a competitive price based on market data
          </p>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Road</label>
              <input
                type="text"
                value={formData.road}
                onChange={(e) => setFormData(prev => ({ ...prev, road: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postcode</label>
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Postcode"
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <input
                type="number"
                value={formData.beds}
                onChange={(e) => setFormData(prev => ({ ...prev, beds: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <input
                type="number"
                value={formData.baths}
                onChange={(e) => setFormData(prev => ({ ...prev, baths: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reception</label>
              <input
                type="number"
                value={formData.reception}
                onChange={(e) => setFormData(prev => ({ ...prev, reception: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Square Feet</label>
              <input
                type="number"
                value={formData.sqft}
                onChange={(e) => setFormData(prev => ({ ...prev, sqft: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Description with AI assistance */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="space-y-2">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Describe your property..."
            />
            <button
              type="button"
              onClick={getAIDescription}
              className="flex items-center gap-2 px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Mia Description</span>
            </button>
            <p className="text-sm text-gray-500">
              Let AI generate a professional description based on your property details
            </p>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Property Images
          </label>
          <div className="border-2 border-dashed rounded-lg p-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Click to upload images</span>
            </label>
          </div>

          {/* Image Previews */}
          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {previewImages.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Add Property
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPropertySection; 