import React, { useState, useRef, useEffect } from 'react';
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
  RefreshCw,
  X
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
  offerStatus?: 'pending' | 'accepted' | 'rejected' | 'none';
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ viewMode, offerStatus = 'none' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  console.log('TimelineSection offerStatus:', offerStatus);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [mortgageDecision, setMortgageDecision] = useState<'mortgage' | 'cash' | null>(null);
  const [mortgageProvider, setMortgageProvider] = useState<string>('');
  const [propertySurveyDecision, setPropertySurveyDecision] = useState<'yes' | 'no' | null>(null);
  const [solicitorName, setSolicitorName] = useState<string>('');
  const [solicitorContact, setSolicitorContact] = useState<string>('');
  const [sellerSolicitorName, setSellerSolicitorName] = useState<string>('');
  const [sellerSolicitorContact, setSellerSolicitorContact] = useState<string>('');

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
      title: 'Mortgage Application',
      description:
        mortgageDecision === 'cash'
          ? 'Cash buyer - no mortgage required'
          : mortgageDecision === 'mortgage'
            ? 'Please supply the details of the bank you are applying to'
            : 'Complete and submit your full mortgage application',
      icon: <PiggyBank className="w-5 h-5" />,
      status:
        mortgageDecision === 'cash'
          ? 'completed'
          : mortgageDecision === 'mortgage'
            ? 'current'
            : 'pending',
    },
    {
      title: 'Property Survey',
      description:
        propertySurveyDecision === 'no'
          ? 'Survey not required'
          : propertySurveyDecision === 'yes'
            ? 'Please provide details of surveyor'
            : 'Arrange and attend property survey',
      icon: <Building2 className="w-5 h-5" />,
      status:
        propertySurveyDecision === 'no'
          ? 'completed'
          : propertySurveyDecision === 'yes'
            ? 'current'
            : 'pending',
    },
    {
      title: 'Conveyancing',
      description:
        solicitorName
          ? `Solicitor: ${solicitorName}${solicitorContact ? ' (' + solicitorContact + ')' : ''}`
          : 'Legal work and documentation',
      icon: <Scale className="w-5 h-5" />,
      status:
        solicitorName && sellerSolicitorName
          ? 'completed'
          : solicitorName
            ? 'current'
            : 'pending',
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
      title: '_placeholder_survey',
      description: '',
      icon: <div />,
      status: 'pending',
      isPlaceholder: true
    },
    {
      title: 'Conveyancing',
      description:
        sellerSolicitorName
          ? `Solicitor: ${sellerSolicitorName}${sellerSolicitorContact ? ' (' + sellerSolicitorContact + ')' : ''}`
          : 'Legal work and documentation',
      icon: <Scale className="w-5 h-5" />,
      status:
        solicitorName && sellerSolicitorName
          ? 'completed'
          : sellerSolicitorName
            ? 'current'
            : 'pending',
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
                    <h3 className={`font-medium text-gray-900 ${
                      step.status === 'completed' 
                        ? 'text-emerald-900' 
                        : step.status === 'current'
                        ? 'text-yellow-900'
                        : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <div className={`p-2 rounded-lg ${
                      step.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : step.status === 'current'
                        ? 'bg-yellow-100 text-yellow-600'
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
                ? 'bg-yellow-500 border-yellow-500'
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
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {step.icon}
                    </div>
                    <h3 className={`font-medium text-gray-900`}>
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

  const PostOfferTimeline: React.FC<{ setIsDialogOpen: (open: boolean) => void }> = ({ setIsDialogOpen }) => {
    // Define which steps are linked (share the same circle)
    const linkedSteps: Record<string, boolean> = {
      'Property Survey': true,
      'Conveyancing': true,
      'Final Checks': true,
      'Exchange Contracts': true,
      'Completion': true
    };

    const timelineContainerRef = useRef<HTMLDivElement>(null);
    const lastRowRef = useRef<HTMLDivElement>(null);
    const [lineHeight, setLineHeight] = useState<string>('100%');

    useEffect(() => {
      if (timelineContainerRef.current && lastRowRef.current) {
        const containerRect = timelineContainerRef.current.getBoundingClientRect();
        const lastRowRect = lastRowRef.current.getBoundingClientRect();
        // Calculate the distance from the top of the container to the center of the last row
        const height = lastRowRect.top + lastRowRect.height / 2 - containerRect.top;
        setLineHeight(`${height}px`);
      }
    }, [timelineContainerRef.current, lastRowRef.current]);

    return (
      <div className="relative" ref={timelineContainerRef}>
        {/* Single vertical line, ends at last circle */}
        <div className="absolute left-1/2" style={{ top: 0, width: '2px', height: lineHeight, background: '#e5e7eb', transform: 'translateX(-50%)', zIndex: 0 }}></div>
        <div className="relative">
          {buyerPostOfferSteps.map((buyerStep, index) => {
            const sellerStep = sellerPostOfferSteps[index];
            const isLinked = linkedSteps[buyerStep.title];
            const isMortgageStep = buyerStep.title === 'Mortgage Application';
            const shouldBeClickable = isMortgageStep && viewMode === 'buyer' && buyerStep.status === 'pending';
            const isLast = index === buyerPostOfferSteps.length - 1;
            return (
              <div
                key={index}
                className="flex items-start justify-center mb-12 relative min-h-[80px]"
                ref={isLast ? lastRowRef : undefined}
              >
                {/* Buyer side */}
                <div className="w-1/2 pr-8 text-right relative flex items-center">
                  {/* Card */}
                  <div className="flex-1">
                    {viewMode === 'buyer' && buyerStep.status !== 'completed' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTask(buyerStep.title);
                          setIsDialogOpen(true);
                        }}
                        className={`inline-block max-w-xl text-right group bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 transition hover:shadow cursor-pointer mr-4 relative z-20
                          ${buyerStep.status === 'pending' ? 'hover:border-blue-400' : 'hover:border-yellow-400'}`}
                      >
                        <div className="flex items-center justify-end gap-3 mb-1">
                          <h3 className={`font-medium text-gray-900 ${buyerStep.status === 'pending' ? 'group-hover:text-blue-700' : 'group-hover:text-yellow-700'}`}>
                            {buyerStep.title}
                          </h3>
                          <div className={`p-2 rounded-lg ${
                            buyerStep.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : buyerStep.status === 'current'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-600'
                          } ${buyerStep.status === 'pending' ? 'group-hover:bg-blue-100 group-hover:text-blue-600' : 'group-hover:bg-yellow-100 group-hover:text-yellow-600'}`}>
                            {buyerStep.icon}
                          </div>
                        </div>
                        <p className={`text-sm text-gray-600 ${buyerStep.status === 'pending' ? 'group-hover:text-blue-700' : 'group-hover:text-yellow-700'}`}>{buyerStep.description}</p>
                      </button>
                    ) : (
                      <div className="inline-block max-w-xl bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 mr-4 relative z-20">
                        <div className="flex items-center justify-end gap-3 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {buyerStep.title}
                          </h3>
                          <div className={`p-2 rounded-lg ${
                            buyerStep.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : buyerStep.status === 'current'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {buyerStep.icon}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{buyerStep.description}</p>
                      </div>
                    )}
                  </div>
                  {/* Horizontal line to center */}
                  <div className="absolute top-1/2 right-0 hidden md:block z-10" style={{width: 'calc(50% - 32px)'}}>
                    <div className="h-0.5 bg-gray-200 w-full"></div>
                  </div>
                </div>

                {/* Central circle on the timeline */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    buyerStep.status === 'completed' || (sellerStep?.status === 'completed')
                      ? 'bg-emerald-500 border-emerald-500' 
                      : buyerStep.status === 'current' || (sellerStep?.status === 'current')
                      ? 'bg-yellow-500 border-yellow-500'
                      : 'bg-white border-gray-300'
                  }`}></div>
                </div>

                {/* Seller side - only render if it's a linked step or placeholder */}
                {(isLinked || sellerStep?.isPlaceholder) && (
                  <div className="w-1/2 pl-8 relative flex items-center">
                    {/* Horizontal line from center to card */}
                    {!sellerStep?.isPlaceholder && (
                      <div className="absolute top-1/2 left-0 hidden md:block z-10" style={{width: 'calc(50% - 32px)'}}>
                        <div className="h-0.5 bg-gray-200 w-full"></div>
                      </div>
                    )}
                    {!sellerStep?.isPlaceholder && (
                      viewMode === 'seller' && sellerStep.status !== 'completed' ? (
                        <button
                          type="button"
                          onClick={() => setIsDialogOpen(true)}
                          className={`inline-block max-w-xl text-left group bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 transition hover:shadow cursor-pointer ml-4 relative z-20
                            ${sellerStep.status === 'pending' ? 'hover:border-blue-400' : 'hover:border-yellow-400'}`}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <div className={`p-2 rounded-lg ${
                              sellerStep.status === 'completed' 
                                ? 'bg-emerald-100 text-emerald-600' 
                                : sellerStep.status === 'current'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-600'
                            } ${sellerStep.status === 'pending' ? 'group-hover:bg-blue-100 group-hover:text-blue-600' : 'group-hover:bg-yellow-100 group-hover:text-yellow-600'}`}>
                              {sellerStep.icon}
                            </div>
                            <h3 className={`font-medium text-gray-900 ${sellerStep.status === 'pending' ? 'group-hover:text-blue-700' : 'group-hover:text-yellow-700'}`}>
                              {sellerStep.title}
                            </h3>
                          </div>
                          <p className={`text-sm text-gray-600 ${sellerStep.status === 'pending' ? 'group-hover:text-blue-700' : 'group-hover:text-yellow-700'}`}>{sellerStep.description}</p>
                        </button>
                      ) : (
                        <div className="inline-block max-w-xl bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 ml-4 relative z-20">
                          <div className="flex items-center gap-3 mb-1">
                            <div className={`p-2 rounded-lg ${
                              sellerStep.status === 'completed' 
                                ? 'bg-emerald-100 text-emerald-600' 
                                : sellerStep.status === 'current'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {sellerStep.icon}
                            </div>
                            <h3 className="font-medium text-gray-900">
                              {sellerStep.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">{sellerStep.description}</p>
                        </div>
                      )
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

      {/* Pre-Offer Section - Only show if offer is not accepted */}
      {offerStatus !== 'accepted' && (
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <User className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Pre-Offer
            </h2>
          </div>

          <div className="relative min-h-[400px]">
            <TimelineSteps steps={viewMode === 'buyer' ? buyerPreOfferSteps : sellerPreOfferSteps} />
          </div>
        </div>
      )}

      {/* Post-Offer Section - Only show if offer is accepted */}
      {offerStatus === 'accepted' && (
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Home className="h-6 w-6 text-yellow-600" />
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
              <PostOfferTimeline setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Mortgage Decision Dialog */}
            {selectedTask === 'Mortgage Application' && (
              <div>
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isDialogOpen ? '' : 'hidden'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                      }}
                      aria-label="Close dialog"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    {mortgageDecision === 'mortgage' ? (
                      <>
                        <h2 className="text-xl font-semibold mb-4">Mortgage Provider Details</h2>
                        <p className="mb-6">Please provide the details of your mortgage provider.</p>
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            toast.success('Mortgage provider details saved!');
                          }}
                          className="flex flex-col gap-3"
                        >
                          <input
                            type="text"
                            className="border rounded px-3 py-2"
                            placeholder="e.g. Barclays, HSBC, etc."
                            value={mortgageProvider}
                            onChange={e => setMortgageProvider(e.target.value)}
                            required
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                          >
                            Submit
                          </button>
                        </form>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-semibold mb-4">Mortgage Decision</h2>
                        <p className="mb-6">Will you be using a mortgage for this purchase?</p>
                        <div className="flex flex-col gap-3">
                          <button
                            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                            onClick={() => {
                              setMortgageDecision('mortgage');
                              setIsDialogOpen(false);
                              setSelectedTask(null);
                            }}
                          >
                            I will be using a mortgage
                          </button>
                          <button
                            className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition"
                            onClick={() => {
                              setMortgageDecision('cash');
                              setIsDialogOpen(false);
                              setSelectedTask(null);
                            }}
                          >
                            I am a cash buyer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Property Survey Dialog */}
            {selectedTask === 'Property Survey' && (
              <div>
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isDialogOpen ? '' : 'hidden'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                      }}
                      aria-label="Close dialog"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold mb-4">Property Survey</h2>
                    <p className="mb-6">Do you want to arrange a property survey?</p>
                    <div className="flex flex-col gap-3">
                      <button
                        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                        onClick={() => {
                          setPropertySurveyDecision('yes');
                          setIsDialogOpen(false);
                          setSelectedTask(null);
                        }}
                      >
                        Yes, I want a survey
                      </button>
                      <button
                        className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition"
                        onClick={() => {
                          setPropertySurveyDecision('no');
                          setIsDialogOpen(false);
                          setSelectedTask(null);
                        }}
                      >
                        No, I do not want a survey
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conveyancing Dialog */}
            {selectedTask === 'Conveyancing' && viewMode === 'seller' && (
              <div>
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isDialogOpen ? '' : 'hidden'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                      }}
                      aria-label="Close dialog"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold mb-4">Conveyancing</h2>
                    <p className="mb-6">Please provide the details of your solicitor.</p>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                        toast.success('Solicitor details saved!');
                      }}
                      className="flex flex-col gap-3"
                    >
                      <input
                        type="text"
                        className="border rounded px-3 py-2"
                        placeholder="Solicitor name"
                        value={sellerSolicitorName}
                        onChange={e => setSellerSolicitorName(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="border rounded px-3 py-2"
                        placeholder="Contact details (email or phone)"
                        value={sellerSolicitorContact}
                        onChange={e => setSellerSolicitorContact(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                      >
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
            {selectedTask === 'Conveyancing' && viewMode === 'buyer' && (
              <div>
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isDialogOpen ? '' : 'hidden'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                      }}
                      aria-label="Close dialog"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold mb-4">Conveyancing</h2>
                    <p className="mb-6">Please provide the details of your solicitor.</p>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                        toast.success('Solicitor details saved!');
                      }}
                      className="flex flex-col gap-3"
                    >
                      <input
                        type="text"
                        className="border rounded px-3 py-2"
                        placeholder="Solicitor name"
                        value={solicitorName}
                        onChange={e => setSolicitorName(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="border rounded px-3 py-2"
                        placeholder="Contact details (email or phone)"
                        value={solicitorContact}
                        onChange={e => setSolicitorContact(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                      >
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineSection; 