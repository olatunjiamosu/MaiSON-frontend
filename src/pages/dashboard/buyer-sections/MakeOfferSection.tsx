import React, { useState, useRef } from 'react';
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
  Lock
} from 'lucide-react';
import CustomDropdown from '../../../components/CustomDropdown';
import { styles as tailwindStyles } from '../../../styles/tailwind';

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
type MortgageStatus = 'in_principle' | 'confirmed' | 'not_specified' | 'other';

// Type for move-in date options
type MoveInDate = 'asap' | '1_3_months' | '3_6_months' | '6_12_months' | 'flexible' | 'not_specified';

const MakeOfferSection: React.FC<MakeOfferSectionProps> = ({ property }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dashboardData, isLoading: isLoadingDashboard } = useDashboard();
  
  // Form state
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [displayOfferAmount, setDisplayOfferAmount] = useState<string>('');
  const [firstName, setFirstName] = useState<string>(dashboardData?.user?.first_name || '');
  const [lastName, setLastName] = useState<string>(dashboardData?.user?.last_name || '');
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
  
  const handleLogout = async () => {
    try {
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
      // This would be where the API call goes
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Your offer has been submitted successfully!');
      
      // Reset form
      setOfferAmount('');
      setDisplayOfferAmount('');
      setAdditionalNotes('');
      setMoveInDate('not_specified');
      
    } catch (error) {
      console.error('Error submitting offer:', error);
      setOfferError('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmittingOffer(false);
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
                  Additional Notes
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