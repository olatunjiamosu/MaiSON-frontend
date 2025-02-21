import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';

interface FormData {
  address: string;
  postcode: string;
  squareFootage: string;
  epcRating: string;
  bedrooms: string;
  bathrooms: string;
  receptionRooms: string;
  propertyType: 'freehold' | 'share_of_freehold' | 'leasehold' | '';
  houseType: 'detached' | 'semi-detached' | 'terraced' | 'apartment' | 'bungalow' | 'maisonette' | '';
  leaseYears?: string;
  propertyAge: string;
  photos: File[];
  priceOption: 'generate' | 'own';
  price: string;
  floorplanOption: 'generate' | 'upload';
  floorplan: File | null;
  descriptionOption: 'generate' | 'own';
  description: string;
}

const RegisterProperty = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    address: '',
    postcode: '',
    squareFootage: '',
    epcRating: '',
    bedrooms: '',
    bathrooms: '',
    receptionRooms: '',
    propertyType: '',
    houseType: '',
    propertyAge: '',
    photos: [],
    priceOption: 'generate',
    price: '',
    floorplanOption: 'generate',
    floorplan: null,
    descriptionOption: 'generate',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);

  const navigate = useNavigate();

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.address) newErrors.address = 'Property address is required';
      if (!formData.postcode) newErrors.postcode = 'Postcode is required';
      if (!formData.squareFootage) newErrors.squareFootage = 'Square footage is required';
      if (!formData.epcRating) newErrors.epcRating = 'EPC rating is required';
      if (!formData.bedrooms) newErrors.bedrooms = 'Number of bedrooms is required';
      if (!formData.bathrooms) newErrors.bathrooms = 'Number of bathrooms is required';
      if (!formData.receptionRooms) newErrors.receptionRooms = 'Number of reception rooms is required';
    }

    if (step === 2) {
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
      if (!formData.houseType) newErrors.houseType = 'House type is required';
      if (!formData.propertyAge) newErrors.propertyAge = 'Property age is required';
      if (formData.propertyType === 'leasehold' && !formData.leaseYears) {
        newErrors.leaseYears = 'Lease years is required for leasehold properties';
      }
    }

    if (step === 3) {
      if (formData.priceOption === 'own' && !formData.price) {
        newErrors.price = 'Price is required when setting own price';
      }
      if (formData.floorplanOption === 'upload' && !formData.floorplan) {
        newErrors.floorplan = 'Floorplan is required when uploading';
      }
      if (formData.descriptionOption === 'own' && !formData.description) {
        newErrors.description = 'Description is required when writing own';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      // Handle form submission
      navigate('/seller-dashboard');
    }
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const maxPhotos = 10;
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png'];
      const errors: string[] = [];

      if (selectedPhotos.length + files.length > maxPhotos) {
        alert(`You can only upload up to ${maxPhotos} photos`);
        return;
      }

      const validFiles = files.filter(file => {
        if (!allowedTypes.includes(file.type)) {
          errors.push(`${file.name} is not a supported image format`);
          return false;
        }
        if (file.size > maxSize) {
          errors.push(`${file.name} exceeds 5MB size limit`);
          return false;
        }
        return true;
      });

      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }

      setSelectedPhotos(prev => [...prev, ...validFiles].slice(0, maxPhotos));
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...validFiles].slice(0, maxPhotos)
      }));
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Basic Property Details</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Property Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
            errors.address ? 'border-red-500' : ''
          }`}
          placeholder="Enter full property address"
        />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Postcode</label>
        <input
          type="text"
          value={formData.postcode}
          onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
            errors.postcode ? 'border-red-500' : ''
          }`}
          placeholder="Enter full property postcode"
        />
        {errors.postcode && <p className="text-red-500 text-sm mt-1">{errors.postcode}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Square Footage</label>
          <input
            type="number"
            value={formData.squareFootage}
            onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
              errors.squareFootage ? 'border-red-500' : ''
            }`}
            placeholder="e.g. 1500"
          />
          {errors.squareFootage && <p className="text-red-500 text-sm mt-1">{errors.squareFootage}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">EPC Rating</label>
          <select
            value={formData.epcRating}
            onChange={(e) => setFormData({ ...formData, epcRating: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
              errors.epcRating ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select rating</option>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(rating => (
              <option key={rating} value={rating}>{rating}</option>
            ))}
          </select>
          {errors.epcRating && <p className="text-red-500 text-sm mt-1">{errors.epcRating}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
          <input
            type="number"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
              errors.bedrooms ? 'border-red-500' : ''
            }`}
            min="0"
          />
          {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
          <input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
              errors.bathrooms ? 'border-red-500' : ''
            }`}
            min="0"
          />
          {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Reception Rooms</label>
          <input
            type="number"
            value={formData.receptionRooms}
            onChange={(e) => setFormData({ ...formData, receptionRooms: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
              errors.receptionRooms ? 'border-red-500' : ''
            }`}
            min="0"
          />
          {errors.receptionRooms && <p className="text-red-500 text-sm mt-1">{errors.receptionRooms}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Property Type & Ownership</h1>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Property Type</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'freehold', label: 'Freehold' },
            { value: 'share_of_freehold', label: 'Share of Freehold' },
            { value: 'leasehold', label: 'Leasehold' }
          ].map(type => (
            <label key={type.value} className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500">
              <input
                type="radio"
                name="property_type"
                value={type.value}
                checked={formData.propertyType === type.value}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as FormData['propertyType'] })}
                className="mr-2"
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
        {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">House Type</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { value: 'detached', label: 'Detached', description: 'A standalone property not connected to any other buildings' },
            { value: 'semi-detached', label: 'Semi-Detached', description: 'A property sharing one common wall with a neighboring property' },
            { value: 'terraced', label: 'Terraced', description: 'A property sharing walls with properties on both sides' },
            { value: 'apartment', label: 'Apartment', description: 'A self-contained unit within a larger building' },
            { value: 'bungalow', label: 'Bungalow', description: 'A single-story property with all rooms at ground level' },
            { value: 'maisonette', label: 'Maisonette', description: 'A self-contained apartment over multiple floors' }
          ].map(type => (
            <label key={type.value} className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500">
              <input
                type="radio"
                name="house_type"
                value={type.value}
                checked={formData.houseType === type.value}
                onChange={(e) => setFormData({ ...formData, houseType: e.target.value as FormData['houseType'] })}
                className="mr-3"
              />
              <div>
                <span className="font-medium">{type.label}</span>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.houseType && <p className="text-red-500 text-sm mt-1">{errors.houseType}</p>}
      </div>

      {formData.propertyType === 'leasehold' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Years Remaining on Lease</label>
          <input
            type="number"
            value={formData.leaseYears}
            onChange={(e) => setFormData({ ...formData, leaseYears: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
              errors.leaseYears ? 'border-red-500' : ''
            }`}
            min="0"
          />
          {errors.leaseYears && <p className="text-red-500 text-sm mt-1">{errors.leaseYears}</p>}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Property Age</label>
        <select
          value={formData.propertyAge}
          onChange={(e) => setFormData({ ...formData, propertyAge: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
            errors.propertyAge ? 'border-red-500' : ''
          }`}
        >
          <option value="">Select age range</option>
          <option value="new">New Build</option>
          <option value="0-5">0-5 years</option>
          <option value="6-10">6-10 years</option>
          <option value="11-20">11-20 years</option>
          <option value="21-50">21-50 years</option>
          <option value="51-100">51-100 years</option>
          <option value="100+">Over 100 years</option>
        </select>
        {errors.propertyAge && <p className="text-red-500 text-sm mt-1">{errors.propertyAge}</p>}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Property Photos</label>
        <div className="p-6 border-2 border-dashed rounded-lg bg-gray-50">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <input
                type="file"
                id="photos"
                multiple
                accept="image/jpeg,image/png"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById('photos')?.click()}
                className="inline-flex items-center px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                Select Photos
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload up to 10 photos (JPG, PNG, max 5MB each)
            </p>
          </div>

          {selectedPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {selectedPhotos.map((file, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Price & Additional Details</h1>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Price Setting</h3>
        <div className="space-y-4 bg-white p-6 rounded-lg border">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500">
            <input
              type="radio"
              name="price_option"
              value="own"
              checked={formData.priceOption === 'own'}
              onChange={(e) => setFormData({ ...formData, priceOption: e.target.value as 'own' | 'generate' })}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Set my own price</span>
              {formData.priceOption === 'own' && (
                <div className="mt-2">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter price in £"
                    min="0"
                    step="1000"
                  />
                </div>
              )}
            </div>
          </label>

          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500">
            <input
              type="radio"
              name="price_option"
              value="generate"
              checked={formData.priceOption === 'generate'}
              onChange={(e) => setFormData({ ...formData, priceOption: e.target.value as 'own' | 'generate' })}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Generate recommended price</span>
              <p className="text-sm text-gray-600 mt-1">
                We'll analyze local market data to suggest an optimal price (editable later)
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Floorplan</h3>
        <div className="space-y-4 bg-white p-6 rounded-lg border">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500">
            <input
              type="radio"
              name="floorplan_option"
              value="upload"
              checked={formData.floorplanOption === 'upload'}
              onChange={(e) => setFormData({ ...formData, floorplanOption: e.target.value as 'upload' | 'generate' })}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Upload my own floorplan</span>
              {formData.floorplanOption === 'upload' && (
                <div className="mt-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png,.jpeg"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFormData({ ...formData, floorplan: e.target.files[0] });
                      }
                    }}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </label>

          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500">
            <input
              type="radio"
              name="floorplan_option"
              value="generate"
              checked={formData.floorplanOption === 'generate'}
              onChange={(e) => setFormData({ ...formData, floorplanOption: e.target.value as 'upload' | 'generate' })}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Generate editable floorplan</span>
              <p className="text-sm text-gray-600 mt-1">
                We'll create a template based on your property details (editable later)
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Property Description</h3>
        <div className="space-y-4 bg-white p-6 rounded-lg border">
          <label className="flex flex-col items-start border rounded-lg cursor-pointer hover:border-emerald-500 w-full">
            <div className="w-full p-4">
              <input
                type="radio"
                name="description_option"
                value="own"
                checked={formData.descriptionOption === 'own'}
                onChange={(e) => setFormData({ ...formData, descriptionOption: e.target.value as 'own' | 'generate' })}
                className="mr-3"
              />
              <span className="font-medium">Write my own description</span>
            </div>
            {formData.descriptionOption === 'own' && (
              <div className="w-full px-4 pb-4">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your property description"
                />
              </div>
            )}
          </label>

          <label className="flex flex-col items-start border rounded-lg cursor-pointer hover:border-emerald-500 w-full">
            <div className="w-full p-4">
              <input
                type="radio"
                name="description_option"
                value="generate"
                checked={formData.descriptionOption === 'generate'}
                onChange={(e) => setFormData({ ...formData, descriptionOption: e.target.value as 'own' | 'generate' })}
                className="mr-3"
              />
              <span className="font-medium">Generate description</span>
              <p className="text-sm text-gray-600 mt-1">
                We'll create a professional description based on your property details (editable later)
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/select-user-type" className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-emerald-600">
                  Step {currentStep} of 3
                </span>
              </div>
            </div>
            <div className="flex h-2 mb-4 overflow-hidden bg-emerald-100 rounded">
              <div 
                className="transition-all duration-500 bg-emerald-600"
                style={{ width: `${(currentStep/3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Submit Property
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterProperty;