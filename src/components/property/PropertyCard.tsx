import React, { useState, useEffect } from 'react';
import { Heart, FileText, X, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { formatPrice } from '../../lib/formatters';
import { PropertySummary, Negotiation } from '../../types/property';
import PropertyService from '../../services/PropertyService';
import { useAuth } from '../../context/AuthContext';
import ChatService from '../../services/ChatService';
import { getAuth } from 'firebase/auth';

// Only add UI-specific props to the API type
export interface PropertyCardProps extends PropertySummary {
  className?: string;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  showSaveButton?: boolean;
  negotiations?: Negotiation[];
  showChatButton?: boolean;
}

const PropertyCard = ({
  id,
  main_image_url,
  price,
  address,
  bedrooms,
  bathrooms,
  specs,
  seller_id,
  className = '',
  isSaved = false,
  onToggleSave,
  showSaveButton = true,
  negotiations = [],
  showChatButton = true,
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const formattedPrice = formatPrice(price);
  const [saving, setSaving] = useState(false);
  const [initiatingChat, setInitiatingChat] = useState(false);
  // Add local saved state to handle immediate UI updates
  const [localSaved, setLocalSaved] = useState(isSaved);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [displayOfferAmount, setDisplayOfferAmount] = useState('');
  const [offerError, setOfferError] = useState<string | null>(null);
  const [localNegotiations, setLocalNegotiations] = useState<Negotiation[]>(negotiations);
  const hasActiveNegotiation = localNegotiations.some(
    negotiation => negotiation.property_id === id && negotiation.status !== 'cancelled'
  );

  // Update localSaved when isSaved prop changes
  React.useEffect(() => {
    setLocalSaved(isSaved);
  }, [isSaved]);

  // Update local negotiations when props change
  useEffect(() => {
    setLocalNegotiations(negotiations);
  }, [negotiations]);

  const handleViewProperty = () => {
    navigate(`/property/${id}`, {
      state: { from: localSaved ? 'saved' : 'listings' },
    });
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Immediately update UI state for better UX
    setLocalSaved(prev => !prev);
    setSaving(true);
    
    try {
      if (localSaved) {
        // If already saved, unsave it
        if (onToggleSave) {
          await onToggleSave(id);
          toast.success('Property removed from saved list');
        } else {
          await PropertyService.unsaveProperty(id);
          toast.success('Property removed from saved list');
        }
      } else {
        // If not saved, save it
        if (onToggleSave) {
          await onToggleSave(id);
          toast.success('Property added to saved list');
        } else {
          await PropertyService.saveProperty(id);
          toast.success('Property added to saved list');
        }
      }
    } catch (error) {
      // Revert UI state on error
      setLocalSaved(prev => !prev);
      console.error('Error toggling property save status:', error);
      toast.error(localSaved 
        ? 'Failed to remove property from saved list' 
        : 'Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleViewing = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Scheduling viewing for property:', id);
    toast.success('Opening scheduling modal...', {
      duration: 3000,
      position: 'bottom-right',
    });
  };

  const handleMakeOffer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOfferModalOpen(true);
  };

  const handleSubmitOffer = async () => {
    try {
      setOfferError(null);

      if (!user) {
        setOfferError('Please log in to submit an offer');
        return;
      }

      const numericAmount = parseFloat(offerAmount.replace(/,/g, ''));
      if (!offerAmount || isNaN(numericAmount)) {
        setOfferError('Please enter a valid offer amount');
        return;
      }

      const requestBody = {
        property_id: id.toString(),
        offer_amount: Math.round(numericAmount)
      };
      
      console.log('Submitting offer with data:', requestBody);

      const response = await fetch(
        `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${user.uid}/offers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData?.message || errorData?.error || 'Failed to submit offer');
      }

      // Reset and close modal
      setOfferAmount('');
      setDisplayOfferAmount('');
      setOfferError(null);
      setIsOfferModalOpen(false);
      
      toast.success('Offer submitted successfully!', {
        duration: 3000,
        position: 'bottom-right',
      });

    } catch (error) {
      console.error('Error submitting offer:', error);
      setOfferError(error instanceof Error ? error.message : 'Failed to submit offer. Please try again.');
    }
  };

  const handleChatWithMia = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!id) return;
    
    try {
      setInitiatingChat(true);
      
      // Get the current user from Firebase auth
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Authentication required');
      }
      
      // Check if we already have a conversation for this property in localStorage
      const existingConversationId = localStorage.getItem(`property_chat_conversation_${id}`);
      
      if (existingConversationId) {
        console.log(`Found existing conversation (${existingConversationId}) for property ${id} in localStorage, verifying with backend`);
        
        try {
          // Verify with backend that this conversation still exists
          const conversationExists = await ChatService.verifyConversationExists(Number(existingConversationId), true);
          
          // If the conversation exists, redirect to it
          if (conversationExists) {
            console.log(`Verified conversation ${existingConversationId} exists on backend, redirecting to it`);
            
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
          } else {
            console.log(`Conversation ${existingConversationId} not found on backend, creating new one`);
            // If verification fails, remove the stale conversation ID from localStorage
            localStorage.removeItem(`property_chat_conversation_${id}`);
            localStorage.removeItem(`property_chat_session_${id}`);
            localStorage.removeItem(`property_chat_messages_${id}`);
          }
        } catch (verifyError) {
          console.error('Error verifying conversation:', verifyError);
          // If verification fails, remove the stale conversation ID from localStorage
          localStorage.removeItem(`property_chat_conversation_${id}`);
          localStorage.removeItem(`property_chat_session_${id}`);
          localStorage.removeItem(`property_chat_messages_${id}`);
        }
      }
      
      // Ensure we have a seller_id
      if (!seller_id) {
        throw new Error('Seller information not available for this property');
      }
      
      // Initial message to send
      const initialMessage = `I'm interested in this property at ${address.street}, ${address.city}. Can you tell me more about it?`;
      
      // Clear any existing selected chat to prevent general chats from being shown
      localStorage.removeItem('selected_chat');
      
      // Initiate the property chat
      const response = await ChatService.initiatePropertyChat(id, seller_id, initialMessage);
      
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
    } catch (error: any) {
      console.error('Error starting property chat:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('authentication required')) {
        toast.error('Please log in to chat about this property');
        // Redirect to login page with a return URL
        navigate(`/login?returnUrl=${encodeURIComponent(`/property/${id}`)}`);
      } else {
        // For other errors, show a generic message
        toast.error(`Failed to start chat: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setInitiatingChat(false);
    }
  };

  return (
    <>
      <div
        onClick={handleViewProperty}
        className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer ${className}`}
      >
        {/* Image */}
        <div className="relative h-48">
          <img
            src={main_image_url || '/placeholder-property.jpg'}
            alt={`${address.street}, ${address.city}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-property.jpg';
            }}
            loading="lazy"
          />
          {showSaveButton && (
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className={`absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label={localSaved ? "Unsave property" : "Save property"}
            >
              <Heart
                className={`h-5 w-5 ${
                  localSaved ? 'fill-emerald-600 text-emerald-600' : 'text-gray-400'
                }`}
              />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-1 mb-3">
            <h3 className="text-xl font-bold text-gray-900">{formattedPrice}</h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{address.street}</p>
              <p>
                {address.city}, {address.postcode}
              </p>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 mb-3 text-gray-600">
            <span>{bedrooms} Bed</span>
            <span>{bathrooms} Bath</span>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{specs.square_footage.toLocaleString()} sq ft</span>
            <span>{specs.property_type}</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            <button
              onClick={handleScheduleViewing}
              className="w-full border border-emerald-600 text-emerald-600 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Schedule Viewing
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasActiveNegotiation) {
                  navigate('/buyer-dashboard/applications', { 
                    replace: true,
                    state: { from: location.pathname }
                  });
                } else {
                  handleMakeOffer(e);
                }
              }}
              className={`w-full ${
                hasActiveNegotiation 
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              } py-2 rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
              <FileText className="h-4 w-4" />
              <span>{hasActiveNegotiation ? 'Offer Submitted' : 'Make an Offer'}</span>
            </button>
            {showChatButton && seller_id && (
              <button
                onClick={handleChatWithMia}
                disabled={initiatingChat}
                className={`w-full flex justify-center items-center gap-2 border border-emerald-600 text-emerald-600 py-2 rounded-lg hover:bg-emerald-50 transition-colors ${
                  initiatingChat ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {initiatingChat ? (
                  <>
                    <div className="h-4 w-4 border-t-2 border-emerald-500 border-solid rounded-full animate-spin"></div>
                    Starting chat...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    Chat with Mia about this property
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {isOfferModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={(e) => {
            e.stopPropagation();
            setIsOfferModalOpen(false);
          }}
        >
          <div 
            className="bg-white rounded-lg p-8 w-full max-w-md relative mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOfferModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal content */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Make an Offer</h3>
              <div className="flex justify-between items-center">
                <p className="text-lg text-gray-700 font-medium">{address.street}, {address.city}</p>
                <p className="text-lg font-semibold text-gray-900 ml-4">{formattedPrice}</p>
              </div>
              
              <div className="space-y-3">
                <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700">
                  Offer Amount (£)
                </label>
                <input
                  type="text"
                  id="offerAmount"
                  value={displayOfferAmount}
                  onChange={(e) => {
                    // Remove any non-digit characters except commas
                    const value = e.target.value.replace(/[^\d,]/g, '');
                    // Remove all commas and store as raw number string
                    const rawValue = value.replace(/,/g, '');
                    setOfferAmount(rawValue);
                    // Add commas for display
                    setDisplayOfferAmount(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
                    setOfferError(null);
                  }}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    offerError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your offer amount"
                />
                {offerError && (
                  <p className="text-sm text-red-600 mt-1">{offerError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmitOffer}
                  className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Submit Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyCard;
