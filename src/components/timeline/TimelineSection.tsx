import React from 'react';
import {
  User,
  Camera,
  DollarSign,
  Home,
  Calendar,
  FileText,
  CheckCircle2,
  Circle,
  Clock,
  Building2,
  ClipboardCheck,
  FileCheck,
  Key,
  PiggyBank,
  Scale,
  Eye,
  Handshake,
  Settings,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface TimelineStep {
  title: string;
  description: string;
  icon: React.ReactElement;
  status: 'pending' | 'current' | 'completed';
  isPlaceholder?: boolean;
}

interface TimelineSectionProps {
  viewMode: 'buyer' | 'seller';
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ viewMode }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Buyer pre-offer steps
  const buyerPreOfferSteps: TimelineStep[] = [
    {
      title: 'Complete Profile',
      description: 'Fill in your details and verify your identity',
      icon: <User className="w-5 h-5" />,
      status: 'completed'
    },
    {
      title: 'Mortgage in Principle',
      description: 'Obtain mortgage in principle from your lender',
      icon: <PiggyBank className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Schedule Viewing',
      description: 'Book a viewing for properties you\'re interested in',
      icon: <Calendar className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Attend Viewing',
      description: 'Visit and evaluate the property',
      icon: <Eye className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Make an Offer',
      description: 'Submit your offer for the property',
      icon: <Handshake className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Offer Accepted',
      description: 'Your offer has been accepted by the seller',
      icon: <CheckCircle2 className="w-5 h-5" />,
      status: 'pending'
    }
  ];

  // Seller pre-offer steps
  const sellerPreOfferSteps: TimelineStep[] = [
    {
      title: 'Complete Profile',
      description: 'Fill in your details and verify your identity',
      icon: <User className="w-5 h-5" />,
      status: 'completed'
    },
    {
      title: 'Property Photos',
      description: 'Upload high-quality photos of your property',
      icon: <Camera className="w-5 h-5" />,
      status: 'completed'
    },
    {
      title: 'Set Price',
      description: 'Determine your asking price based on market value',
      icon: <DollarSign className="w-5 h-5" />,
      status: 'completed'
    },
    {
      title: 'Property Listed',
      description: 'Your property goes live on the market',
      icon: <Home className="w-5 h-5" />,
      status: 'current'
    },
    {
      title: 'Set Viewing Availability',
      description: 'Set your available times for property viewings',
      icon: <Calendar className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Complete Viewings',
      description: 'Host and complete property viewings with potential buyers',
      icon: <Home className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Receive Offers',
      description: 'Review and consider offers from potential buyers',
      icon: <FileText className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Accept Offer',
      description: 'Choose and accept the best offer',
      icon: <CheckCircle2 className="w-5 h-5" />,
      status: 'pending'
    }
  ];

  // Shared post-offer steps
  const buyerPostOfferSteps: TimelineStep[] = [
    {
      title: 'Full Mortgage Application',
      description: 'Complete and submit your full mortgage application',
      icon: <PiggyBank className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Property Survey',
      description: 'Arrange and attend property survey',
      icon: <Building2 className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Conveyancing',
      description: 'Legal work and documentation',
      icon: <Scale className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Final Checks',
      description: 'Review all documentation and agreements',
      icon: <ClipboardCheck className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Exchange Contracts',
      description: 'Sign and exchange contracts with seller',
      icon: <FileCheck className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Completion',
      description: 'Transfer payment and receive keys',
      icon: <Key className="w-5 h-5" />,
      status: 'pending'
    }
  ];

  const sellerPostOfferSteps: TimelineStep[] = [
    {
      title: '_placeholder_mortgage',
      description: '',
      icon: <div />,
      status: 'pending',
      isPlaceholder: true
    },
    {
      title: 'Property Survey',
      description: 'Allow buyer to conduct property survey',
      icon: <Building2 className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Conveyancing',
      description: 'Legal work and documentation',
      icon: <Scale className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Final Checks',
      description: 'Review all documentation and agreements',
      icon: <ClipboardCheck className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Exchange Contracts',
      description: 'Sign and exchange contracts with buyer',
      icon: <FileCheck className="w-5 h-5" />,
      status: 'pending'
    },
    {
      title: 'Completion',
      description: 'Transfer ownership and receive payment',
      icon: <Key className="w-5 h-5" />,
      status: 'pending'
    }
  ];

  const TimelineSteps: React.FC<{ steps: TimelineStep[] }> = ({ steps }) => (
    <div className="relative">
      {/* Single vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
      
      <div className="relative">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start justify-center mb-12 relative">
            {/* Left side content - even indexes */}
            <div className="w-1/2 pr-8 text-right">
              {index % 2 === 0 && (
                <>
                  <div className="flex items-center justify-end gap-3 mb-1">
                    <h3 className={`font-medium ${
                      step.status === 'completed' 
                        ? 'text-emerald-900' 
                        : step.status === 'current'
                        ? 'text-blue-900'
                        : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <div className={`p-2 rounded-lg ${
                      step.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : step.status === 'current'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {step.icon}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </>
              )}
            </div>

            {/* Circle on the line */}
            <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${
              step.status === 'completed' 
                ? 'bg-emerald-500 border-emerald-500' 
                : step.status === 'current'
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white border-gray-300'
            }`}></div>

            {/* Right side content - odd indexes */}
            <div className="w-1/2 pl-8">
              {index % 2 === 1 && (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`p-2 rounded-lg ${
                      step.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : step.status === 'current'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {step.icon}
                    </div>
                    <h3 className={`font-medium ${
                      step.status === 'completed' 
                        ? 'text-emerald-900' 
                        : step.status === 'current'
                        ? 'text-blue-900'
                        : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PostOfferTimeline: React.FC = () => {
    // Define which steps are linked (share the same circle)
    const linkedSteps: Record<string, boolean> = {
      'Property Survey': true,
      'Conveyancing': true,
      'Final Checks': true,
      'Exchange Contracts': true,
      'Completion': true
    };

    return (
      <div className="relative">
        {/* Single vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="relative">
          {buyerPostOfferSteps.map((buyerStep, index) => {
            const sellerStep = sellerPostOfferSteps[index];
            const isLinked = linkedSteps[buyerStep.title];
            
            return (
              <div key={index} className="flex items-start justify-center mb-12 relative">
                {/* Buyer side */}
                <div className="w-1/2 pr-8 text-right">
                  <div className="flex items-center justify-end gap-3 mb-1">
                    <h3 className={`font-medium ${
                      buyerStep.status === 'completed' 
                        ? 'text-emerald-900' 
                        : buyerStep.status === 'current'
                        ? 'text-blue-900'
                        : 'text-gray-900'
                    }`}>
                      {buyerStep.title}
                    </h3>
                    <div className={`p-2 rounded-lg ${
                      buyerStep.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : buyerStep.status === 'current'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {buyerStep.icon}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{buyerStep.description}</p>
                </div>

                {/* Circle on the line */}
                <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${
                  buyerStep.status === 'completed' || (sellerStep?.status === 'completed')
                    ? 'bg-emerald-500 border-emerald-500' 
                    : buyerStep.status === 'current' || (sellerStep?.status === 'current')
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}></div>

                {/* Seller side - only render if it's a linked step or placeholder */}
                {(isLinked || sellerStep?.isPlaceholder) && (
                  <div className="w-1/2 pl-8">
                    {!sellerStep?.isPlaceholder && (
                      <>
                        <div className="flex items-center gap-3 mb-1">
                          <div className={`p-2 rounded-lg ${
                            sellerStep.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : sellerStep.status === 'current'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {sellerStep.icon}
                          </div>
                          <h3 className={`font-medium ${
                            sellerStep.status === 'completed' 
                              ? 'text-emerald-900' 
                              : sellerStep.status === 'current'
                              ? 'text-blue-900'
                              : 'text-gray-900'
                          }`}>
                            {sellerStep.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">{sellerStep.description}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timeline</h2>
          <p className="text-gray-500">Track your property journey progress</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/settings')}
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
            className="text-gray-600 hover:text-gray-900"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Pre-Offer Section */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Pre-Offer
          </h2>
        </div>

        <div className="relative min-h-[400px]">
          <TimelineSteps steps={viewMode === 'buyer' ? buyerPreOfferSteps : sellerPreOfferSteps} />
        </div>
      </div>

      {/* Post-Offer Section */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Post-Offer</h2>
          </div>
        </div>

        <div className="relative min-h-[600px]">
          {/* Add subtitles for buyer and seller sides */}
          <div className="absolute top-0 left-0 right-0 flex justify-between mb-12">
            <div className="text-right w-1/3 pr-8">
              <h3 className="text-lg font-medium text-emerald-600">Buyer's Tasks</h3>
            </div>
            <div className="text-left w-1/3 pl-8">
              <h3 className="text-lg font-medium text-emerald-600">Seller's Tasks</h3>
            </div>
          </div>

          <div className="pt-16">
            <PostOfferTimeline />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSection; 