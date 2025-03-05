import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, XCircle, FileText, ArrowRight, 
  AlertCircle, Home, Scale, UserCheck, Key, Check 
} from 'lucide-react';
import PropertyService from '../../../services/PropertyService';
import { Negotiation } from '../../../types/property';
import { useAuth } from '../../../context/AuthContext';

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

  // Fetch negotiations from dashboard
  useEffect(() => {
    const fetchNegotiations = async () => {
      try {
        setLoading(true);
        const dashboardData = await PropertyService.getUserDashboard();
        
        // Create a map of property details from offered properties
        const propertyDetailsMap = new Map(
          dashboardData.offered_properties.map(property => [
            property.property_id,
            {
              address: `${property.address.house_number} ${property.address.street}, ${property.address.city} ${property.address.postcode}`,
              price: property.price,
              latest_offer: property.latest_offer
            }
          ])
        );

        // Convert negotiations to applications format
        const newApplications: Application[] = dashboardData.negotiations_as_buyer.map(negotiation => {
          const propertyDetails = propertyDetailsMap.get(negotiation.property_id);
          
          // Get the matching offered property
          const offeredProperty = dashboardData.offered_properties.find(
            prop => prop.property_id === negotiation.property_id
          );
          
          // Map 'active' status to 'pending' or 'action_required'
          const mappedStatus = negotiation.status === 'active' 
            ? (negotiation.last_offer_by !== user?.uid ? 'action_required' : 'pending')
            : negotiation.status as ApplicationStatus;
          
          return {
            id: negotiation.negotiation_id,
            propertyId: negotiation.property_id,
            propertyAddress: propertyDetails?.address || 'Address not available',
            propertyPrice: propertyDetails?.price || 0,
            offerAmount: negotiation.current_offer,
            status: mappedStatus,
            submittedDate: negotiation.created_at,
            lastOfferBy: negotiation.last_offer_by,
            documents: [
              { name: 'Proof of Funds', status: 'pending' },
              { name: 'Mortgage in Principle', status: 'pending' }
            ],
            milestones: {
              viewingComplete: true,
              offerSubmitted: true,
              documentsVerified: false,
              solicitorAssigned: mappedStatus === 'accepted'
            },
            timeline: [
              {
                title: 'Offer Submitted',
                date: new Date(negotiation.created_at).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }),
                completed: true,
                icon: <FileText className="h-3 w-3" />,
                info: `£${negotiation.current_offer.toLocaleString()}`
              },
              // Add status update if the offer status has changed
              ...(offeredProperty && offeredProperty.latest_offer.status !== 'active' ? [
                {
                  title: `Offer ${offeredProperty.latest_offer.status.charAt(0).toUpperCase() + offeredProperty.latest_offer.status.slice(1)}`,
                  date: new Date(offeredProperty.latest_offer.last_updated).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }),
                  completed: true,
                  icon: offeredProperty.latest_offer.status === 'cancelled' ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />,
                  info: offeredProperty.latest_offer.status === 'cancelled' ? 'Offer cancelled' : `£${offeredProperty.latest_offer.amount.toLocaleString()}`
                }
              ] : [])
            ]
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
                <span className={`${selectedApplication.lastOfferBy === user?.uid ? 'text-emerald-600' : 'text-blue-600'} font-medium`}>
                  {selectedApplication.lastOfferBy === user?.uid ? (
                    <>Your offer: £{selectedApplication.offerAmount.toLocaleString()}</>
                  ) : (
                    <>Counter offer: £{selectedApplication.offerAmount.toLocaleString()}</>
                  )}
                </span>
                <span className="text-gray-500">
                  {selectedApplication.lastOfferBy === user?.uid ? (
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
                    <span className={`${application.lastOfferBy === user?.uid ? 'text-emerald-600' : 'text-blue-600'} font-medium`}>
                      {application.lastOfferBy === user?.uid ? (
                        <>Your offer: £{application.offerAmount.toLocaleString()}</>
                      ) : (
                        <>Counter offer: £{application.offerAmount.toLocaleString()}</>
                      )}
                    </span>
                    <span className="text-gray-500">
                      {application.lastOfferBy === user?.uid ? (
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
                    {application.lastOfferBy !== user?.uid && (
                      <div className="flex gap-3">
                        <button className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-sm font-medium">
                          Accept
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium">
                          Reject
                        </button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium">
                          Counter
                        </button>
                      </div>
                    )}
                  </div>
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
    </div>
  );
};

export default ApplicationsSection;
