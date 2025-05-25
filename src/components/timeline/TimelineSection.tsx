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
  X,
  Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TimelineService from '../../services/TimelineService';

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
  transactionId: string;
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ viewMode, offerStatus = 'none', transactionId }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  console.log('TimelineSection props:', { 
    viewMode, 
    offerStatus, 
    transactionId, 
    userId: user?.uid,
    hasTransactionId: !!transactionId,
    transactionIdLength: transactionId?.length
  });

  // Add validation for transactionId
  useEffect(() => {
    if (offerStatus === 'accepted' && !transactionId) {
      console.error('No transaction ID provided for accepted offer');
      toast.error('Unable to load timeline. Please refresh the page or contact support.');
    }
  }, [offerStatus, transactionId]);

  // Add validation before making API calls
  const validateApiCall = () => {
    if (!user?.uid) {
      throw new Error('User is not authenticated');
    }
    if (!transactionId) {
      throw new Error('No transaction ID available');
    }
    return true;
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [mortgageDecision, setMortgageDecision] = useState<'mortgage' | 'cash' | null>(null);
  const [mortgageProvider, setMortgageProvider] = useState<string>('');
  const [propertySurveyDecision, setPropertySurveyDecision] = useState<'yes' | 'no' | null>(null);
  const [surveyorName, setSurveyorName] = useState<string>('');
  const [surveyorEmail, setSurveyorEmail] = useState<string>('');
  const [surveyorPhone, setSurveyorPhone] = useState<string>('');
  const [solicitorName, setSolicitorName] = useState<string>('');
  const [solicitorContact, setSolicitorContact] = useState<string>('');
  const [sellerSolicitorName, setSellerSolicitorName] = useState<string>('');
  const [sellerSolicitorContact, setSellerSolicitorContact] = useState<string>('');
  const [surveyScheduleDate, setSurveyScheduleDate] = useState<string>('');
  const [surveyScheduleTime, setSurveyScheduleTime] = useState<string>('');
  const [surveyVisitCompleted, setSurveyVisitCompleted] = useState<boolean>(false);
  const [surveyApproval, setSurveyApproval] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [conveyancingDialogRole, setConveyancingDialogRole] = useState<'buyer' | 'seller' | null>(null);
  const [buyerFinalChecksConfirmed, setBuyerFinalChecksConfirmed] = useState(false);
  const [sellerFinalChecksConfirmed, setSellerFinalChecksConfirmed] = useState(false);
  const [finalChecksDialogRole, setFinalChecksDialogRole] = useState<'buyer' | 'seller' | null>(null);
  const [buyerExchangeContractsConfirmed, setBuyerExchangeContractsConfirmed] = useState(false);
  const [sellerExchangeContractsConfirmed, setSellerExchangeContractsConfirmed] = useState(false);
  const [exchangeContractsDialogRole, setExchangeContractsDialogRole] = useState<'buyer' | 'seller' | null>(null);
  const [buyerCompletionConfirmed, setBuyerCompletionConfirmed] = useState(false);
  const [sellerCompletionConfirmed, setSellerCompletionConfirmed] = useState(false);
  const [completionDialogRole, setCompletionDialogRole] = useState<'buyer' | 'seller' | null>(null);
  const [onsiteVisitRequired, setOnsiteVisitRequired] = useState<null | 'yes' | 'no'>(null);
  const [mortgageProviderSubmitted, setMortgageProviderSubmitted] = useState(false);
  const [mortgageOfferFile, setMortgageOfferFile] = useState<File | null>(null);
  const [mortgageValuationVisitCompleted, setMortgageValuationVisitCompleted] = useState<boolean>(false);
  const [mortgageValuationScheduleDate, setMortgageValuationScheduleDate] = useState<string>('');
  const [mortgageValuationScheduleTime, setMortgageValuationScheduleTime] = useState<string>('');
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Explicit contextual descriptions for correct messaging
  const buyerCompletionDescription =
    buyerCompletionConfirmed && sellerCompletionConfirmed
      ? 'Completion confirmed.'
      : buyerCompletionConfirmed
        ? 'Completion confirmed.'
        : sellerCompletionConfirmed
          ? 'Waiting for you to confirm.'
          : 'Transfer payment and receive keys';

  const sellerCompletionDescription =
    buyerCompletionConfirmed && sellerCompletionConfirmed
      ? 'Completion confirmed.'
      : sellerCompletionConfirmed
        ? 'Completion confirmed.'
        : buyerCompletionConfirmed
          ? 'Waiting for seller to confirm.'
          : 'Transfer ownership and receive payment';

  const buyerFinalChecksDescription =
    buyerFinalChecksConfirmed && sellerFinalChecksConfirmed
      ? 'Final checks complete.'
      : buyerFinalChecksConfirmed
        ? 'Final checks complete.'
        : sellerFinalChecksConfirmed
          ? 'Waiting for you to confirm.'
          : 'Review all documentation and agreements';

  const sellerFinalChecksDescription =
    buyerFinalChecksConfirmed && sellerFinalChecksConfirmed
      ? 'Final checks complete.'
      : sellerFinalChecksConfirmed
        ? 'Final checks complete.'
        : buyerFinalChecksConfirmed
          ? 'Waiting for seller to confirm.'
          : 'Review all documentation and agreements';

  const buyerExchangeContractsDescription =
    buyerExchangeContractsConfirmed && sellerExchangeContractsConfirmed
      ? 'Contracts exchanged.'
      : buyerExchangeContractsConfirmed
        ? 'Contracts exchanged.'
        : sellerExchangeContractsConfirmed
          ? 'Waiting for you to confirm.'
          : 'Sign and exchange contracts with buyer';

  const sellerExchangeContractsDescription =
    buyerExchangeContractsConfirmed && sellerExchangeContractsConfirmed
      ? 'Contracts exchanged.'
      : sellerExchangeContractsConfirmed
        ? 'Contracts exchanged.'
        : buyerExchangeContractsConfirmed
          ? 'Waiting for seller to confirm.'
          : 'Sign and exchange contracts with seller';

  // Add effect to log state changes
  useEffect(() => {
    console.log('TimelineSection state:', {
      isDialogOpen,
      selectedTask,
      mortgageDecision,
      transactionId,
      userId: user?.uid
    });
  }, [isDialogOpen, selectedTask, mortgageDecision, transactionId, user?.uid]);

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

  const showScheduleSurveyor = surveyorName && surveyorEmail && surveyorPhone;

  const buyerPostOfferSteps: TimelineStep[] = [
    {
      title:
        mortgageDecision === 'mortgage' && mortgageProviderSubmitted
          ? 'Mortgage Application Started'
          : 'Mortgage Application',
      description:
        viewMode === 'buyer'
          ? (mortgageDecision === 'cash'
              ? 'Cash buyer - no mortgage required'
              : mortgageDecision === 'mortgage'
                ? (mortgageProviderSubmitted && mortgageProvider
                    ? `Mortgage provider: ${mortgageProvider}`
                    : 'Please supply the details of the bank you are applying to')
                : 'Complete and submit your full mortgage application')
          : (mortgageDecision === 'cash'
              ? 'The buyer is a cash buyer - no mortgage required'
              : mortgageDecision === 'mortgage'
                ? (mortgageProviderSubmitted && mortgageProvider
                    ? `The buyer's mortgage provider: ${mortgageProvider}`
                    : 'Waiting for buyer to supply their mortgage provider details')
                : 'Waiting for buyer to start their mortgage application'),
      icon: <PiggyBank className="w-5 h-5" />,
      status:
        mortgageDecision === 'cash'
          ? 'completed' as const
          : mortgageDecision === 'mortgage'
            ? (mortgageProviderSubmitted ? 'completed' as const : 'current' as const)
            : 'pending' as const,
    },
    ...((mortgageDecision === 'mortgage' && mortgageProviderSubmitted) ? [{
      title: 'Mortgage Valuation Survey',
      description:
        viewMode === 'buyer'
          ? (onsiteVisitRequired === 'yes'
              ? 'You indicated your provider will require an onsite visit.'
              : onsiteVisitRequired === 'no'
                ? 'You indicated your provider will not require an onsite visit.'
                : 'Will your mortgage provider require an onsite visit to approve the mortgage?')
          : (onsiteVisitRequired === 'yes'
              ? 'The buyer indicated their provider will require an onsite visit.'
              : onsiteVisitRequired === 'no'
                ? 'The buyer indicated their provider will not require an onsite visit.'
                : 'Waiting for buyer to indicate if their mortgage provider requires an onsite visit.'),
      icon: <Calendar className="w-5 h-5" />,
      status: onsiteVisitRequired ? 'completed' as const : 'current' as const,
    }] : []),
    ...(onsiteVisitRequired === 'yes' ? [{
      title: '',
      description: '',
      icon: <div />, 
      status: 'pending' as const,
      isPlaceholder: true
    }] : []),
    ...((onsiteVisitRequired === 'no' || mortgageValuationVisitCompleted) ? [{
      title: 'Mortgage Offer',
      description: mortgageOfferFile
        ? `Mortgage offer uploaded: ${mortgageOfferFile.name}`
        : 'Upload your mortgage offer letter confirming your mortgage is approved.',
      icon: <FileText className="w-5 h-5" />,
      status: mortgageOfferFile ? 'completed' as const : 'current' as const,
    }] : []),
    {
      title: 'Property Survey',
      description:
        viewMode === 'buyer'
          ? (propertySurveyDecision === 'no'
              ? 'You indicated a survey is not required.'
              : propertySurveyDecision === 'yes'
                ? (surveyorName
                    ? `You provided surveyor details: ${surveyorName}${surveyorEmail ? ' (' + surveyorEmail + ')' : ''}${surveyorPhone ? ' - ' + surveyorPhone : ''}`
                    : 'Please provide details of surveyor')
                : 'Do you want to arrange a property survey?')
          : (propertySurveyDecision === 'no'
              ? 'The buyer indicated a survey is not required.'
              : propertySurveyDecision === 'yes'
                ? (surveyorName
                    ? `The buyer provided surveyor details: ${surveyorName}${surveyorEmail ? ' (' + surveyorEmail + ')' : ''}${surveyorPhone ? ' - ' + surveyorPhone : ''}`
                    : 'Waiting for buyer to provide surveyor details.')
                : 'Waiting for buyer to decide if they want a survey.'),
      icon: <Building2 className="w-5 h-5" />,
      status:
        propertySurveyDecision === 'no'
          ? 'completed' as const
          : propertySurveyDecision === 'yes'
            ? (surveyorName && surveyorEmail && surveyorPhone
                ? 'completed' as const
                : 'current' as const)
            : 'pending' as const,
    },
    ...(showScheduleSurveyor
      ? [{
          title: '',
          description: '',
          icon: <div />,
          status: 'pending' as const,
          isPlaceholder: true
        }]
      : []),
    ...(surveyVisitCompleted
      ? [{
          title: 'Approve Survey Results',
          description: surveyApproval === 'approved'
            ? 'You have approved the survey results.'
            : surveyApproval === 'rejected'
              ? 'You have rejected the survey results.'
              : 'Please review and approve the survey results.',
          icon: <ClipboardCheck className="w-5 h-5" />,
          status: surveyApproval === 'approved' ? 'completed' as const : 'current' as const,
        }]
      : []),
    {
      title: 'Conveyancing',
      description:
        viewMode === 'buyer'
          ? (solicitorName
              ? `Solicitor: ${solicitorName}${solicitorContact ? ' (' + solicitorContact + ')' : ''}`
              : 'Add the details of your solicitor')
          : (solicitorName
              ? `Solicitor: ${solicitorName}${solicitorContact ? ' (' + solicitorContact + ')' : ''}`
              : 'Waiting for buyer to add their solicitor details'),
      icon: <Scale className="w-5 h-5" />,
      status:
        solicitorName && sellerSolicitorName
          ? 'completed' as const
          : solicitorName
            ? 'current' as const
            : 'pending' as const,
    },
    {
      title: 'Final Checks',
      description: buyerFinalChecksDescription,
      icon: <ClipboardCheck className="w-5 h-5" />,
      status:
        buyerFinalChecksConfirmed && sellerFinalChecksConfirmed
          ? 'completed' as const
          : buyerFinalChecksConfirmed || sellerFinalChecksConfirmed
            ? 'current' as const
            : 'pending' as const,
    },
    {
      title: 'Exchange Contracts',
      description: buyerExchangeContractsDescription,
      icon: <FileCheck className="w-5 h-5" />,
      status:
        buyerExchangeContractsConfirmed && sellerExchangeContractsConfirmed
          ? 'completed' as const
          : buyerExchangeContractsConfirmed || sellerExchangeContractsConfirmed
            ? 'current' as const
            : 'pending' as const,
    },
    {
      title: 'Completion',
      description: buyerCompletionDescription,
      icon: <Key className="w-5 h-5" />,
      status:
        buyerCompletionConfirmed && sellerCompletionConfirmed
          ? 'completed' as const
          : buyerCompletionConfirmed || sellerCompletionConfirmed
            ? 'current' as const
            : 'pending' as const,
    }
  ].filter(Boolean);

  const sellerPostOfferSteps: TimelineStep[] = [
    // Always: placeholder for mortgage application
    {
      title: '',
      description: '',
      icon: <div />,
      status: 'pending' as const,
      isPlaceholder: true
    },
    // Only add this if mortgageDecision === 'mortgage' && mortgageProviderSubmitted
    ...((mortgageDecision === 'mortgage' && mortgageProviderSubmitted)
      ? [{
          title: '',
          description: '',
          icon: <div />, 
          status: 'pending' as const,
          isPlaceholder: true
        }]
      : []),
    ...(onsiteVisitRequired === 'yes'
      ? [{
          title: 'Schedule Mortgage Valuation Visit',
          description: mortgageValuationScheduleDate && mortgageValuationScheduleTime
            ? (() => {
                const dateObj = new Date(`${mortgageValuationScheduleDate}T${mortgageValuationScheduleTime}`);
                const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                return `Visit scheduled for ${dateStr} at ${timeStr}`;
              })()
            : 'Arrange a time for the mortgage provider to visit the property',
          icon: <Calendar className="w-5 h-5" />,
          status: mortgageValuationVisitCompleted
            ? 'completed' as const
            : mortgageValuationScheduleDate && mortgageValuationScheduleTime
              ? 'current' as const
              : 'pending' as const
        }]
      : []),
    ...(mortgageValuationVisitCompleted ? [{
      title: '',
      description: '',
      icon: <div />, 
      status: 'pending' as const,
      isPlaceholder: true
    }] : []),
    ...(onsiteVisitRequired === 'no'
      ? [{
          title: '',
          description: '',
          icon: <div />,
          status: 'pending' as const,
          isPlaceholder: true
        }]
      : []),
    {
      title: '',
      description: '',
      icon: <div />,
      status: 'pending' as const,
      isPlaceholder: true
    },
    ...(showScheduleSurveyor
      ? [{
          title: 'Schedule Survey',
          description: surveyVisitCompleted
            ? 'Survey visit completed.'
            : surveyScheduleDate && surveyScheduleTime
              ? (() => {
                  const dateObj = new Date(`${surveyScheduleDate}T${surveyScheduleTime}`);
                  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                  const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                  return `Survey scheduled for ${dateStr} at ${timeStr}`;
                })()
              : 'Arrange a time for the surveyor to visit the property',
          icon: <Calendar className="w-5 h-5" />, 
          status: surveyVisitCompleted
            ? 'completed' as const
            : surveyScheduleDate && surveyScheduleTime
              ? 'current' as const
              : 'pending' as const
        }]
      : []),
    ...(surveyVisitCompleted
      ? [{
          title: '',
          description: '',
          icon: <div />,
          status: 'pending' as const,
          isPlaceholder: true
        }]
      : []),
    {
      title: 'Conveyancing',
      description:
        sellerSolicitorName
          ? `Solicitor: ${sellerSolicitorName}${sellerSolicitorContact ? ' (' + sellerSolicitorContact + ')' : ''}`
          : 'Add the details of your solicitor',
      icon: <Scale className="w-5 h-5" />,
      status:
        solicitorName && sellerSolicitorName
          ? 'completed' as const
          : sellerSolicitorName
            ? 'current' as const
            : 'pending' as const,
    },
    {
      title: 'Final Checks',
      description: sellerFinalChecksDescription,
      icon: <ClipboardCheck className="w-5 h-5" />,
      status:
        buyerFinalChecksConfirmed && sellerFinalChecksConfirmed
          ? 'completed' as const
          : buyerFinalChecksConfirmed || sellerFinalChecksConfirmed
            ? 'current' as const
            : 'pending' as const,
    },
    {
      title: 'Exchange Contracts',
      description: sellerExchangeContractsDescription,
      icon: <FileCheck className="w-5 h-5" />,
      status:
        buyerExchangeContractsConfirmed && sellerExchangeContractsConfirmed
          ? 'completed' as const
          : buyerExchangeContractsConfirmed || sellerExchangeContractsConfirmed
            ? 'current' as const
            : 'pending' as const,
    },
    {
      title: 'Completion',
      description: sellerCompletionDescription,
      icon: <Key className="w-5 h-5" />,
      status:
        buyerCompletionConfirmed && sellerCompletionConfirmed
          ? 'completed' as const
          : buyerCompletionConfirmed || sellerCompletionConfirmed
            ? 'current' as const
            : 'pending' as const,
    }
  ];

  // Debug: log the arrays to console (must be after both arrays are declared)
  useEffect(() => {
    console.log('buyerPostOfferSteps:', buyerPostOfferSteps.map(s => ({ title: s.title, isPlaceholder: s.isPlaceholder })));
    console.log('sellerPostOfferSteps:', sellerPostOfferSteps.map(s => ({ title: s.title, isPlaceholder: s.isPlaceholder })));
  }, [buyerPostOfferSteps, sellerPostOfferSteps]);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!user?.uid || !transactionId || offerStatus !== 'accepted') return;
      setTimelineLoading(true);
      setTimelineError(null);
      try {
        validateApiCall();
        const data = await TimelineService.getTimelineProgress(user.uid, transactionId);
        // Hydrate state from backend data (example keys, adjust as needed)
        setMortgageDecision(data.mortgage_decision || null);
        setMortgageProvider(data.mortgage_provider || '');
        setMortgageProviderSubmitted(!!data.mortgage_provider);
        setOnsiteVisitRequired(data.onsite_visit_required || null);
        setMortgageValuationScheduleDate(data.mortgage_valuation_schedule_date || '');
        setMortgageValuationScheduleTime(data.mortgage_valuation_schedule_time || '');
        setMortgageValuationVisitCompleted(!!data.mortgage_valuation_visit_completed);
        setMortgageOfferFile(null); // File uploads need special handling
        setPropertySurveyDecision(data.property_survey_decision || null);
        setSurveyorName(data.surveyor_name || '');
        setSurveyorEmail(data.surveyor_email || '');
        setSurveyorPhone(data.surveyor_phone || '');
        setSurveyScheduleDate(data.survey_schedule_date || '');
        setSurveyScheduleTime(data.survey_schedule_time || '');
        setSurveyVisitCompleted(!!data.survey_visit_completed);
        setSurveyApproval(data.survey_approval || null);
        setSolicitorName(data.buyer_solicitor_name || '');
        setSolicitorContact(data.buyer_solicitor_contact || '');
        setSellerSolicitorName(data.seller_solicitor_name || '');
        setSellerSolicitorContact(data.seller_solicitor_contact || '');
        setBuyerFinalChecksConfirmed(!!data.buyer_final_checks_confirmed);
        setSellerFinalChecksConfirmed(!!data.seller_final_checks_confirmed);
        setBuyerExchangeContractsConfirmed(!!data.buyer_exchange_contracts_confirmed);
        setSellerExchangeContractsConfirmed(!!data.seller_exchange_contracts_confirmed);
        setBuyerCompletionConfirmed(!!data.buyer_completion_confirmed);
        setSellerCompletionConfirmed(!!data.seller_completion_confirmed);
      } catch (err: any) {
        console.error('Failed to load timeline:', err);
        setTimelineError(err.message || 'Failed to load timeline progress.');
        toast.error(err.message || 'Failed to load timeline progress.');
      } finally {
        setTimelineLoading(false);
      }
    };
    fetchTimeline();
  }, [user?.uid, transactionId, offerStatus]);

  // Add effect to log timeline steps when onsiteVisitRequired changes
  useEffect(() => {
    console.log('Timeline steps after onsiteVisitRequired change:', {
      onsiteVisitRequired,
      buyerSteps: buyerPostOfferSteps.map(s => ({ title: s.title, isPlaceholder: s.isPlaceholder })),
      sellerSteps: sellerPostOfferSteps.map(s => ({ title: s.title, isPlaceholder: s.isPlaceholder }))
    });
  }, [onsiteVisitRequired, buyerPostOfferSteps, sellerPostOfferSteps]);

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
                      (step.status as 'pending' | 'current' | 'completed') === 'completed' 
                        ? 'text-emerald-900' 
                        : (step.status as 'pending' | 'current' | 'completed') === 'current'
                        ? 'text-yellow-900'
                        : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <div className={`p-2 rounded-lg ${
                      (step.status as 'pending' | 'current' | 'completed') === 'completed' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : (step.status as 'pending' | 'current' | 'completed') === 'current'
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
              (step.status as 'pending' | 'current' | 'completed') === 'completed' 
                ? 'bg-emerald-500 border-emerald-500' 
                : (step.status as 'pending' | 'current' | 'completed') === 'current'
                ? 'bg-yellow-500 border-yellow-500'
                : 'bg-white border-gray-300'
            }`}></div>

            {/* Right side content - odd indexes */}
            <div className="w-1/2 pl-8">
              {index % 2 === 1 && (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`p-2 rounded-lg ${
                      (step.status as 'pending' | 'current' | 'completed') === 'completed' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : (step.status as 'pending' | 'current' | 'completed') === 'current'
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

            const isFinalChecks = buyerStep.title === 'Final Checks';
            const isExchangeContracts = buyerStep.title === 'Exchange Contracts';
            const isCompletion = buyerStep.title === 'Completion';

            let canClick = true;
            if (isFinalChecks || isExchangeContracts || isCompletion) {
              canClick = buyerPostOfferSteps.slice(0, index).every(step => step.isPlaceholder || step.status === 'completed');
            }

            // For Exchange Contracts, track which side opened the dialog
            const handleBuyerClick = () => {
              try {
                validateApiCall();
                if (viewMode !== 'buyer') {
                  toast.error('Only the buyer can perform this action');
                  return;
                }
                console.log('Buyer task clicked:', buyerStep.title);
                console.log('Before state update - isDialogOpen:', isDialogOpen);
                setSelectedTask(buyerStep.title);
                if (buyerStep.title === 'Conveyancing') {
                  setConveyancingDialogRole('buyer');
                }
                if (buyerStep.title === 'Final Checks') {
                  setFinalChecksDialogRole('buyer');
                }
                if (buyerStep.title === 'Exchange Contracts') {
                  setExchangeContractsDialogRole('buyer');
                }
                if (buyerStep.title === 'Completion') {
                  setCompletionDialogRole('buyer');
                }
                setIsDialogOpen(true);
                console.log('After state update - selectedTask:', buyerStep.title);
                console.log('After state update - isDialogOpen:', true);
              } catch (err: any) {
                console.error('Failed to handle buyer click:', err);
                toast.error(err.message || 'Unable to proceed. Please try again.');
              }
            };
            const handleSellerClick = () => {
              try {
                validateApiCall();
                if (viewMode !== 'seller') {
                  toast.error('Only the seller can perform this action');
                  return;
                }
                console.log('Seller task clicked:', sellerStep.title);
                setSelectedTask(sellerStep.title);
                if (sellerStep.title === 'Conveyancing') {
                  setConveyancingDialogRole('seller');
                }
                if (sellerStep.title === 'Final Checks') {
                  setFinalChecksDialogRole('seller');
                }
                if (sellerStep.title === 'Exchange Contracts') {
                  setExchangeContractsDialogRole('seller');
                }
                if (sellerStep.title === 'Completion') {
                  setCompletionDialogRole('seller');
                }
                setIsDialogOpen(true);
              } catch (err: any) {
                console.error('Failed to handle seller click:', err);
                toast.error(err.message || 'Unable to proceed. Please try again.');
              }
            };
            
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
                    {!buyerStep.isPlaceholder && (
                      viewMode === 'buyer' && buyerStep.status !== 'completed' ? (
                        canClick ? (
                          <button
                            type="button"
                            onClick={handleBuyerClick}
                            className={`inline-block max-w-xl text-right group bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 transition hover:shadow cursor-pointer mr-4 relative z-20
                              ${buyerStep.status === 'pending' ? 'hover:border-blue-400' : 'hover:border-yellow-400'}`}
                          >
                  <div className="flex items-center justify-end gap-3 mb-1">
                              <h3 className={`font-medium text-gray-900 ${buyerStep.status === 'pending' ? 'group-hover:text-blue-700' : 'group-hover:text-yellow-700'}`}> 
                      {buyerStep.title}
                    </h3>
                    <div className={`p-2 rounded-lg ${
                                (buyerStep.status as 'pending' | 'current' | 'completed') === 'completed' 
                        ? 'bg-emerald-100 text-emerald-600' 
                                  : (buyerStep.status as 'pending' | 'current' | 'completed') === 'current'
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
                              <h3 className="font-medium text-gray-900">{buyerStep.title}</h3>
                              <div className={`p-2 rounded-lg ${
                                (buyerStep.status as 'pending' | 'current' | 'completed') === 'completed' 
                                  ? 'bg-emerald-100 text-emerald-600' 
                                  : (buyerStep.status as 'pending' | 'current' | 'completed') === 'current'
                                  ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {buyerStep.icon}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{buyerStep.description}</p>
                          </div>
                        )
                      ) : (
                        <div className="inline-block max-w-xl bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 mr-4 relative z-20">
                          <div className="flex items-center justify-end gap-3 mb-1">
                            <h3 className="font-medium text-gray-900">{buyerStep.title}</h3>
                            <div className={`p-2 rounded-lg ${
                              (buyerStep.status as 'pending' | 'current' | 'completed') === 'completed' 
                                ? 'bg-emerald-100 text-emerald-600' 
                                : (buyerStep.status as 'pending' | 'current' | 'completed') === 'current'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {buyerStep.icon}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{buyerStep.description}</p>
                        </div>
                      )
                    )}
                  </div>
                  {/* Horizontal line to center */}
                  {!buyerStep.isPlaceholder && (
                    <div className="absolute top-1/2 right-0 hidden md:block z-10" style={{width: 'calc(50% - 32px)'}}>
                      <div className="h-0.5 bg-gray-200 w-full"></div>
                    </div>
                  )}
                </div>

                {/* Central circle on the timeline */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    (buyerStep.status as 'pending' | 'current' | 'completed') === 'completed' || (sellerStep?.status as 'pending' | 'current' | 'completed') === 'completed'
                    ? 'bg-emerald-500 border-emerald-500' 
                      : (buyerStep.status as 'pending' | 'current' | 'completed') === 'current' || (sellerStep?.status as 'pending' | 'current' | 'completed') === 'current'
                        ? 'bg-yellow-500 border-yellow-500'
                    : 'bg-white border-gray-300'
                }`}></div>
                </div>

                {/* Seller side - only render if it's a linked step or placeholder, or if the buyer step is a placeholder or missing */}
                {(isLinked || sellerStep?.isPlaceholder || (!buyerStep || buyerStep.isPlaceholder)) && sellerStep && (
                  <div className="w-1/2 pl-8 relative flex items-center">
                    {!sellerStep.isPlaceholder && (
                      <div className="absolute top-1/2 left-0 hidden md:block z-10" style={{width: 'calc(50% - 32px)'}}>
                        <div className="h-0.5 bg-gray-200 w-full"></div>
                      </div>
                    )}
                    {!sellerStep.isPlaceholder && (
                      viewMode === 'seller' && sellerStep.status !== 'completed' ? (
                        canClick ? (
                          <div
                            className={`inline-block max-w-xl text-left group bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 transition hover:shadow cursor-pointer ml-4 relative z-20
                              ${sellerStep.status === 'pending' ? 'hover:border-blue-400' : 'hover:border-yellow-400'}`}
                            onClick={handleSellerClick}
                          >
                        <div className="flex items-center gap-3 mb-1">
                          <div className={`p-2 rounded-lg ${
                                (sellerStep.status as 'pending' | 'current' | 'completed') === 'completed' 
                              ? 'bg-emerald-100 text-emerald-600' 
                                  : (sellerStep.status as 'pending' | 'current' | 'completed') === 'current'
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
                          </div>
                        ) : (
                          <div className="inline-block max-w-xl bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 ml-4 relative z-20">
                            <div className="flex items-center gap-3 mb-1">
                              <div className={`p-2 rounded-lg ${
                                (sellerStep.status as 'pending' | 'current' | 'completed') === 'completed' 
                                  ? 'bg-emerald-100 text-emerald-600' 
                                  : (sellerStep.status as 'pending' | 'current' | 'completed') === 'current'
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
                      ) : (
                        <div className="inline-block max-w-xl bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 ml-4 relative z-20">
                          <div className="flex items-center gap-3 mb-1">
                            <div className={`p-2 rounded-lg ${
                              (sellerStep.status as 'pending' | 'current' | 'completed') === 'completed' 
                                ? 'bg-emerald-100 text-emerald-600' 
                                : (sellerStep.status as 'pending' | 'current' | 'completed') === 'current'
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

  // Add effect to log state changes
  useEffect(() => {
    console.log('Dialog state changed:', { 
      isDialogOpen, 
      selectedTask, 
      mortgageDecision,
      dialogVisible: isDialogOpen && selectedTask === 'Mortgage Application'
    });
  }, [isDialogOpen, selectedTask, mortgageDecision]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !transactionId) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(surveyorEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await TimelineService.updateTimelineProgress(user.uid, transactionId, {
        property_survey_decision: 'yes',
        surveyor_name: surveyorName,
        surveyor_email: surveyorEmail,
        surveyor_phone: surveyorPhone
      });
      setIsDialogOpen(false);
      setSelectedTask(null);
      toast.success('Surveyor details saved!');
      // Refresh the timeline data
      const data = await TimelineService.getTimelineProgress(user.uid, transactionId);
      setPropertySurveyDecision(data.property_survey_decision || null);
      setSurveyorName(data.surveyor_name || '');
      setSurveyorEmail(data.surveyor_email || '');
      setSurveyorPhone(data.surveyor_phone || '');
    } catch (err) {
      console.error('Failed to save surveyor details:', err);
      toast.error('Failed to save surveyor details. Please try again.');
    }
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
                          onSubmit={async e => {
                            e.preventDefault();
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            setMortgageProviderSubmitted(true);
                            try {
                              await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                mortgage_provider: mortgageProvider,
                                mortgage_decision: 'mortgage'
                              });
                              toast.success('Mortgage provider details saved!');
                            } catch (err) {
                              toast.error('Failed to save mortgage provider details.');
                            }
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
                            onClick={async () => {
                              console.log('Setting mortgage decision to mortgage');
                              try {
                                if (!transactionId) {
                                  throw new Error('No transaction ID available. Please refresh the page and try again.');
                                }
                                console.log('Making API call with:', {
                                  userId: user?.uid,
                                  transactionId,
                                  progress: {
                                    mortgage: {
                                      decision: 'mortgage',
                                      provider: null
                                    }
                                  }
                                });
                                await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                  mortgage_provider: mortgageProvider,
                                  mortgage_decision: 'mortgage'
                                });
                                console.log('API call successful');
                                setMortgageDecision('mortgage');
                                setSelectedTask(null);
                                toast.success('Mortgage decision saved!');
                              } catch (err) {
                                console.error('Failed to save mortgage decision:', err);
                                if (err instanceof Error) {
                                  console.error('Error details:', {
                                    message: err.message,
                                    stack: err.stack
                                  });
                                }
                                toast.error('Failed to save mortgage decision');
                              }
                            }}
                          >
                            I will be using a mortgage
                          </button>
                          <button
                            className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition"
                            onClick={async () => {
                              console.log('Setting mortgage decision to cash');
                              try {
                                await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                  mortgage_decision: 'cash'
                                });
                                setMortgageDecision('cash');
                                setSelectedTask(null);
                                setIsDialogOpen(false);
                                toast.success('Mortgage decision saved!');
                              } catch (err) {
                                console.error('Failed to save mortgage decision:', err);
                                toast.error('Failed to save mortgage decision');
                              }
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
                    {propertySurveyDecision === null && (
                      <>
                        <h2 className="text-xl font-semibold mb-4">Property Survey</h2>
                        <p className="mb-6">Do you want to arrange a property survey?</p>
                        <div className="flex flex-col gap-3">
                          <button
                            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                            onClick={async () => {
                              try {
                                await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                  property_survey_decision: 'yes'
                                });
                                setPropertySurveyDecision('yes');
                                setIsDialogOpen(false);
                                setSelectedTask(null);
                                toast.success('Survey decision saved!');
                              } catch (err) {
                                console.error('Failed to save survey decision:', err);
                                toast.error('Failed to save decision. Please try again.');
                              }
                            }}
                          >
                            Yes, I want a survey
                          </button>
                          <button
                            className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition"
                            onClick={async () => {
                              try {
                                await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                  property_survey_decision: 'no'
                                });
                                setPropertySurveyDecision('no');
                                setIsDialogOpen(false);
                                setSelectedTask(null);
                                toast.success('Survey decision saved!');
                              } catch (err) {
                                console.error('Failed to save survey decision:', err);
                                toast.error('Failed to save decision. Please try again.');
                              }
                            }}
                          >
                            No, I do not want a survey
                          </button>
                        </div>
                      </>
                    )}
                    {propertySurveyDecision === 'yes' && (
                      <>
                        <h2 className="text-xl font-semibold mb-4">Surveyor Details</h2>
                        <p className="mb-6">Please provide the details of your surveyor.</p>
                        <form
                          onSubmit={onSubmit}
                          className="flex flex-col gap-3"
                        >
                          <input
                            type="text"
                            className="border rounded px-3 py-2"
                            placeholder="Surveyor name"
                            value={surveyorName}
                            onChange={e => setSurveyorName(e.target.value)}
                            required
                          />
                          <input
                            type="email"
                            className="border rounded px-3 py-2"
                            placeholder="Surveyor email"
                            value={surveyorEmail}
                            onChange={e => setSurveyorEmail(e.target.value)}
                          />
                          <input
                            type="tel"
                            className="border rounded px-3 py-2"
                            placeholder="Surveyor phone"
                            value={surveyorPhone}
                            onChange={e => setSurveyorPhone(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                          >
                            Submit
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Conveyancing Dialog */}
            {selectedTask === 'Conveyancing' && conveyancingDialogRole === 'buyer' && (
              <div>
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isDialogOpen ? '' : 'hidden'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                        setConveyancingDialogRole(null);
                      }}
                      aria-label="Close dialog"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold mb-4">Conveyancing</h2>
                    <p className="mb-6">Please provide the details of your solicitor.</p>
                    <form
                      onSubmit={async e => {
                        e.preventDefault();
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                        setConveyancingDialogRole(null);
                        try {
                          await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                            buyer_solicitor_name: solicitorName,
                            buyer_solicitor_contact: solicitorContact
                          });
                          toast.success('Solicitor details saved!');
                        } catch (err) {
                          toast.error('Failed to save solicitor details.');
                        }
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
                        required
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
            {selectedTask === 'Conveyancing' && conveyancingDialogRole === 'seller' && (
              <div>
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isDialogOpen ? '' : 'hidden'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                        setConveyancingDialogRole(null);
                      }}
                      aria-label="Close dialog"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold mb-4">Conveyancing</h2>
                    <p className="mb-6">Please provide the details of your solicitor.</p>
                    <form
                      onSubmit={async e => {
                        e.preventDefault();
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                        setConveyancingDialogRole(null);
                        try {
                          await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                            seller_solicitor_name: sellerSolicitorName,
                            seller_solicitor_contact: sellerSolicitorContact
                          });
                          toast.success('Solicitor details saved!');
                        } catch (err) {
                          toast.error('Failed to save solicitor details.');
                        }
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
                        required
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

            {/* Schedule Surveyor Dialog (Seller) */}
            {selectedTask === 'Schedule Survey' && isDialogOpen && (
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
                    <h2 className="text-xl font-semibold mb-4">Schedule Survey</h2>
                    <p className="mb-6">Enter the date and time for the surveyor's visit.</p>
                    <form
                      onSubmit={async e => {
                        e.preventDefault();
                        try {
                          await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                            survey_schedule_date: surveyScheduleDate,
                            survey_schedule_time: surveyScheduleTime
                          });
                          setIsDialogOpen(false);
                          setSelectedTask(null);
                          toast.success('Survey scheduled!');
                        } catch (err) {
                          console.error('Failed to save survey schedule:', err);
                          toast.error('Failed to save schedule. Please try again.');
                        }
                      }}
                      className="flex flex-col gap-3"
                    >
                      <input
                        type="date"
                        className="border rounded px-3 py-2"
                        value={surveyScheduleDate}
                        onChange={e => setSurveyScheduleDate(e.target.value)}
                        required
                        disabled={surveyVisitCompleted}
                      />
                      <input
                        type="time"
                        className="border rounded px-3 py-2"
                        value={surveyScheduleTime}
                        onChange={e => setSurveyScheduleTime(e.target.value)}
                        required
                        disabled={surveyVisitCompleted}
                      />
                      {!surveyVisitCompleted && (
                        <button
                          type="submit"
                          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                        >
                          {surveyScheduleDate && surveyScheduleTime ? 'Reschedule visit' : 'Schedule'}
                        </button>
                      )}
                    </form>
                    {/* Confirm Visit Completed button, only if scheduled date/time has passed and not completed */}
                    {!surveyVisitCompleted && surveyScheduleDate && surveyScheduleTime && new Date() > new Date(`${surveyScheduleDate}T${surveyScheduleTime}`) && (
                      <button
                        className="mt-4 bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition w-full"
                        onClick={async () => {
                          try {
                            await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                              survey_visit_completed: true
                            });
                            setSurveyVisitCompleted(true);
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            toast.success('Survey visit marked as completed!');
                          } catch (err) {
                            console.error('Failed to mark survey visit as completed:', err);
                            toast.error('Failed to update visit status. Please try again.');
                          }
                        }}
                      >
                        Confirm Visit Completed
                      </button>
                    )}
                    {/* Completion message */}
                    {surveyVisitCompleted && (
                      <div className="mt-4 text-emerald-700 font-semibold text-center">Survey visit has been marked as completed.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Mortgage Valuation Visit Dialog */}
            {selectedTask === 'Schedule Mortgage Valuation Visit' && isDialogOpen && (
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
                    <h2 className="text-xl font-semibold mb-4">Schedule Mortgage Valuation Visit</h2>
                    <p className="mb-6">Enter the date and time for the mortgage provider's visit.</p>
                    <form
                      onSubmit={async e => {
                        e.preventDefault();
                        try {
                          await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                            mortgage_valuation_schedule_date: mortgageValuationScheduleDate,
                            mortgage_valuation_schedule_time: mortgageValuationScheduleTime
                          });
                          setIsDialogOpen(false);
                          setSelectedTask(null);
                          toast.success('Mortgage valuation visit scheduled!');
                        } catch (err) {
                          console.error('Failed to save mortgage valuation schedule:', err);
                          toast.error('Failed to save schedule. Please try again.');
                        }
                      }}
                      className="flex flex-col gap-3"
                    >
                      <input
                        type="date"
                        className="border rounded px-3 py-2"
                        value={mortgageValuationScheduleDate}
                        onChange={e => setMortgageValuationScheduleDate(e.target.value)}
                        required
                        disabled={mortgageValuationVisitCompleted}
                      />
                      <input
                        type="time"
                        className="border rounded px-3 py-2"
                        value={mortgageValuationScheduleTime}
                        onChange={e => setMortgageValuationScheduleTime(e.target.value)}
                        required
                        disabled={mortgageValuationVisitCompleted}
                      />
                      {!mortgageValuationVisitCompleted && (
                        <button
                          type="submit"
                          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                        >
                          {mortgageValuationScheduleDate && mortgageValuationScheduleTime ? 'Reschedule visit' : 'Schedule'}
                        </button>
                      )}
                    </form>
                    {/* Confirm Visit Completed button, only if scheduled date/time has passed and not completed */}
                    {!mortgageValuationVisitCompleted && mortgageValuationScheduleDate && mortgageValuationScheduleTime && new Date() > new Date(`${mortgageValuationScheduleDate}T${mortgageValuationScheduleTime}`) && (
                      <button
                        className="mt-4 bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition w-full"
                        onClick={async () => {
                          try {
                            await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                              mortgage_valuation_visit_completed: true
                            });
                            setMortgageValuationVisitCompleted(true);
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            toast.success('Mortgage valuation visit marked as completed!');
                          } catch (err) {
                            console.error('Failed to mark mortgage valuation visit as completed:', err);
                            toast.error('Failed to update visit status. Please try again.');
                          }
                        }}
                      >
                        Confirm Visit Completed
                      </button>
                    )}
                    {/* Completion message */}
                    {mortgageValuationVisitCompleted && (
                      <div className="mt-4 text-emerald-700 font-semibold text-center">Mortgage valuation visit has been marked as completed.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mortgage Offer Dialog */}
            {selectedTask === 'Mortgage Offer' && isDialogOpen && (
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
                    <h2 className="text-xl font-semibold mb-4">Mortgage Offer</h2>
                    <p className="mb-6">Upload your mortgage offer letter confirming your mortgage is approved.</p>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (!mortgageOfferFile) {
                          toast.error('Please select a file to upload');
                          return;
                        }
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                        toast.success('Mortgage offer uploaded!');
                      }}
                      className="flex flex-col gap-3"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setMortgageOfferFile(e.target.files[0]);
                          }
                        }}
                        required={!mortgageOfferFile}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="flex items-center gap-2 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition justify-center"
                        onClick={e => {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className="w-5 h-5" />
                        {mortgageOfferFile ? 'Replace File' : 'Browse File'}
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition"
                        disabled={!mortgageOfferFile}
                      >
                        Upload
                      </button>
                      {mortgageOfferFile && (
                        <div className="mt-2 text-emerald-700 text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Uploaded: {mortgageOfferFile.name}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Approve Survey Results Dialog */}
            {selectedTask === 'Approve Survey Results' && isDialogOpen && (
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
                    <h2 className="text-xl font-semibold mb-4">Approve Survey Results</h2>
                    <p className="mb-6">Please review and approve the survey results.</p>
                    <div className="flex flex-col gap-3">
                      <button
                        className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition"
                        onClick={async () => {
                          try {
                            await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                              survey_approval: 'approved'
                            });
                            setSurveyApproval('approved');
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            toast.success('Survey results approved!');
                          } catch (err) {
                            console.error('Failed to approve survey results:', err);
                            toast.error('Failed to approve survey results. Please try again.');
                          }
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700 transition"
                        onClick={async () => {
                          try {
                            await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                              survey_approval: 'rejected'
                            });
                            setSurveyApproval('rejected');
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            toast.success('Survey results rejected.');
                          } catch (err) {
                            console.error('Failed to reject survey results:', err);
                            toast.error('Failed to reject survey results. Please try again.');
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Final Checks Dialog */}
            {selectedTask === 'Final Checks' && isDialogOpen && (
              <div>
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isDialogOpen ? '' : 'hidden'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                        setFinalChecksDialogRole(null);
                      }}
                      aria-label="Close dialog"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold mb-4">Final Checks</h2>
                    <p className="mb-6">Please confirm that you have completed all final checks.</p>
                    <div className="flex flex-col gap-3">
                      <button
                        className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition"
                        onClick={async () => {
                          try {
                            if (finalChecksDialogRole === 'buyer') {
                              await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                buyer_final_checks_confirmed: true
                              });
                              setBuyerFinalChecksConfirmed(true);
                            } else {
                              await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                seller_final_checks_confirmed: true
                              });
                              setSellerFinalChecksConfirmed(true);
                            }
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            setFinalChecksDialogRole(null);
                            toast.success('Final checks confirmed!');
                          } catch (err) {
                            console.error('Failed to confirm final checks:', err);
                            toast.error('Failed to confirm final checks. Please try again.');
                          }
                        }}
                      >
                        Confirm Final Checks
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Exchange Contracts Dialog */}
            {selectedTask === 'Exchange Contracts' && isDialogOpen && (
              <div>
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isDialogOpen ? '' : 'hidden'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                        setExchangeContractsDialogRole(null);
                      }}
                      aria-label="Close dialog"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold mb-4">Exchange Contracts</h2>
                    <p className="mb-6">Please confirm that you have exchanged contracts.</p>
                    <div className="flex flex-col gap-3">
                      <button
                        className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition"
                        onClick={async () => {
                          try {
                            if (exchangeContractsDialogRole === 'buyer') {
                              await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                buyer_exchange_contracts_confirmed: true
                              });
                              setBuyerExchangeContractsConfirmed(true);
                            } else {
                              await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                seller_exchange_contracts_confirmed: true
                              });
                              setSellerExchangeContractsConfirmed(true);
                            }
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            setExchangeContractsDialogRole(null);
                            toast.success('Contracts exchanged!');
                          } catch (err) {
                            console.error('Failed to confirm contract exchange:', err);
                            toast.error('Failed to confirm contract exchange. Please try again.');
                          }
                        }}
                      >
                        Confirm Contracts Exchanged
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Completion Dialog */}
            {selectedTask === 'Completion' && isDialogOpen && (
              <div>
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isDialogOpen ? '' : 'hidden'}`}>
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setSelectedTask(null);
                        setCompletionDialogRole(null);
                      }}
                      aria-label="Close dialog"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold mb-4">Completion</h2>
                    <p className="mb-6">
                      {completionDialogRole === 'buyer' 
                        ? 'Please confirm that you have received the keys to the property.'
                        : 'Please confirm that you have received the payment for the property.'}
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition"
                        onClick={async () => {
                          try {
                            if (completionDialogRole === 'buyer') {
                              await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                buyer_completion_confirmed: true
                              });
                              setBuyerCompletionConfirmed(true);
                            } else {
                              await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                                seller_completion_confirmed: true
                              });
                              setSellerCompletionConfirmed(true);
                            }
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            setCompletionDialogRole(null);
                            toast.success('Completion confirmed!');
                          } catch (err) {
                            console.error('Failed to confirm completion:', err);
                            toast.error('Failed to confirm completion. Please try again.');
                          }
                        }}
                      >
                        {completionDialogRole === 'buyer' 
                          ? 'Confirm Keys Received'
                          : 'Confirm Payment Received'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mortgage Valuation Survey Dialog */}
            {selectedTask === 'Mortgage Valuation Survey' && isDialogOpen && (
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
                    <h2 className="text-xl font-semibold mb-4">Mortgage Valuation Survey</h2>
                    <p className="mb-6">Will your mortgage provider require an onsite visit to approve the mortgage?</p>
                    <div className="flex flex-col gap-3">
                      <button
                        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                        onClick={async () => {
                          try {
                            await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                              onsite_visit_required: 'yes'
                            });
                            setOnsiteVisitRequired('yes');
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            toast.success('Visit requirement saved!');
                          } catch (err) {
                            console.error('Failed to save visit requirement:', err);
                            toast.error('Failed to save requirement. Please try again.');
                          }
                        }}
                      >
                        Yes, an onsite visit is required
                      </button>
                      <button
                        className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700 transition"
                        onClick={async () => {
                          try {
                            await TimelineService.updateTimelineProgress(user?.uid ?? '', transactionId ?? '', {
                              onsite_visit_required: 'no'
                            });
                            setOnsiteVisitRequired('no');
                            setIsDialogOpen(false);
                            setSelectedTask(null);
                            toast.success('Visit requirement saved!');
                          } catch (err) {
                            console.error('Failed to save visit requirement:', err);
                            toast.error('Failed to save requirement. Please try again.');
                          }
                        }}
                      >
                        No, an onsite visit is not required
                      </button>
                    </div>
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