import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, XCircle, FileText, ArrowRight, 
  AlertCircle, Home, Scale, UserCheck, Key, Check, X 
} from 'lucide-react';
import PropertyService from '../../../services/PropertyService';
import { Negotiation, OfferedProperty } from '../../../types/property';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'action_required';
type ViewMode = 'list' | 'detail';

interface TimelineEvent {
  title: string;
  date: string;
  completed: boolean;
  current?: boolean;
  icon: React.ReactNode;
  info?: string;
}

interface Application {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyPrice: number;
  offerAmount: number;
  status: ApplicationStatus;
  submittedDate: string;
  lastOfferBy: string;
  documents: {
    name: string;
    status: 'completed' | 'pending';
  }[];
  nextSteps?: string;
  rejectionReason?: string;
  milestones: {
    viewingComplete: boolean;
    offerSubmitted: boolean;
    documentsVerified: boolean;
    solicitorAssigned: boolean;
  };
  timeline: TimelineEvent[];
}

const Timeline = ({ events }: { events: TimelineEvent[] }) => (
  <div className="mt-4 border-t pt-4">
    <h3 className="text-sm font-medium mb-4">Property Journey</h3>
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

const ApplicationsSection = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [acceptLoading, setAcceptLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [displayOfferAmount, setDisplayOfferAmount] = useState('');
  const [offerError, setOfferError] = useState<string | null>(null);
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null);

  const handleAcceptOffer = async (negotiationId: string) => {
    if (!user?.uid) return;
    
    setAcceptLoading(negotiationId);
    setError(null);
    
    try {
      const response = await fetch(
        `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${user.uid}/offers/${negotiationId}`,
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept offer');
      }

      // Update the application status in the UI
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === negotiationId
            ? {
                ...app,
                status: 'accepted',
                milestones: {
                  ...app.milestones,
                  solicitorAssigned: true
                }
              }
            : app
        )
      );

      // Update selected application if in detail view
      if (selectedApplication?.id === negotiationId) {
        setSelectedApplication(prev => prev ? {
          ...prev,
          status: 'accepted',
          milestones: {
            ...prev.milestones,
            solicitorAssigned: true
          }
        } : null);
      }
    } catch (err) {
      console.error('Error accepting offer:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept offer');
    } finally {
      setAcceptLoading(null);
    }
  };

  const handleRejectOffer = async (negotiationId: string) => {
    if (!user?.uid) return;
    
    setRejectLoading(negotiationId);
    setError(null);
    
    try {
      const response = await fetch(
        `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${user.uid}/offers/${negotiationId}`,
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject offer');
      }

      // Update the application status in the UI
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === negotiationId
            ? {
                ...app,
                status: 'rejected'
              }
            : app
        )
      );

      // Update selected application if in detail view
      if (selectedApplication?.id === negotiationId) {
        setSelectedApplication(prev => prev ? {
          ...prev,
          status: 'rejected'
        } : null);
      }

      toast.success('Offer rejected successfully!', {
        duration: 3000,
        position: 'bottom-right',
      });
    } catch (err) {
      console.error('Error rejecting offer:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject offer');
    } finally {
      setRejectLoading(null);
    }
  };

  const handleCancelOffer = async (negotiationId: string) => {
    if (!user?.uid) return;
    
    setCancelLoading(negotiationId);
    setError(null);
    
    try {
      const response = await fetch(
        `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${user.uid}/offers/${negotiationId}`,
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel offer');
      }

      // Update the application status in the UI
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === negotiationId
            ? {
                ...app,
                status: 'cancelled'
              }
            : app
        )
      );

      // Update selected application if in detail view
      if (selectedApplication?.id === negotiationId) {
        setSelectedApplication(prev => prev ? {
          ...prev,
          status: 'cancelled'
        } : null);
      }

      toast.success('Offer cancelled successfully!', {
        duration: 3000,
        position: 'bottom-right',
      });
    } catch (err) {
      console.error('Error cancelling offer:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel offer');
    } finally {
      setCancelLoading(null);
    }
  };

  const handleCounterOffer = (application: Application) => {
    setCounterOfferId(application.id);
    const amount = application.offerAmount.toString();
    setOfferAmount(amount);
    setDisplayOfferAmount(amount.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    setIsOfferModalOpen(true);
  };

  const handleSubmitCounterOffer = async () => {
    if (!user?.uid || !counterOfferId) return;
    
    try {
      setOfferError(null);

      const numericAmount = parseFloat(offerAmount.replace(/,/g, ''));
      if (!offerAmount || isNaN(numericAmount)) {
        setOfferError('Please enter a valid offer amount');
        return;
      }

      const application = applications.find(app => app.id === counterOfferId);
      if (!application) {
        setOfferError('Application not found');
        return;
      }

      const response = await fetch(
        `https://maison-api.jollybush-a62cec71.uksouth.azurecontainerapps.io/api/users/${user.uid}/offers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            property_id: application.propertyId,
            offer_amount: Math.round(numericAmount),
            negotiation_id: application.id
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit counter offer');
      }

      // Reset and close modal
      setOfferAmount('');
      setDisplayOfferAmount('');
      setOfferError(null);
      setIsOfferModalOpen(false);
      setCounterOfferId(null);
      
      toast.success('Counter offer submitted successfully!', {
        duration: 3000,
        position: 'bottom-right',
      });

      // Update the application status in the UI
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === counterOfferId
            ? {
                ...app,
                status: 'pending',
                offerAmount: Math.round(numericAmount),
                lastOfferBy: user.uid
              }
            : app
        )
      );

      // Update selected application if in detail view
      if (selectedApplication?.id === counterOfferId) {
        setSelectedApplication(prev => prev ? {
          ...prev,
    status: 'pending',
          offerAmount: Math.round(numericAmount),
          lastOfferBy: user.uid
        } : null);
      }
    } catch (err) {
      console.error('Error submitting counter offer:', err);
      setOfferError(err instanceof Error ? err.message : 'Failed to submit counter offer');
    }
  };

  // Fetch negotiations from dashboard
  useEffect(() => {
    const fetchNegotiations = async () => {
      try {
        setLoading(true);
        const dashboardData = await PropertyService.getUserDashboard();
        
        // Create a map of property details from offered properties
        const propertyDetailsMap = new Map(
          (dashboardData.offered_properties || []).map((property: OfferedProperty) => [
            property.property_id,
            {
              address: `${property.address.house_number} ${property.address.street}, ${property.address.city} ${property.address.postcode}`,
              price: property.price,
              latest_offer: property.latest_offer
            } as const
          ])
        );

        // Convert negotiations to applications format
        const newApplications: Application[] = dashboardData.negotiations_as_buyer.map(negotiation => {
          const defaultPropertyDetails = {
            address: 'Address not available',
            price: 0,
            latest_offer: { amount: 0, status: 'active', last_updated: new Date().toISOString() }
          } as const;
          
          const propertyDetails = propertyDetailsMap.get(negotiation.property_id) || defaultPropertyDetails;
          
          // Get the matching offered property
          const offeredProperty = (dashboardData.offered_properties || []).find(
            (prop: OfferedProperty) => prop.property_id === negotiation.property_id
          );
          
          // Map 'active' status to 'pending' or 'action_required'
          const mappedStatus = negotiation.status === 'active' 
            ? (negotiation.last_offer_by !== user?.uid ? 'action_required' : 'pending')
            : negotiation.status as ApplicationStatus;

          // Map transaction history to timeline events
          const timelineEvents = negotiation.transaction_history.map(transaction => ({
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
          if (negotiation.status !== 'active') {
            timelineEvents.push({
              title: `Offer ${negotiation.status.charAt(0).toUpperCase() + negotiation.status.slice(1)}`,
              date: new Date(negotiation.last_updated).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              completed: true,
              icon: negotiation.status === 'cancelled' ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />,
              info: negotiation.status === 'cancelled' ? 'Offer cancelled' : `£${negotiation.current_offer.toLocaleString()}`
            });
          }
          
          return {
            id: negotiation.negotiation_id,
            propertyId: negotiation.property_id,
            propertyAddress: propertyDetails.address,
            propertyPrice: propertyDetails.price,
            offerAmount: negotiation.current_offer,
            status: mappedStatus,
            submittedDate: negotiation.created_at,
            lastOfferBy: negotiation.last_offer_by,
            documents: [
              { name: 'Proof of Funds', status: 'pending' as const },
              { name: 'Mortgage in Principle', status: 'pending' as const }
            ],
            milestones: {
              viewingComplete: true,
              offerSubmitted: true,
              documentsVerified: false,
              solicitorAssigned: mappedStatus === 'accepted'
            },
            timeline: timelineEvents
          };
        }).sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

        setApplications(newApplications);
        setError(null);
      } catch (err) {
        console.error('Error fetching negotiations:', err);
        setError('Failed to load applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNegotiations();
  }, []);

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const getStatusStyles = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'action_required':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setViewMode('detail');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedApplication) {
    return (
      <div className="p-6">
        <button 
          onClick={() => setViewMode('list')}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center"
        >
          ← Back to Applications
        </button>
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{selectedApplication.propertyAddress}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-gray-600">Listed for: £{selectedApplication.propertyPrice.toLocaleString()}</span>
                <span className={`${
                  selectedApplication.status === 'accepted' 
                    ? 'text-emerald-600' 
                    : selectedApplication.status === 'rejected'
                      ? 'text-red-600'
                      : selectedApplication.lastOfferBy === user?.uid 
                        ? 'text-emerald-600' 
                        : 'text-blue-600'
                } font-medium`}>
                  {selectedApplication.status === 'accepted' ? (
                    <>Accepted offer: £{selectedApplication.offerAmount.toLocaleString()}</>
                  ) : selectedApplication.status === 'rejected' ? (
                    <>Rejected offer: £{selectedApplication.offerAmount.toLocaleString()}</>
                  ) : selectedApplication.lastOfferBy === user?.uid ? (
                    <>Your offer: £{selectedApplication.offerAmount.toLocaleString()}</>
                  ) : (
                    <>Counter offer: £{selectedApplication.offerAmount.toLocaleString()}</>
                  )}
                </span>
                <span className="text-gray-500">
                  {selectedApplication.status === 'accepted' ? (
                    <>Offer accepted</>
                  ) : selectedApplication.status === 'rejected' ? (
                    <>Offer rejected</>
                  ) : selectedApplication.lastOfferBy === user?.uid ? (
                    <>You made an offer</>
                  ) : (
                    <>Seller made a counter offer</>
                  )} on {new Date(selectedApplication.submittedDate).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusStyles(selectedApplication.status)}`}>
              {selectedApplication.status === 'pending' && <Clock className="h-4 w-4" />}
              {selectedApplication.status === 'action_required' && <AlertCircle className="h-4 w-4" />}
              {selectedApplication.status === 'accepted' && <CheckCircle className="h-4 w-4" />}
              {selectedApplication.status === 'rejected' && <XCircle className="h-4 w-4" />}
              {selectedApplication.status === 'cancelled' && <XCircle className="h-4 w-4" />}
              {selectedApplication.status === 'action_required' ? 'Action Required' : (
                selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)
              )}
            </span>
          </div>
          <Timeline events={selectedApplication.timeline} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <div className="flex gap-2">
          <select 
            className="border rounded-lg px-3 py-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value as ApplicationStatus | 'all')}
          >
            <option value="all">All Applications</option>
            <option value="action_required">Action Required</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <div key={application.id} className="border rounded-lg hover:shadow-md transition-shadow">
            <div className="p-4">
              {/* Application Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{application.propertyAddress}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-gray-600">Listed for: £{application.propertyPrice.toLocaleString()}</span>
                    <span className={`${
                      application.status === 'accepted' 
                        ? 'text-emerald-600' 
                        : application.status === 'rejected'
                          ? 'text-red-600'
                          : application.lastOfferBy === user?.uid 
                            ? 'text-emerald-600' 
                            : 'text-blue-600'
                    } font-medium`}>
                      {application.status === 'accepted' ? (
                        <>Accepted offer: £{application.offerAmount.toLocaleString()}</>
                      ) : application.status === 'rejected' ? (
                        <>Rejected offer: £{application.offerAmount.toLocaleString()}</>
                      ) : application.lastOfferBy === user?.uid ? (
                        <>Your offer: £{application.offerAmount.toLocaleString()}</>
                      ) : (
                        <>Counter offer: £{application.offerAmount.toLocaleString()}</>
                      )}
                    </span>
                    <span className="text-gray-500">
                      {application.status === 'accepted' ? (
                        <>Offer accepted</>
                      ) : application.status === 'rejected' ? (
                        <>Offer rejected</>
                      ) : application.lastOfferBy === user?.uid ? (
                        <>You made an offer</>
                      ) : (
                        <>Seller made a counter offer</>
                      )} on {new Date(application.submittedDate).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusStyles(application.status)}`}>
                  {application.status === 'pending' && <Clock className="h-4 w-4" />}
                  {application.status === 'action_required' && <AlertCircle className="h-4 w-4" />}
                  {application.status === 'accepted' && <CheckCircle className="h-4 w-4" />}
                  {application.status === 'rejected' && <XCircle className="h-4 w-4" />}
                  {application.status === 'cancelled' && <XCircle className="h-4 w-4" />}
                  {application.status === 'action_required' ? 'Action Required' : (
                    application.status.charAt(0).toUpperCase() + application.status.slice(1)
                  )}
                </span>
              </div>

              {/* Key Milestones */}
              <div className="flex gap-6 mt-4">
                {application.milestones.viewingComplete && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Viewing Complete
                  </div>
                )}
                {application.milestones.offerSubmitted && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Offer Submitted
                  </div>
                )}
              </div>

              {/* Required Actions and Counter Offer Actions */}
              {(application.status === 'pending' || application.status === 'action_required') && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Required Actions</h3>
                  <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    {application.documents.map((doc) => (
                      <span key={doc.name} className={`text-sm flex items-center gap-1 ${
                        doc.status === 'completed' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {doc.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        {doc.name}
                      </span>
                    ))}
                  </div>
                    {application.lastOfferBy !== user?.uid && application.status === 'action_required' ? (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAcceptOffer(application.id)}
                          disabled={acceptLoading === application.id}
                          className={`px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-sm font-medium transition-colors
                            ${acceptLoading === application.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {acceptLoading === application.id ? 'Accepting...' : 'Accept'}
                        </button>
                        <button 
                          onClick={() => handleRejectOffer(application.id)}
                          disabled={rejectLoading === application.id}
                          className={`px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium transition-colors
                            ${rejectLoading === application.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {rejectLoading === application.id ? 'Rejecting...' : 'Reject'}
                        </button>
                        <button 
                          onClick={() => handleCounterOffer(application)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium"
                        >
                          Counter
                        </button>
                      </div>
                    ) : application.status === 'pending' && application.lastOfferBy === user?.uid && (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleCancelOffer(application.id)}
                          disabled={cancelLoading === application.id}
                          className={`px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors
                            ${cancelLoading === application.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {cancelLoading === application.id ? 'Cancelling...' : 'Cancel Offer'}
                        </button>
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="mt-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="border-t px-4 py-3 bg-gray-50 flex justify-between items-center">
              <div className="flex gap-4">
                {application.status === 'pending' && application.lastOfferBy === user?.uid && (
                  <>
                    <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                      Upload Documents
                    </button>
                    <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                      Contact Agent
                    </button>
                  </>
                )}
                {application.status === 'accepted' && (
                  <>
                    <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                      Contact Solicitor
                    </button>
                    <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                      Book Survey
                    </button>
                  </>
                )}
              </div>
              <button 
                onClick={() => handleViewDetails(application)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                View Details
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Offer Modal */}
      {isOfferModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => {
            setIsOfferModalOpen(false);
            setCounterOfferId(null);
            setOfferError(null);
          }}
        >
          <div 
            className="bg-white rounded-lg p-8 w-full max-w-md relative mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setIsOfferModalOpen(false);
                setCounterOfferId(null);
                setOfferError(null);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal content */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Make Counter Offer</h3>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-lg text-gray-700 font-medium">
                    {(() => {
                      const app = applications.find(app => app.id === counterOfferId);
                      if (!app) return null;
                      const [streetPart, cityPostcodePart] = app.propertyAddress.split(', ');
                      const [city, postcode] = cityPostcodePart.split(' ').reduce((acc, part, i, arr) => {
                        if (i < arr.length - 2) {
                          acc[0] = (acc[0] ? acc[0] + ' ' : '') + part;
                        } else {
                          acc[1] = (acc[1] ? acc[1] + ' ' : '') + part;
                        }
                        return acc;
                      }, ['', '']);
                      return (
                        <>
                          {streetPart},
                          <br />
                          {city}, {postcode}
                        </>
                      );
                    })()}
                  </p>
                </div>
                <p className="text-lg font-semibold text-gray-900 ml-4">
                  £{applications.find(app => app.id === counterOfferId)?.propertyPrice.toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-3">
                <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700">
                  Counter Offer Amount (£)
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
                  placeholder="Enter your counter offer amount"
                />
                {offerError && (
                  <p className="text-sm text-red-600 mt-1">{offerError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmitCounterOffer}
                  className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Submit Counter Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsSection;
