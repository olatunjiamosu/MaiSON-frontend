import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PropertyDetail } from '../../../types/property';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useDashboard } from '../../../context/DashboardContext';
import { toast } from 'react-hot-toast';
import {
  DollarSign,
  Settings,
  LogOut,
  RefreshCw,
  Upload,
  Home,
  Briefcase,
  Building,
  User,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  X,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Check
} from 'lucide-react';
import CustomDropdown from '../../../components/CustomDropdown';
import { styles as tailwindStyles } from '../../../styles/tailwind';
import { formatPrice } from '../../../lib/formatters';

// Add custom styles for checkboxes
const styles = `
  input[type="checkbox"],
  input[type="radio"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 1rem;
    height: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    background-color: white;
    cursor: pointer;
  }

  input[type="radio"] {
    border-radius: 50%;
  }

  input[type="checkbox"]:checked,
  input[type="radio"]:checked {
    background-color: #059669;
    border-color: #059669;
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: center;
  }

  input[type="radio"]:checked {
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
  }

  input[type="checkbox"]:focus,
  input[type="radio"]:focus {
    outline: none;
    ring: 2px;
    ring-color: #059669;
  }
`;

interface MakeOfferSectionProps {
  property?: PropertyDetail;
}

// Type for buyer status options
type BuyerStatus = 'first_time_buyer' | 'chain_secured' | 'chain_not_secured' | 'no_chain' | 'not_specified' | 'other';
type PaymentMethod = 'mortgage' | 'cash' | 'not_specified' | 'other';
type MortgageStatus = 'in_principle' | 'application_submitted' | 'not_specified' | 'other';
type MoveInDate = 'asap' | '1_3_months' | '3_6_months' | '6_12_months' | 'flexible' | 'not_specified' | 'other';

// Add these mapping functions after the type definitions
const mapBuyerStatus = (status: string): BuyerStatus => {
  switch (status?.toLowerCase()) {
    case 'first_time_buyer':
    case 'first time buyer':
      return 'first_time_buyer';
    case 'chain_secured':
    case 'chain secured':
      return 'chain_secured';
    case 'chain_not_secured':
    case 'chain not secured':
      return 'chain_not_secured';
    case 'no_chain':
    case 'no chain':
      return 'no_chain';
    case 'other':
      return 'other';
    default:
      return 'not_specified';
  }
};

const mapPaymentMethod = (method: string): PaymentMethod => {
  switch (method?.toLowerCase()) {
    case 'mortgage':
      return 'mortgage';
    case 'cash':
    case 'cash buyer':
      return 'cash';
    case 'other':
      return 'other';
    default:
      return 'not_specified';
  }
};

const mapMortgageStatus = (status: string): MortgageStatus => {
  switch (status?.toLowerCase()) {
    case 'in_principle':
    case 'in principle':
    case 'aip':
      return 'in_principle';
    case 'application_submitted':
    case 'application submitted':
      return 'application_submitted';
    case 'other':
      return 'other';
    default:
      return 'not_specified';
  }
};

const mapMoveInDate = (date: string): MoveInDate => {
  switch (date?.toLowerCase()) {
    case 'asap':
    case 'as soon as possible':
      return 'asap';
    case '1_3_months':
    case '1-3 months':
      return '1_3_months';
    case '3_6_months':
    case '3-6 months':
      return '3_6_months';
    case '6_12_months':
    case '6-12 months':
      return '6_12_months';
    case 'flexible':
      return 'flexible';
    case 'other':
      return 'other';
    default:
      return 'not_specified';
  }
};

const formatBuyerStatus = (status: string): string => {
  if (status?.toLowerCase() === 'not_specified') return 'Not Specified';
  switch (status?.toLowerCase()) {
    case 'first_time_buyer':
    case 'first time buyer':
      return 'First-time buyer';
    case 'chain_secured':
    case 'chain secured':
      return 'In chain (offer secured)';
    case 'chain_not_secured':
    case 'chain not secured':
      return 'In chain (no offer yet)';
    case 'no_chain':
    case 'no chain':
      return 'No chain';
    case 'other':
      return 'Other';
    default:
      return status || 'Not Specified';
  }
};

