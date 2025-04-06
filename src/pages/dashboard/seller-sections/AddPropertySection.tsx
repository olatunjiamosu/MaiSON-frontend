import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Sparkles,
  Loader
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import PropertyService from '../../../services/PropertyService';
import PricingService from '../../../services/PricingService';
import PriceHistoryChart from '../../../components/property/PriceHistoryChart';
import { PricingApiResponse } from '../../../types/pricing';
import { CreatePropertyRequest } from '../../../types/property';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../../components/CustomDropdown';

interface PropertyFormData {
  propertyType: string;
  price: string;
  houseNumber: string;
  road: string;
  city: string;
  postcode: string;
  beds: string;
  baths: string;
  reception: string;
  sqft: string;
  description: string;
  epcRating: string;
  constructionYear: string;
  parkingSpaces: string;
  heatingType: string;
  hasGarden: boolean;
  gardenSize: string;
  hasGarage: boolean;
  images: File[];
}

interface FormErrors {
  [key: string]: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

const AddPropertySection = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const isEditMode = !!propertyId;
  
  const [formData, setFormData] = useState<PropertyFormData>({
    propertyType: '',
    price: '',
    houseNumber: '',
    road: '',
    city: '',
    postcode: '',
    beds: '',
    baths: '',
    reception: '',
    sqft: '',
    description: '',
    epcRating: '',
    constructionYear: '',
    parkingSpaces: '',
    heatingType: '',
    hasGarden: false,
    gardenSize: '',
    hasGarage: false,
    images: []
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState({ description: false, price: false });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [pricingData, setPricingData] = useState<PricingApiResponse | null>(null);
  const [showPricingChart, setShowPricingChart] = useState(false);

  // Fetch property data if in edit mode
  useEffect(() => {
    if (isEditMode && propertyId) {
      const fetchPropertyData = async () => {
        setIsLoading(true);
        try {
          const propertyData = await PropertyService.getPropertyById(propertyId);
          
          // Pre-fill form with existing data
          setFormData({
            propertyType: propertyData.specs.property_type || '',
            price: propertyData.price.toString(),
            houseNumber: propertyData.address.house_number || '',
            road: propertyData.address.street || '',
            city: propertyData.address.city || '',
            postcode: propertyData.address.postcode || '',
            beds: propertyData.specs.bedrooms.toString(),
            baths: propertyData.specs.bathrooms.toString(),
            reception: propertyData.specs.reception_rooms?.toString() || '',
            sqft: propertyData.specs.square_footage.toString(),
            description: propertyData.details?.description || '',
            epcRating: propertyData.specs.epc_rating || '',
            constructionYear: propertyData.details?.construction_year?.toString() || '',
            parkingSpaces: propertyData.details?.parking_spaces?.toString() || '',
            heatingType: propertyData.details?.heating_type || '',
            hasGarden: propertyData.features?.has_garden || false,
            gardenSize: propertyData.features?.garden_size?.toString() || '',
            hasGarage: propertyData.features?.has_garage || false,
            images: []
          });
          
          // Store existing image URLs
          if (propertyData.main_image_url) {
            setExistingImages([propertyData.main_image_url, ...(propertyData.image_urls || [])]);
          }
          
        } catch (error) {
          console.error('Error fetching property data:', error);
          toast.error('Failed to load property data');
          navigate('/seller-dashboard');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchPropertyData();
    }
  }, [propertyId, isEditMode, navigate]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    // Validate required fields
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.houseNumber) newErrors.houseNumber = 'House number is required';
    if (!formData.road) newErrors.road = 'Street address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.postcode) newErrors.postcode = 'Postcode is required';
    if (!formData.beds) newErrors.beds = 'Number of bedrooms is required';
    if (!formData.baths) newErrors.baths = 'Number of bathrooms is required';
    if (!formData.reception) newErrors.reception = 'Number of reception rooms is required';
    if (!formData.sqft) newErrors.sqft = 'Square footage is required';
    if (!formData.epcRating) newErrors.epcRating = 'EPC rating is required';
    if (!formData.constructionYear) newErrors.constructionYear = 'Construction year is required';
    if (!formData.heatingType) newErrors.heatingType = 'Heating type is required';
    if (!formData.parkingSpaces) newErrors.parkingSpaces = 'Number of parking spaces is required';
    if (formData.hasGarden && !formData.gardenSize) newErrors.gardenSize = 'Garden size is required if property has a garden';
    if (!formData.description) newErrors.description = 'Property description is required';

    // Validate numeric fields
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a number';
    }
    if (formData.beds && isNaN(Number(formData.beds))) {
      newErrors.beds = 'Bedrooms must be a number';
    }
    if (formData.baths && isNaN(Number(formData.baths))) {
      newErrors.baths = 'Bathrooms must be a number';
    }
    if (formData.reception && isNaN(Number(formData.reception))) {
      newErrors.reception = 'Reception rooms must be a number';
    }
    if (formData.sqft && isNaN(Number(formData.sqft))) {
      newErrors.sqft = 'Square footage must be a number';
    }
    if (formData.constructionYear && isNaN(Number(formData.constructionYear))) {
      newErrors.constructionYear = 'Construction year must be a number';
    }
    if (formData.parkingSpaces && isNaN(Number(formData.parkingSpaces))) {
      newErrors.parkingSpaces = 'Parking spaces must be a number';
    }
    if (formData.gardenSize && isNaN(Number(formData.gardenSize))) {
      newErrors.gardenSize = 'Garden size must be a number';
    }

    // Validate images only if not in edit mode or if new images provided
    if (!isEditMode && formData.images.length === 0) {
      newErrors.images = 'At least one property image is required';
    } else if (formData.images.length > 0) {
      const mainImage = formData.images[0];
      
      // Validate main image
      if (mainImage.size > MAX_IMAGE_SIZE) {
        newErrors.images = `Main image exceeds maximum size of 5MB`;
      } else if (!ALLOWED_IMAGE_TYPES.includes(mainImage.type)) {
        newErrors.images = `Main image must be JPG, JPEG, PNG or GIF format`;
      }
      
      // Validate additional images
      const additionalImages = formData.images.slice(1);
      for (const img of additionalImages) {
        if (img.size > MAX_IMAGE_SIZE) {
          newErrors.images = `Additional image "${img.name}" exceeds maximum size of 5MB`;
          break;
        }
        if (!ALLOWED_IMAGE_TYPES.includes(img.type)) {
          newErrors.images = `Additional image "${img.name}" must be JPG, JPEG, PNG or GIF format`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    files.forEach(file => {
      // Check file size
      if (file.size > MAX_IMAGE_SIZE) {
        invalidFiles.push(`${file.name} (exceeds 5MB size limit)`);
        return;
      }
      
      // Check file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name} (not a supported image format)`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: `Some files couldn't be added: ${invalidFiles.join(', ')}`
      }));
    } else {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.images;
        return newErrors;
      });
    }
    
    if (validFiles.length > 0) {
    setFormData(prev => ({
      ...prev,
        images: [...prev.images, ...validFiles]
    }));

    // Create preview URLs
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      // No need to set errors again, already done in validateForm
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        toast.error('You must be logged in to add a property');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare the property data according to API requirements
      // Note: The API expects seller_id, but our frontend uses user_id
      // The PropertyService will handle the field name conversion
      const propertyData: CreatePropertyRequest = {
        price: Number(formData.price),
        user_id: user.uid,
        address: {
          house_number: formData.houseNumber,
          street: formData.road,
          city: formData.city,
          postcode: formData.postcode
        },
        specs: {
          bedrooms: Number(formData.beds),
          bathrooms: Number(formData.baths),
          reception_rooms: formData.reception ? Number(formData.reception) : undefined,
          square_footage: Number(formData.sqft),
          property_type: formData.propertyType,
          epc_rating: formData.epcRating || undefined
        },
        details: {
          description: formData.description,
          construction_year: formData.constructionYear ? Number(formData.constructionYear) : undefined,
          heating_type: formData.heatingType || undefined
        },
        features: {
          has_garden: formData.hasGarden,
          garden_size: formData.gardenSize ? Number(formData.gardenSize) : undefined,
          has_garage: formData.hasGarage,
          parking_spaces: formData.parkingSpaces ? Number(formData.parkingSpaces) : undefined
        }
      };
      
      let response;
      
      if (propertyId) {
        // Update existing property
        response = await PropertyService.updateProperty(propertyId, propertyData);
        
        // Handle image updates if needed
        if (formData.images.length > 0) {
          // For demo purposes we don't actually upload images
          toast.success('Image updates are not supported in this version');
        }
        
        // Show success message and navigate immediately
        toast.success('Property updated successfully!');
        // Force navigation using window.location
        window.location.href = '/seller-dashboard';
      } else {
        // Create new property - we have two options:
        // 1. If images are present, use createPropertyWithImages
        // 2. If no images, use createProperty (direct JSON)
        
        if (formData.images.length > 0) {
          const mainImage = formData.images[0];
          const additionalImages = formData.images.slice(1);
          
          // Validate images
          if (mainImage.size > MAX_IMAGE_SIZE) {
            toast.error(`Main image exceeds maximum size of 5MB`);
            setIsSubmitting(false);
            return;
          }
          
          if (!ALLOWED_IMAGE_TYPES.includes(mainImage.type)) {
            toast.error(`Main image must be JPG, JPEG, PNG or GIF format`);
            setIsSubmitting(false);
            return;
          }
          
          // Validate additional images
          for (const img of additionalImages) {
            if (img.size > MAX_IMAGE_SIZE) {
              toast.error(`Additional image "${img.name}" exceeds maximum size of 5MB`);
              setIsSubmitting(false);
              return;
            }
            if (!ALLOWED_IMAGE_TYPES.includes(img.type)) {
              toast.error(`Additional image "${img.name}" must be JPG, JPEG, PNG or GIF format`);
              setIsSubmitting(false);
              return;
            }
          }
          
          try {
            // Call createPropertyWithImages for multipart/form-data submission
            response = await PropertyService.createPropertyWithImages(
              propertyData,
              mainImage,
              additionalImages.length > 0 ? additionalImages : undefined
            );
            
            console.log('Property created successfully with images:', response);
            
            // Force navigation using window.location
            window.location.href = '/seller-dashboard';
          } catch (apiError: any) {
            console.error('API Error details:', apiError);
            toast.error(`Failed to create property: ${apiError.message}`);
            setIsSubmitting(false);
            return;
          }
        } else {
          // No images - use direct JSON submission
          try {
            response = await PropertyService.createProperty(propertyData);
            console.log('Property created successfully without images:', response);
            
            // Force navigation using window.location
            window.location.href = '/seller-dashboard';
          } catch (apiError: any) {
            console.error('API Error details:', apiError);
            toast.error(`Failed to create property: ${apiError.message}`);
            setIsSubmitting(false);
            return;
          }
        }
      }
    } catch (err: any) {
      console.error('Error in form submission:', err);
      toast.error(`Failed to save property: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAIDescription = async () => {
    setIsGeneratingAI(prev => ({ ...prev, description: true }));
    
    try {
      // TODO: Replace with actual AI API call
      // For now, using a mock response
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    const mockResponse = "This stunning property offers a perfect blend of modern comfort and classic charm. Located in a sought-after area, it features spacious rooms with natural light throughout. The well-appointed kitchen and elegant bathrooms have been recently updated with high-quality fixtures.";
    setFormData(prev => ({ ...prev, description: mockResponse }));
      toast.success('AI description generated!');
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast.error('Failed to generate AI description');
    } finally {
      setIsGeneratingAI(prev => ({ ...prev, description: false }));
    }
  };

  const getAIPrice = async () => {
    // Validate postcode first
    if (!formData.postcode) {
      toast.error('Please enter a postcode to get a price suggestion');
      return;
    }
    
    console.log(`Getting AI price suggestion for postcode: ${formData.postcode}`);
    console.log(`Current square footage: ${formData.sqft || 'Not provided'}`);
    
    setIsGeneratingAI(prev => ({ ...prev, price: true }));
    setPricingData(null);
    setShowPricingChart(false);
    
    try {
      // Use the pricing service to get pricing data (with improved NaN handling)
      const data = await PricingService.getPricingData(formData.postcode);
      
      if (!data || !data.price_per_floor_area_per_year || data.price_per_floor_area_per_year.length === 0) {
        toast.error(`No pricing data available for ${formData.postcode}`);
        setIsGeneratingAI(prev => ({ ...prev, price: false }));
        return;
      }
      
      setPricingData(data);
      
      // Calculate price based on square footage if available
      let calculatedPrice = 350000; // Default base price
      
      if (data) {
        const recommendedPrice = PricingService.getRecommendedPrice(data);
        console.log('Recommended price data:', recommendedPrice);
        
        if (recommendedPrice) {
          if (formData.sqft && !isNaN(parseInt(formData.sqft))) {
            // Convert from price per sqm to price per sqft and calculate total
            const sqft = parseInt(formData.sqft);
            console.log(`Using square footage: ${sqft} sq ft`);
            
            // Convert sqft to sqm: 1 sq ft = 0.092903 sq m
            const sqm = sqft * 0.092903;
            console.log(`Converted to: ${sqm.toFixed(2)} sq m`);
            
            // Calculate total price based on price per square meter
            const rawPrice = recommendedPrice.pricePerSqm * sqm;
            console.log(`Raw calculation: ${recommendedPrice.pricePerSqm} £/sqm × ${sqm.toFixed(2)} sqm = £${rawPrice.toFixed(2)}`);
            
            // Round to the nearest 500
            calculatedPrice = Math.round(rawPrice / 500) * 500;
            console.log(`Rounded to nearest 500: £${calculatedPrice}`);
          } else {
            // If sqft not provided or invalid, use a default approach
            console.log('No valid square footage provided, using default price estimate');
            
            // Set a base price depending on property type
            let basePrice = 350000; // Default for undefined property type
            
            switch(formData.propertyType) {
              case 'flat':
                basePrice = 250000;
                break;
              case 'terraced':
                basePrice = 350000;
                break;
              case 'semi-detached':
                basePrice = 450000;
                break;
              case 'detached':
                basePrice = 550000;
                break;
            }
            
            // Adjust by the area's price factor compared to average
            const areaPriceFactor = recommendedPrice.pricePerSqm / 5000; // 5000 is roughly UK average £/sqm
            const rawPrice = basePrice * areaPriceFactor;
            console.log(`Raw default price calculation: ${basePrice} × area factor ${areaPriceFactor.toFixed(2)} = £${rawPrice.toFixed(2)}`);
            
            // Round to the nearest 500
            calculatedPrice = Math.round(rawPrice / 500) * 500;
            console.log(`Rounded to nearest 500: £${calculatedPrice}`);
          }
        }
      }
      
      console.log(`Final suggested price: £${calculatedPrice}`);
      
      // Update the form with the suggested price
      setFormData((prevData) => ({
        ...prevData,
        price: calculatedPrice.toString(),
      }));
      
      // Show the pricing chart
      setShowPricingChart(true);
      
      toast.success("Price suggestion generated successfully!");
    } catch (error) {
      console.error("Error generating price suggestion:", error);
      toast.error(`Failed to generate price suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset states
      setShowPricingChart(false);
      setPricingData(null);
    } finally {
      setIsGeneratingAI((prev) => ({ ...prev, price: false }));
    }
  };

  // Add this function to handle API errors properly
  const handleApiError = (error: any) => {
    console.error('API Error:', error);
    
    // Display meaningful error message based on the error type
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      if (error.response.data) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          // Display each error as a separate toast
          error.response.data.errors.forEach((err: string) => toast.error(err));
        } else if (error.response.data.error) {
          toast.error(error.response.data.error);
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(`Server error: ${error.response.status}`);
        }
      } else {
        toast.error(`Server error: ${error.response.status}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request made but no response received');
      toast.error('No response from server. Please check your network connection.');
    } else if (error instanceof Error) {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      toast.error(error.message || 'An unexpected error occurred');
    } else {
      toast.error('An unexpected error occurred');
    }
    
    // Also display a more visible error for users
    toast.error('Failed to save property. Please check the console for details or try again later.', {
      duration: 5000
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading property data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-emerald-600 hover:text-emerald-800 mb-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Property' : 'Add New Property'}
            </h2>
            <p className="text-gray-500">
              {isEditMode ? 'Update your property details below' : 'Enter your property details below'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Property Type <span className="text-red-500">*</span>
              </label>
              <div className="mt-4 relative">
                <CustomDropdown
                  value={formData.propertyType}
                  onChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                  options={[
                    { value: '', label: 'Select type' },
                    { value: 'detached', label: 'Detached House' },
                    { value: 'semi_detached', label: 'Semi-Detached House' },
                    { value: 'terraced', label: 'Terraced House' },
                    { value: 'flat', label: 'Flat/Apartment' },
                    { value: 'bungalow', label: 'Bungalow' },
                    { value: 'maisonette', label: 'Maisonette' },
                    { value: 'studio', label: 'Studio' }
                  ]}
                  icon={<Building className="h-5 w-5 text-gray-400" />}
                  placeholder="Select type"
                />
              </div>
              {errors.propertyType && (
                <p className="text-red-500 text-sm">{errors.propertyType}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    House Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4">
                    <input
                      type="text"
                      value={formData.houseNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, houseNumber: e.target.value }))}
                      className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.houseNumber ? 'border-red-500' : ''
                      }`}
                      placeholder="House number"
                    />
                  </div>
                  {errors.houseNumber && (
                    <p className="text-red-500 text-sm">{errors.houseNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Road <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4">
                    <input
                      type="text"
                      value={formData.road}
                      onChange={(e) => setFormData(prev => ({ ...prev, road: e.target.value }))}
                      className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.road ? 'border-red-500' : ''
                      }`}
                      placeholder="Street address"
                    />
                  </div>
                  {errors.road && (
                    <p className="text-red-500 text-sm">{errors.road}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4">
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.city ? 'border-red-500' : ''
                      }`}
                      placeholder="City"
                    />
                  </div>
                  {errors.city && (
                    <p className="text-red-500 text-sm">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Postcode <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4">
                    <input
                      type="text"
                      value={formData.postcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                      className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.postcode ? 'border-red-500' : ''
                      }`}
                      placeholder="Postcode"
                    />
                  </div>
                  {errors.postcode && (
                    <p className="text-red-500 text-sm">{errors.postcode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4">
                    <input
                      type="number"
                      value={formData.beds}
                      onChange={(e) => setFormData(prev => ({ ...prev, beds: e.target.value }))}
                      className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.beds ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.beds && (
                    <p className="text-red-500 text-sm">{errors.beds}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bathrooms <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4">
                    <input
                      type="number"
                      value={formData.baths}
                      onChange={(e) => setFormData(prev => ({ ...prev, baths: e.target.value }))}
                      className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.baths ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.baths && (
                    <p className="text-red-500 text-sm">{errors.baths}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reception <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4">
                    <input
                      type="number"
                      value={formData.reception}
                      onChange={(e) => setFormData(prev => ({ ...prev, reception: e.target.value }))}
                      className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.reception ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.reception && (
                    <p className="text-red-500 text-sm">{errors.reception}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Square Feet <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4">
                    <input
                      type="number"
                      value={formData.sqft}
                      onChange={(e) => setFormData(prev => ({ ...prev, sqft: e.target.value }))}
                      className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.sqft ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.sqft && (
                    <p className="text-red-500 text-sm">{errors.sqft}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    EPC Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4 relative">
                    <CustomDropdown
                      value={formData.epcRating}
                      onChange={(value) => setFormData(prev => ({ ...prev, epcRating: value }))}
                      options={[
                        { value: '', label: 'Select rating' },
                        { value: 'A', label: 'A' },
                        { value: 'B', label: 'B' },
                        { value: 'C', label: 'C' },
                        { value: 'D', label: 'D' },
                        { value: 'E', label: 'E' },
                        { value: 'F', label: 'F' },
                        { value: 'G', label: 'G' }
                      ]}
                      icon={<Info className="h-5 w-5 text-gray-400" />}
                      placeholder="Select rating"
                    />
                  </div>
                  {errors.epcRating && (
                    <p className="text-red-500 text-sm">{errors.epcRating}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Construction Year <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4">
                    <input
                      type="number"
                      value={formData.constructionYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, constructionYear: e.target.value }))}
                      className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.constructionYear ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g. 1990"
                    />
                  </div>
                  {errors.constructionYear && (
                    <p className="text-red-500 text-sm">{errors.constructionYear}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Heating Type <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-4 relative">
                    <CustomDropdown
                      value={formData.heatingType}
                      onChange={(value) => setFormData(prev => ({ ...prev, heatingType: value }))}
                      options={[
                        { value: '', label: 'Select type' },
                        { value: 'gas central', label: 'Gas Central' },
                        { value: 'electric', label: 'Electric' },
                        { value: 'oil', label: 'Oil' },
                        { value: 'solid fuel', label: 'Solid Fuel' },
                        { value: 'air source heat pump', label: 'Air Source Heat Pump' },
                        { value: 'ground source heat pump', label: 'Ground Source Heat Pump' }
                      ]}
                      icon={<Info className="h-5 w-5 text-gray-400" />}
                      placeholder="Select type"
                    />
                  </div>
                  {errors.heatingType && (
                    <p className="text-red-500 text-sm">{errors.heatingType}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="has-garden"
                      checked={formData.hasGarden}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasGarden: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has-garden" className="ml-2 block text-sm text-gray-700">
                      Has Garden
                    </label>
                  </div>
                  {formData.hasGarden && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Garden Size (sq ft)
                      </label>
                      <input
                        type="number"
                        value={formData.gardenSize}
                        onChange={(e) => setFormData(prev => ({ ...prev, gardenSize: e.target.value }))}
                        className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                          errors.gardenSize ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.gardenSize && (
                        <p className="text-red-500 text-sm">{errors.gardenSize}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="has-garage"
                      checked={formData.hasGarage}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasGarage: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has-garage" className="ml-2 block text-sm text-gray-700">
                      Has Garage
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parking Spaces <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-4">
                      <input
                        type="number"
                        value={formData.parkingSpaces}
                        onChange={(e) => setFormData(prev => ({ ...prev, parkingSpaces: e.target.value }))}
                        className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.parkingSpaces ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    {errors.parkingSpaces && (
                      <p className="text-red-500 text-sm">{errors.parkingSpaces}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Property Images <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-600">
                    Drag and drop images here, or click to select files
                  </p>
                  <p className="text-xs text-gray-500">
                    You can upload as many images as you'd like to showcase your property.
                    The first image will be used as the main image in listings.
                  </p>
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
                    className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    Select Files
                  </label>
                </div>
                
                {/* Existing Images (Edit Mode) */}
                {isEditMode && existingImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Existing Images:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={url}
                            alt={`Property ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                          {index === 0 && (
                            <span className="absolute top-0 left-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-tl-lg">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Note: Existing images cannot be removed in this version.
                    </p>
                  </div>
                )}
                
                {/* Preview of New Images */}
                {previewImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {isEditMode ? 'New Images to Upload:' : 'Selected Images:'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {previewImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Upload preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {!isEditMode && index === 0 && (
                            <span className="absolute top-0 left-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-tl-lg">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.images && (
                  <p className="text-red-500 text-sm mt-2">{errors.images}</p>
                )}
              </div>
            </div>

            {/* Description with AI assistance - MOVED BELOW IMAGES */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className={`w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                  placeholder="Describe your property..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
                <button
                  type="button"
                  onClick={getAIDescription}
                  disabled={isGeneratingAI.description}
                  className="flex items-center gap-2 px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAI.description ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                  <Sparkles className="h-4 w-4" />
                  )}
                  <span>Generate Mia Description</span>
                </button>
                <p className="text-sm text-gray-500">
                  Let AI generate a professional description based on your property details
                </p>
              </div>
            </div>

            {/* Price with AI suggestion - MOVED BELOW DESCRIPTION */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-gray-500">£</span>
                <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className={`w-full pl-7 p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.price ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter price"
                  />
              </div>
                      <button
                        type="button"
                  onClick={getAIPrice}
                  disabled={isGeneratingAI.price}
                  className="flex items-center gap-2 px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAI.price ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Analyzing market data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Mia Suggestion</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Pricing Chart and Explanation */}
              {showPricingChart && pricingData && (
                <div className="mt-6 border-t pt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Price Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Based on historical property transactions in {formData.postcode}
                    </p>
                  </div>
                  
                  {/* Pricing Chart */}
                  <PriceHistoryChart 
                    data={pricingData.price_per_floor_area_per_year} 
                    recommendedYear={
                      PricingService.getRecommendedPrice(pricingData)?.year
                    }
                  />
                  
                  {/* Pricing Explanation */}
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <h4 className="font-medium text-emerald-800 mb-2">How we calculated this price:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                      <li>
                        Used {formData.postcode} area property data from Land Registry and EPC certificates
                      </li>
                      {PricingService.getRecommendedPrice(pricingData) && (
                        <li>
                          Current market rate: £{PricingService.getRecommendedPrice(pricingData)?.pricePerSqm.toLocaleString('en-GB')} per m²
                          (£{Math.round((PricingService.getRecommendedPrice(pricingData)?.pricePerSqm || 0) * 0.092903).toLocaleString('en-GB')} per sq ft)
                        </li>
                      )}
                      {formData.sqft && PricingService.getRecommendedPrice(pricingData) && (
                        <li>
                          Your property: {formData.sqft} sq ft × £{Math.round((PricingService.getRecommendedPrice(pricingData)?.pricePerSqm || 0) * 0.092903).toLocaleString('en-GB')} = £{parseInt(formData.price).toLocaleString('en-GB')} (rounded to nearest £500)
                        </li>
                      )}
                      {PricingService.getRecommendedPrice(pricingData) && (
                        <li>
                          Based on {PricingService.getRecommendedPrice(pricingData)?.sampleSize} properties in this area
                        </li>
                      )}
                    </ul>
                    <p className="text-xs text-gray-500 mt-3">
                      Note: This is an AI-generated suggestion. Final pricing decisions should consider 
                      property condition, unique features, and current market trends.
                    </p>
                  </div>
                </div>
              )}

              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
              <p className="text-sm text-gray-500">
                Thanks for letting Mia suggest a competitive price for you based on market data!
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>{isEditMode ? 'Updating Property...' : 'Adding Property...'}</span>
                  </>
                ) : (
                  <span>{isEditMode ? 'Update Property' : 'Add Property'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPropertySection; 