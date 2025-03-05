import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  MessageCircle,
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SinglePropertyMap from '../../components/map/SinglePropertyMap';
import PropertyService from '../../services/PropertyService';
import { PropertyDetail } from '../../types/property';
import { formatPrice, formatDate } from '../../lib/formatters';
import { toast } from 'react-hot-toast';
import ChatService from '../../services/ChatService';

interface PropertyDetailsProps {
  property?: {
    id: string;
    images: string[];
    price: string;
    road: string;
    city: string;
    postcode: string;
    beds: number;
    baths: number;
    reception: number;
    sqft: number;
    propertyType: string;
    epcRating: string;
    description: string;
    floorPlan: string;
    lat: number;
    lng: number;
    seller_id: string;
  };
}

const PropertyDetails = ({ property: propProperty }: PropertyDetailsProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<any>(propProperty);
  const [isSaved, setIsSaved] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);
  const [userDashboard, setUserDashboard] = useState<any>(null);
  const [initiatingChat, setInitiatingChat] = useState(false);

  useEffect(() => {
    // If property is provided via props, use that
    if (propProperty) {
      setProperty(propProperty);
      setLoading(false);
      return;
    }
    
    // Otherwise, fetch from API
    const fetchPropertyDetails = async () => {
      if (!id) {
        setError('Property ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const propertyData = await PropertyService.getPropertyById(id);
        
        // Transform API data to component format
        const transformedProperty = {
          id: propertyData.id || propertyData.property_id,
          images: propertyData.image_urls || 
                 (propertyData.main_image_url ? [propertyData.main_image_url] : 
                 ['https://images.unsplash.com/photo-1568605114967-8130f3a36994']),
          price: formatPrice(propertyData.price),
          road: propertyData.address.street,
          city: propertyData.address.city,
          postcode: propertyData.address.postcode,
          beds: propertyData.specs.bedrooms,
          baths: propertyData.specs.bathrooms,
          reception: propertyData.specs.reception_rooms || 1,
          sqft: propertyData.specs.square_footage,
          propertyType: propertyData.specs.property_type,
          epcRating: propertyData.specs.epc_rating || 'N/A',
          description: propertyData.details?.description || 'No description available',
          floorPlan: propertyData.floorplan_url || 'https://images.unsplash.com/photo-1536483229849-91bbb16321cd',
          lat: propertyData.address.latitude || 51.5074,
          lng: propertyData.address.longitude || -0.1278,
          createdAt: propertyData.created_at ? formatDate(propertyData.created_at) : 'N/A',
          seller_id: propertyData.seller_id,
        };
        
        setProperty(transformedProperty);
        setError(null);
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to load property details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyDetails();
  }, [id, propProperty]);

  // Check if property is saved
  useEffect(() => {
    const checkIfPropertyIsSaved = async () => {
      if (!id) return;

      try {
        // Get user dashboard to check saved properties
        const dashboardData = await PropertyService.getUserDashboard();
        setUserDashboard(dashboardData);

        // Check if this property is in saved properties
        const isSavedProperty = dashboardData.saved_properties?.some(
          (savedProp: any) => savedProp.property_id === id
        );
        
        setIsSaved(isSavedProperty || false);
      } catch (err) {
        console.error('Error checking if property is saved:', err);
        // Don't show an error to the user, just assume it's not saved
        setIsSaved(false);
      }
    };

    checkIfPropertyIsSaved();
  }, [id]);

  const handleBack = () => {
    // Check if we came from saved properties
    if (location.state?.from === 'saved') {
      navigate('/buyer-dashboard/saved');
    } else if (location.search?.includes('from=seller-dashboard')) {
      // If viewing from seller dashboard, navigate back to that specific property's dashboard
      navigate(`/seller-dashboard/property/${id}`);
    } else {
      navigate(-1);
    }
  };

  const handleSaveProperty = async () => {
    if (!id) return;
    
    try {
      setSavingProperty(true);
      
      if (isSaved) {
        // Unsave property - update UI first for responsiveness
        setIsSaved(false);
        await PropertyService.unsaveProperty(id);
        toast.success('Property removed from saved list', {
          duration: 3000,
          position: 'bottom-right',
          icon: '✓',
        });
      } else {
        // Save property - update UI first for responsiveness
        setIsSaved(true);
        await PropertyService.saveProperty(id);
        toast.success('Property saved successfully!', {
          duration: 3000,
          position: 'bottom-right',
          icon: '❤️',
        });
      }
    } catch (error) {
      console.error('Error toggling property save status:', error);
      // Revert UI state on error
      setIsSaved(!isSaved);
      toast.error('Failed to update saved property status. Please try again.');
    } finally {
      setSavingProperty(false);
    }
  };

  const handleChatAboutProperty = async () => {
    if (!id) return;
    
    try {
      setInitiatingChat(true);
      
      // Check if we already have a conversation for this property
      const existingConversationId = localStorage.getItem(`property_chat_conversation_${id}`);
      
      if (existingConversationId) {
        console.log(`Found existing conversation (${existingConversationId}) for property ${id}, redirecting to it`);
        
        // Store the conversation ID to select it on the property chats page
        localStorage.setItem('last_property_chat_id', existingConversationId);
        
        // Show success message
        toast.success('Redirecting to existing chat...', {
          duration: 3000,
          position: 'bottom-right',
        });
        
        // Navigate to property chats page
        navigate('/buyer-dashboard/property-chats');
        return;
      }
      
      // Get property details if not already loaded
      let propertyData = property;
      if (!propertyData) {
        propertyData = await PropertyService.getPropertyById(id);
      }
      
      // Get seller ID from property data
      if (!propertyData.seller_id) {
        throw new Error('Seller information not available for this property');
      }
      
      // Initial message to send
      const initialMessage = `I'm interested in this property at ${property.road}, ${property.city}. Can you tell me more about it?`;
      
      try {
        // Clear any existing selected chat to prevent general chats from being shown
        localStorage.removeItem('selected_chat');
        
        // Initiate the property chat
        const response = await ChatService.initiatePropertyChat(id, propertyData.seller_id, initialMessage);
        
        // Show success message
        toast.success('Chat started! Redirecting to chat window...', {
          duration: 3000,
          position: 'bottom-right',
        });
        
        // Store the conversation ID in localStorage to select it on the property chats page
        if (response.conversation_id) {
          localStorage.setItem('last_property_chat_id', response.conversation_id.toString());
          
          // Also store it as the conversation for this specific property
          localStorage.setItem(`property_chat_conversation_${id}`, response.conversation_id.toString());
        }
        
        // Navigate to property chats page
        navigate('/buyer-dashboard/property-chats');
      } catch (chatError: any) {
        console.error('Error initiating chat:', chatError);
        
        // Check if it's an authentication error
        if (chatError.message && chatError.message.includes('authentication required')) {
          toast.error('Please log in to chat about this property');
          // Redirect to login page with a return URL
          navigate(`/login?returnUrl=${encodeURIComponent(`/property/${id}`)}`);
        } else {
          // For other errors, show a generic message
          toast.error(`Failed to start chat: ${chatError.message}`);
        }
      }
    } catch (error: any) {
      console.error('Error starting property chat:', error);
      toast.error(`Error: ${error.message || 'Failed to start chat'}`);
    } finally {
      setInitiatingChat(false);
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % property.images.length);
  };

  const previousImage = () => {
    setSelectedImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-600">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-4 max-w-md text-center">
          <p className="font-bold mb-2">Error</p>
          <p>{error || 'Property not found'}</p>
        </div>
        <button 
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to{' '}
            {location.state?.from === 'saved' 
              ? 'Saved Properties' 
              : location.search?.includes('from=seller-dashboard') 
                ? 'Dashboard' 
                : 'Listings'}
          </button>
          <div className="flex gap-4">
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isSaved 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                  : 'hover:bg-gray-50'
              } ${savingProperty ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSaveProperty}
              disabled={savingProperty}
            >
              {savingProperty ? (
                <>
                  <div className="h-5 w-5 border-t-2 border-emerald-500 border-solid rounded-full animate-spin"></div>
                  {isSaved ? 'Saving...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </>
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50">
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8 relative">
          {/* Main Image Container */}
          <div
            className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}
          >
            <img
              src={property.images[selectedImage]}
              alt="Property"
              className={`
                ${
                  isFullscreen
                    ? 'h-screen w-screen object-contain'
                    : 'w-full h-[600px] object-cover rounded-lg'
                }
              `}
            />

            {/* Gallery Controls */}
            <div
              className={`absolute inset-0 flex items-center justify-between p-4 ${
                isFullscreen
                  ? 'bg-black/50'
                  : 'bg-gradient-to-r from-black/20 via-transparent to-black/20'
              }`}
            >
              {/* Previous Button */}
              <button
                onClick={previousImage}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={nextImage}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Image Counter & Fullscreen Toggle */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <div className="px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                {selectedImage + 1} / {property.images.length}
              </div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Fullscreen Close Button */}
            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Thumbnails - Only show when not in fullscreen */}
          {!isFullscreen && (
            <div className="grid grid-cols-5 gap-4 mt-4">
              {property.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-w-16 aspect-h-9 transition-all ${
                    selectedImage === index
                      ? 'ring-2 ring-emerald-600 opacity-100'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Property view ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="col-span-2 space-y-8">
            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.price}
              </h1>
              <p className="text-lg text-gray-600">
                {property.road}, {property.city}, {property.postcode}
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <p className="text-gray-600">Bedrooms</p>
                <p className="text-lg font-semibold">{property.beds}</p>
              </div>
              <div>
                <p className="text-gray-600">Bathrooms</p>
                <p className="text-lg font-semibold">{property.baths}</p>
              </div>
              <div>
                <p className="text-gray-600">Reception Rooms</p>
                <p className="text-lg font-semibold">{property.reception}</p>
              </div>
              <div>
                <p className="text-gray-600">Floor Area</p>
                <p className="text-lg font-semibold">{property.sqft} sq ft</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                About this property
              </h2>
              <p className="text-gray-600 whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Floor Plan */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Floor Plan</h2>
              <img
                src={property.floorPlan}
                alt="Floor Plan"
                className="w-full"
              />
            </div>

            {/* Location */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <SinglePropertyMap
                property={{
                  lat: property.lat,
                  lng: property.lng,
                  address: `${property.road}, ${property.city}, ${property.postcode}`,
                }}
              />
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border sticky top-24">
              <button className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mb-3">
                <Calendar className="h-5 w-5" />
                Request Viewing
              </button>
              
              <button 
                onClick={handleChatAboutProperty}
                disabled={initiatingChat}
                className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${initiatingChat ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {initiatingChat ? (
                  <>
                    <div className="h-5 w-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                    Starting chat...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5" />
                    Chat with Mia about this property
                  </>
                )}
              </button>

              {/* Additional Property Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">EPC Rating</span>
                  <span className="font-medium">{property.epcRating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modify the fullscreen section */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Close button - moved to top-left for better visibility */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 left-6 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-50"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {/* Image container */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={property.images[selectedImage]}
              alt="Property"
              className="max-h-screen max-w-screen object-contain"
            />

            {/* Navigation controls */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-8">
              <button
                onClick={previousImage}
                className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors transform hover:scale-110"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={nextImage}
                className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors transform hover:scale-110"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>

            {/* Image counter - moved to bottom center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <div className="px-4 py-2 rounded-full bg-black/50 text-white">
                {selectedImage + 1} / {property.images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