const formatPaymentMethod = (method: string): string => {
  if (method?.toLowerCase() === 'not_specified') return 'Not Specified';
  switch (method?.toLowerCase()) {
    case 'mortgage':
      return 'Mortgage';
    case 'cash':
    case 'cash buyer':
      return 'Cash Buyer';
    case 'other':
      return 'Other';
    default:
      return method || 'Not Specified';
  }
};

const formatMortgageStatus = (status: string): string => {
  if (status?.toLowerCase() === 'not_specified') return 'Not Specified';
  switch (status?.toLowerCase()) {
    case 'in_principle':
    case 'in principle':
    case 'aip':
      return 'Mortgage in Principle (AIP)';
    case 'application_submitted':
    case 'application submitted':
      return 'Mortgage Application Submitted';
    case 'other':
      return 'Other';
    default:
      return status || 'Not Specified';
  }
};

const formatMoveInDate = (date: string): string => {
  if (date?.toLowerCase() === 'not_specified') return 'Not Specified';
  switch (date?.toLowerCase()) {
    case 'asap':
    case 'as soon as possible':
      return 'As soon as possible';
    case '1_3_months':
    case '1-3 months':
      return 'Within 1-3 months';
    case '3_6_months':
    case '3-6 months':
      return 'Within 3-6 months';
    case '6_12_months':
    case '6-12 months':
      return 'Within 6-12 months';
    case 'flexible':
      return 'Flexible';
    case 'other':
      return 'Other';
    default:
      return date || 'Not Specified';
  }
};

// Add Timeline component
const Timeline = ({ events }: { events: TimelineEvent[] }) => (
  <div className="mt-4">
    <div className="relative">
      <div className="absolute left-7 top-0 h-full w-px bg-gray-200" />
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="flex items-start relative">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
              event.completed 
                ? 'bg-emerald-100 text-emerald-600' 
                : event.current 
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
            } z-10`}>
              {event.completed ? <Check className="h-4 w-4" /> : event.icon}
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${
                event.completed 
                  ? 'text-emerald-600' 
                  : event.current 
                    ? 'text-blue-600'
                    : 'text-gray-500'
              }`}>
                {event.title}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500">{event.date}</span>
                {event.info && (
                  <span className={`text-xs ml-2 ${event.completed ? 'text-emerald-600' : 'text-gray-500'}`}>• {event.info}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Add TimelineEvent interface
interface TimelineEvent {
  title: string;
  date: string;
  completed: boolean;
  current?: boolean;
  icon: React.ReactNode;
  info?: string;
}

const MakeOfferSection: React.FC<MakeOfferSectionProps> = ({ property }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dashboardData, isLoading: isLoadingDashboard, setDashboardData, refreshDashboard } = useDashboard();
  
  // Form state
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [displayOfferAmount, setDisplayOfferAmount] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [buyerStatus, setBuyerStatus] = useState<BuyerStatus>('not_specified');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('not_specified');
  const [mortgageStatus, setMortgageStatus] = useState<MortgageStatus>('not_specified');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [moveInDate, setMoveInDate] = useState<MoveInDate>('not_specified');
  
  // Profile image
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  
  // Privacy toggles
  const [hidePaymentMethod, setHidePaymentMethod] = useState<boolean>(false);
  const [hideBuyerStatus, setHideBuyerStatus] = useState<boolean>(false);
  const [hideMoveInDate, setHideMoveInDate] = useState<boolean>(false);
  
  // UI state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState<boolean>(false);

  // Add new state variables for loading states
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [acceptLoading, setAcceptLoading] = useState<boolean>(false);
  const [rejectLoading, setRejectLoading] = useState<boolean>(false);
  const [isCounterOfferModalOpen, setIsCounterOfferModalOpen] = useState<boolean>(false);
  const [counterOfferAmount, setCounterOfferAmount] = useState<string>('');
  const [displayCounterOfferAmount, setDisplayCounterOfferAmount] = useState<string>('');
  const [counterOfferError, setCounterOfferError] = useState<string | null>(null);

  // Add this after the state declarations
  useEffect(() => {
    // Refresh dashboard data when component mounts
    refreshDashboard();
  }, []);

  // Add logging for component state
  useEffect(() => {
    console.log('MakeOfferSection state:', {
      propertyId: property?.id,
      isLoadingDashboard,
      hasNegotiationsData: !!dashboardData?.negotiations_as_buyer,
      negotiationsCount: dashboardData?.negotiations_as_buyer?.length || 0
    });
  }, [property?.id, isLoadingDashboard, dashboardData?.negotiations_as_buyer]);

  // Update first and last name when dashboard data changes
  useEffect(() => {
    if (dashboardData?.user) {
      setFirstName(dashboardData.user.first_name || '');
      setLastName(dashboardData.user.last_name || '');
    }
  }, [dashboardData]);

  // Find active negotiation from dashboard data
  const activeNegotiation = React.useMemo(() => {
    if (!property?.id || !dashboardData?.negotiations_as_buyer) {
      console.log('MakeOfferSection - Cannot check negotiations:', {
        propertyId: property?.id,
        hasNegotiations: !!dashboardData?.negotiations_as_buyer,
        isLoading: isLoadingDashboard
      });
      return null;
    }
    
    const negotiation = dashboardData.negotiations_as_buyer.find(n => 
      n.property_id === property.id && 
      n.status !== 'rejected' && 
      n.status !== 'cancelled'
    );

    console.log('MakeOfferSection - Active negotiation check:', {
      propertyId: property.id,
      negotiations: dashboardData.negotiations_as_buyer,
      found: !!negotiation,
      negotiation: negotiation
    });

    return negotiation;
  }, [property?.id, dashboardData?.negotiations_as_buyer, isLoadingDashboard]);
  
  const handleLogout = async () => {
    try {
      // Clear dashboard data
      setDashboardData(null);
      // Perform logout
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };
  
  const handleOfferAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Format the number with commas
    const formattedValue = new Intl.NumberFormat('en-US').format(Number(numericValue.replace(/,/g, '')));
    
    setDisplayOfferAmount(formattedValue);
    setOfferAmount(numericValue);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };
  
  const handleBuyerStatusChange = (value: string) => {
    setBuyerStatus(value as BuyerStatus);
  };
  
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
  };
  
  const handleMortgageStatusChange = (value: string) => {
    setMortgageStatus(value as MortgageStatus);
  };
  
  const handleMoveInDateChange = (value: string) => {
    setMoveInDate(value as MoveInDate);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setOfferError(null);
    
    // Validate offer amount
    if (!offerAmount || parseInt(offerAmount) <= 0) {
      setOfferError('Please enter a valid offer amount');
      return;
    }
    
    // Validate basic form fields - names are pre-filled and non-editable
    if (!firstName || !lastName) {
      setOfferError('Your profile information is incomplete');
      return;
    }
    
    setIsSubmittingOffer(true);
    
    try {
      // Prepare the offer data
      const offerData = {
        property_id: property?.id,
        offer_amount: Math.round(parseInt(offerAmount)),
        buyer_status: hideBuyerStatus ? undefined : buyerStatus,
        preferred_move_in_date: hideMoveInDate ? undefined : moveInDate,
        payment_method: hidePaymentMethod ? undefined : paymentMethod,
        mortgage_status: paymentMethod === 'mortgage' ? mortgageStatus : undefined,
        additional_notes: additionalNotes
      };

      // Log the data being sent
      console.log('Submitting offer with data:', offerData);

      const response = await fetch(
        `${import.meta.env.VITE_PROPERTY_API_URL}/api/users/${user?.uid}/offers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(offerData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || 'Failed to submit offer');
      }

      const newNegotiation = await response.json();
      
      // Update the dashboard data with the new negotiation
      if (dashboardData && property) {
        const updatedNegotiations = [...(dashboardData.negotiations_as_buyer || [])];
        
        // Remove any existing negotiations for this property
        const existingIndex = updatedNegotiations.findIndex(n => n.property_id === property.id);
        if (existingIndex !== -1) {
          updatedNegotiations.splice(existingIndex, 1);
        }
        
        // Add the new negotiation
        updatedNegotiations.push({
          ...newNegotiation,
          negotiation_id: newNegotiation.id,
          property_id: property.id,
          status: 'active',
          current_offer: Math.round(parseInt(offerAmount)),
          last_offer_by: user?.uid,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString(),
          transaction_history: [{
            offer_amount: Math.round(parseInt(offerAmount)),
            made_by: user?.uid,
            created_at: new Date().toISOString()
          }],
          buyer_status: buyerStatus,
          preferred_move_in_date: moveInDate,
          payment_method: paymentMethod,
          mortgage_status: mortgageStatus,
          additional_notes: additionalNotes
        });

        // Update the dashboard context
        dashboardData.negotiations_as_buyer = updatedNegotiations;
      }
      
      toast.success('Your offer has been submitted successfully!');
      
      // Reset form
      setOfferAmount('');
      setDisplayOfferAmount('');
      setAdditionalNotes('');
      setMoveInDate('not_specified');
      setBuyerStatus('not_specified');
      setPaymentMethod('not_specified');
      setMortgageStatus('not_specified');
      
    } catch (error) {
      console.error('Error submitting offer:', error);
      setOfferError('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmittingOffer(false);
    }
  };
  
  // Add handlers for actions
  const handleCancelOffer = async () => {
    if (!user?.uid || !activeNegotiation) return;
    
    setCancelLoading(true);
    try {
      const response = await fetch(
        `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${user.uid}/offers/${activeNegotiation.negotiation_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'cancel'
          })
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Offer not found or already cancelled');
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to cancel offer');
      }

      // Update the local state
      if (dashboardData) {
        const updatedNegotiations = [...(dashboardData.negotiations_as_buyer || [])];
        const index = updatedNegotiations.findIndex(n => n.negotiation_id === activeNegotiation.negotiation_id);
        if (index !== -1) {
          updatedNegotiations[index] = {
            ...updatedNegotiations[index],
            status: 'cancelled',
            last_updated: new Date().toISOString()
          };
          dashboardData.negotiations_as_buyer = updatedNegotiations;
        }
      }

      // Reset form state with user's name
      setFirstName(dashboardData?.user?.first_name || '');
      setLastName(dashboardData?.user?.last_name || '');
      setOfferAmount('');
      setDisplayOfferAmount('');
      setAdditionalNotes('');
      setMoveInDate('not_specified');
      setBuyerStatus('not_specified');
      setPaymentMethod('not_specified');
      setMortgageStatus('not_specified');

      toast.success('Offer cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling offer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel offer. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleAcceptCounterOffer = async () => {
    if (!user?.uid || !activeNegotiation) return;
    
    setAcceptLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PROPERTY_API_URL}/api/users/${user.uid}/offers/${activeNegotiation.negotiation_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'accept'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to accept counter offer');
      }

      toast.success('Counter offer accepted successfully!');
      window.location.reload(); // Refresh to update the UI
    } catch (error) {
      console.error('Error accepting counter offer:', error);
      toast.error('Failed to accept counter offer. Please try again.');
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleRejectCounterOffer = async () => {
    if (!user?.uid || !activeNegotiation) return;
    
    setRejectLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PROPERTY_API_URL}/api/users/${user.uid}/offers/${activeNegotiation.negotiation_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'reject'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject counter offer');
      }

      toast.success('Counter offer rejected successfully!');
      window.location.reload(); // Refresh to update the UI
    } catch (error) {
      console.error('Error rejecting counter offer:', error);
      toast.error('Failed to reject counter offer. Please try again.');
    } finally {
      setRejectLoading(false);
    }
  };

  const handleSubmitCounterOffer = async () => {
    if (!user?.uid || !activeNegotiation || !counterOfferAmount) return;
    
    try {
      setCounterOfferError(null);

      const numericAmount = parseFloat(counterOfferAmount.replace(/,/g, ''));
      if (!counterOfferAmount || isNaN(numericAmount)) {
        setCounterOfferError('Please enter a valid offer amount');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_PROPERTY_API_URL}/api/users/${user.uid}/offers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            property_id: property?.id,
            offer_amount: Math.round(numericAmount),
            negotiation_id: activeNegotiation.negotiation_id
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit counter offer');
      }

      setIsCounterOfferModalOpen(false);
      setCounterOfferAmount('');
      setDisplayCounterOfferAmount('');
      setCounterOfferError(null);
      
      toast.success('Counter offer submitted successfully!');
      window.location.reload(); // Refresh to update the UI
    } catch (error) {
      console.error('Error submitting counter offer:', error);
      setCounterOfferError('Failed to submit counter offer. Please try again.');
    }
  };
  
  if (!property) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Property Selected</h3>
          <p className="text-gray-500 mt-2">Select a property to make an offer</p>
        </div>
      </div>
    );
  }
  
  if (isLoadingDashboard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (activeNegotiation) {
    // Map transaction history to timeline events
    const timelineEvents = activeNegotiation.transaction_history.map(transaction => ({
      title: transaction.made_by === user?.uid ? 'Your Offer' : 'Counter Offer',
      date: new Date(transaction.created_at).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      completed: true,
      icon: <FileText className="h-3 w-3" />,
      info: `£${transaction.offer_amount.toLocaleString()}`
    }));

    // Add status update if the offer status has changed from active
    if (activeNegotiation.status !== 'active') {
      timelineEvents.push({
        title: `Offer ${activeNegotiation.status.charAt(0).toUpperCase() + activeNegotiation.status.slice(1)}`,
        date: new Date(activeNegotiation.last_updated).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        completed: true,
        icon: activeNegotiation.status === 'rejected' ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />,
        info: activeNegotiation.status === 'rejected' ? 'Offer rejected' : `£${activeNegotiation.current_offer.toLocaleString()}`
      });
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Active Offer</h2>
            <p className="text-gray-500">Current negotiation for {property.address.street}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/profile')}
            >
              <Settings className="h-6 w-6" />
            </button>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={handleLogout}
            >
              <LogOut className="h-6 w-6" />
            </button>
            <button
              className="text-gray-600 hover:text-gray-900 disabled:text-gray-300"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Listing Price Box */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Listing Price</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  £{property.price.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <Home className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Current Offer Box */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Offer</p>
                <h3 className={`text-2xl font-bold ${
                  activeNegotiation.status === 'accepted' ? 'text-emerald-600' :
                  activeNegotiation.status === 'rejected' ? 'text-red-600' :
                  activeNegotiation.status === 'counter_offer' ? 'text-blue-600' :
                  'text-gray-900'
                }`}>
                  £{activeNegotiation.current_offer.toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {((activeNegotiation.current_offer / property.price) * 100).toFixed(1)}% of listing price
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                activeNegotiation.status === 'accepted' ? 'bg-emerald-50' :
                activeNegotiation.status === 'rejected' ? 'bg-red-50' :
                activeNegotiation.status === 'counter_offer' ? 'bg-blue-50' :
                'bg-gray-50'
              }`}>
                <DollarSign className={`h-6 w-6 ${
                  activeNegotiation.status === 'accepted' ? 'text-emerald-600' :
                  activeNegotiation.status === 'rejected' ? 'text-red-600' :
                  activeNegotiation.status === 'counter_offer' ? 'text-blue-600' :
                  'text-gray-600'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Offer History Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{property.address.street}</h3>
                <p className="mt-1">
                  <span className={`${
                    activeNegotiation.last_offer_by === user?.uid
                      ? 'text-emerald-600'
                      : 'text-blue-600'
                  } font-medium`}>
                    {activeNegotiation.last_offer_by === user?.uid 
                      ? `Your offer: ${formatPrice(activeNegotiation.current_offer)}`
                      : `Seller's counter: ${formatPrice(activeNegotiation.current_offer)}`
                    }
                  </span>
                  <span className="text-gray-900 ml-1">
                    {activeNegotiation.last_offer_by === user?.uid 
                      ? 'You made an offer'
                      : 'The seller made a counter offer'
                    } on {new Date(activeNegotiation.last_updated).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                  activeNegotiation.status === 'accepted' 
                    ? 'bg-emerald-50 text-emerald-700'
                    : activeNegotiation.status === 'rejected'
                      ? 'bg-red-50 text-red-700'
                      : activeNegotiation.status === 'counter_offer'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {activeNegotiation.status === 'accepted' && <CheckCircle2 className="h-4 w-4" />}
                  {activeNegotiation.status === 'rejected' && <XCircle className="h-4 w-4" />}
                  {activeNegotiation.status === 'active' && (
                    activeNegotiation.last_offer_by === user?.uid 
                      ? <Clock className="h-4 w-4" />
                      : <AlertCircle className="h-4 w-4" />
                  )}
                  {activeNegotiation.status === 'counter_offer' && <AlertCircle className="h-4 w-4" />}
                  {activeNegotiation.status === 'accepted' ? 'Offer Accepted' :
                   activeNegotiation.status === 'rejected' ? 'Offer Rejected' :
                   activeNegotiation.status === 'active'
                     ? (activeNegotiation.last_offer_by === user?.uid ? 'Pending' : 'Action Required')
                     : activeNegotiation.status === 'counter_offer' ? 'Counter Offer Received'
                     : activeNegotiation.status.charAt(0).toUpperCase() + activeNegotiation.status.slice(1)}
                </span>
                <div className="flex items-center gap-2">
                  {(activeNegotiation.status === 'active' && activeNegotiation.last_offer_by === user?.uid) && (
                    <button
                      onClick={handleCancelOffer}
                      disabled={cancelLoading}
                      className={`px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium transition-colors
                        ${cancelLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {cancelLoading ? 'Cancelling...' : 'Cancel Offer'}
                    </button>
                  )}
                  {(activeNegotiation.status === 'counter_offer' || 
                    (activeNegotiation.status === 'active' && activeNegotiation.last_offer_by !== user?.uid)) && (
                    <>
                      <button
                        onClick={handleAcceptCounterOffer}
                        disabled={acceptLoading}
                        className={`px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-sm font-medium transition-colors
                          ${acceptLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {acceptLoading ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={handleRejectCounterOffer}
                        disabled={rejectLoading}
                        className={`px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium transition-colors
                          ${rejectLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {rejectLoading ? 'Rejecting...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => setIsCounterOfferModalOpen(true)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium"
                      >
                        Counter
                      </button>
                    </>
                  )}
                  {(activeNegotiation.status === 'rejected' || activeNegotiation.status === 'cancelled') && (
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-sm font-medium transition-colors"
                    >
                      New Offer
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Offer History</h4>
              <Timeline events={timelineEvents} />
            </div>
          </div>
        </div>

        {/* Offer Details Section - Only show if there are details */}
        {(activeNegotiation.buyer_status ||
          activeNegotiation.preferred_move_in_date ||
          activeNegotiation.payment_method ||
          activeNegotiation.mortgage_status) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Offer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeNegotiation.buyer_status && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Buyer Status</h4>
                      <p className="text-sm text-gray-600">
                        {formatBuyerStatus(activeNegotiation.buyer_status)}
                      </p>
                    </div>
                  </div>
                )}
                {activeNegotiation.preferred_move_in_date && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Preferred Move-in Date</h4>
                      <p className="text-sm text-gray-600">
                        {formatMoveInDate(activeNegotiation.preferred_move_in_date)}
                      </p>
                    </div>
                  </div>
                )}
                {activeNegotiation.payment_method && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <DollarSign className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Payment Method</h4>
                      <p className="text-sm text-gray-600">
                        {formatPaymentMethod(activeNegotiation.payment_method)}
                      </p>
                    </div>
                  </div>
                )}
                {activeNegotiation.mortgage_status && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Lock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Mortgage Status</h4>
                      <p className="text-sm text-gray-600">
                        {formatMortgageStatus(activeNegotiation.mortgage_status)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes Section */}
        {activeNegotiation.additional_notes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Message to Seller</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">{activeNegotiation.additional_notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Counter Offer Modal */}
        {isCounterOfferModalOpen && createPortal(
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999
            }}
            onClick={() => {
              setIsCounterOfferModalOpen(false);
              setCounterOfferError(null);
            }}
          >
            <div 
              className="bg-white rounded-lg p-8 w-full max-w-md relative mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setIsCounterOfferModalOpen(false);
                  setCounterOfferError(null);
                }}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">Make Counter Offer</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="counterOfferAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Counter Offer
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                      <input
                        type="text"
                        id="counterOfferAmount"
                        value={displayCounterOfferAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9,]/g, '');
                          setDisplayCounterOfferAmount(value);
                          setCounterOfferAmount(value.replace(/,/g, ''));
                        }}
                        className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter amount"
                      />
                    </div>
                    {counterOfferError && (
                      <p className="mt-2 text-sm text-red-600">{counterOfferError}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSubmitCounterOffer}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-sm transition-colors"
                  >
                    Submit Counter Offer
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }
  
  return (
    <>
      <style>{styles}</style>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
            <p className="text-gray-500">Submit your offer for {property.address.street}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/profile')}
            >
              <Settings className="h-6 w-6" />
            </button>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={handleLogout}
            >
              <LogOut className="h-6 w-6" />
            </button>
            <button
              className="text-gray-600 hover:text-gray-900 disabled:text-gray-300"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Offer Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Offer Amount */}
            <div className="space-y-1">
              <label htmlFor="offerAmount" className="block text-lg font-medium text-gray-800">
                Your Offer Amount <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-emerald-600 font-semibold text-xl">£</span>
                </div>
                <input
                  type="text"
                  id="offerAmount"
                  value={displayOfferAmount}
                  onChange={(e) => handleOfferAmountChange(e.target.value)}
                  placeholder="Enter your offer amount"
                  className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-8 pr-3 text-lg border-gray-300 rounded-md py-3"
                  required
                />
              </div>
              {offerError && (
                <p className="mt-2 text-sm text-red-600">{offerError}</p>
              )}
            </div>
            
            {/* Personal Information */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900">Your Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Image */}
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profile preview" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="absolute -bottom-1 -right-1 flex space-x-1">
                      <label className="bg-emerald-600 text-white p-1 rounded-full cursor-pointer shadow hover:bg-emerald-700">
                        <Upload className="h-4 w-4" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      {profileImagePreview && (
                        <button 
                          type="button"
                          onClick={removeProfileImage}
                          className="bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Profile Picture</p>
                    <p className="text-xs text-gray-500">Optional: Add a profile picture</p>
                  </div>
                </div>
                
                {/* Name Fields (Non-editable) */}
                <div className="space-y-4 col-span-2">
                  <div className="grid grid-cols-7 gap-2">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <div className="mt-1">
                        {isLoadingDashboard ? (
                          <div className="animate-pulse h-5 bg-white rounded w-20"></div>
                        ) : (
                          <p className="text-gray-700 font-medium py-2">{firstName}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-5">
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <div className="mt-1">
                        {isLoadingDashboard ? (
                          <div className="animate-pulse h-5 bg-white rounded w-20"></div>
                        ) : (
                          <p className="text-gray-700 font-medium py-2">{lastName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Buyer Details */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900">Buyer Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Buyer Status */}
                <div>
                  <label htmlFor="buyerStatus" className="block text-sm font-medium text-gray-700">
                    Buyer Status
                  </label>
                  <div className="mt-4 relative">
                    <CustomDropdown
                      value={buyerStatus}
                      onChange={(value) => handleBuyerStatusChange(value as string)}
                      options={[
                        { value: 'not_specified', label: 'Select buyer status' },
                        { value: 'first_time_buyer', label: 'First-time buyer' },
                        { value: 'chain_secured', label: 'In chain (offer secured)' },
                        { value: 'chain_not_secured', label: 'In chain (no offer yet)' },
                        { value: 'no_chain', label: 'No chain' },
                        { value: 'other', label: 'Other' }
                      ]}
                      icon={<User className="h-5 w-5 text-gray-400" />}
                      placeholder="Select buyer status"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Optional: Let the seller know your current situation</p>
                </div>

                {/* Move-in Date */}
                <div>
                  <label htmlFor="moveInDate" className="block text-sm font-medium text-gray-700">
                    Preferred Move-in Date
                  </label>
                  <div className="mt-4 relative">
                    <CustomDropdown
                      value={moveInDate}
                      onChange={(value) => handleMoveInDateChange(value as string)}
                      options={[
                        { value: 'not_specified', label: 'Select a timeframe' },
                        { value: 'asap', label: 'As soon as possible' },
                        { value: '1_3_months', label: 'Within 1-3 months' },
                        { value: '3_6_months', label: 'Within 3-6 months' },
                        { value: '6_12_months', label: 'Within 6-12 months' },
                        { value: 'flexible', label: 'Flexible' }
                      ]}
                      icon={<Calendar className="h-5 w-5 text-gray-400" />}
                      placeholder="Select a timeframe"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Optional: Let the seller know when you'd like to move in</p>
                </div>

                {/* Payment Method and Mortgage Status */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                        Payment Method
                      </label>
                      <div className="mt-4 relative">
                        <CustomDropdown
                          value={paymentMethod}
                          onChange={(value) => handlePaymentMethodChange(value as string)}
                          options={[
                            { value: 'not_specified', label: 'Select payment method' },
                            { value: 'mortgage', label: 'Mortgage' },
                            { value: 'cash', label: 'Cash Buyer' },
                            { value: 'other', label: 'Other' }
                          ]}
                          icon={<DollarSign className="h-5 w-5 text-gray-400" />}
                          placeholder="Select payment method"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Optional: Let the seller know how you plan to pay</p>
                    </div>

                    {paymentMethod === 'mortgage' && (
                      <div>
                        <label htmlFor="mortgageStatus" className="block text-sm font-medium text-gray-700">
                          Mortgage Status
                        </label>
                        <div className="mt-4 relative">
                          <CustomDropdown
                            value={mortgageStatus}
                            onChange={(value) => handleMortgageStatusChange(value as string)}
                            options={[
                              { value: 'not_specified', label: 'Select mortgage status' },
                              { value: 'in_principle', label: 'Mortgage in Principle (AIP)' },
                              { value: 'application_submitted', label: 'Mortgage Application Submitted' },
                              { value: 'other', label: 'Other' }
                            ]}
                            icon={<Lock className="h-5 w-5 text-gray-400" />}
                            placeholder="Select mortgage status"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Optional: Let the seller know your mortgage progress</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Additional Notes */}
              <div className="mt-8">
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
                  Message to Seller
                </label>
                <textarea
                  id="additionalNotes"
                  rows={4}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Add any additional information about your offer that might help the seller..."
                  className="appearance-none bg-white block w-full pl-3 pr-3 py-2.5 text-sm border border-emerald-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-colors duration-200 text-gray-900"
                ></textarea>
                <p className="mt-2 text-xs text-gray-500">Optional: Include any additional details about your offer</p>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmittingOffer}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {isSubmittingOffer ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Offer...
                  </>
                ) : (
                  <>
                    Submit Offer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default MakeOfferSection; 