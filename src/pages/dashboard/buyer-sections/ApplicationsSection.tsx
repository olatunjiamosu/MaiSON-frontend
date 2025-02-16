import React, { useState } from 'react';
import { 
  Clock, CheckCircle, XCircle, FileText, ArrowRight, 
  AlertCircle, Home, Scale, UserCheck, Key, Check 
} from 'lucide-react';

type ApplicationStatus = 'pending' | 'accepted' | 'rejected';
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
  offerAmount: number;
  status: ApplicationStatus;
  submittedDate: string;
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
                  <span className="text-xs text-gray-500 ml-2">• {event.info}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Update the mock data with complete timeline events
const mockApplications: Application[] = [
  {
    id: '1',
    propertyId: '456',
    propertyAddress: '456 Oak Street, London SE15 3AB',
    offerAmount: 450000,
    status: 'pending',
    submittedDate: '2024-03-15',
    documents: [
      { name: 'Proof of Funds', status: 'completed' },
      { name: 'Mortgage in Principle', status: 'pending' }
    ],
    milestones: {
      viewingComplete: true,
      offerSubmitted: true,
      documentsVerified: false,
      solicitorAssigned: false
    },
    timeline: [
      {
        title: 'Viewing Completed',
        date: 'March 10, 2024',
        completed: true,
        icon: <Home className="h-3 w-3" />,
        info: 'In-person viewing'
      },
      {
        title: 'Offer Submitted',
        date: 'March 12, 2024',
        completed: true,
        icon: <FileText className="h-3 w-3" />,
        info: '£450,000'
      },
      {
        title: 'Documents Uploaded',
        date: 'March 13, 2024',
        current: true,
        icon: <FileText className="h-3 w-3" />,
        info: 'Pending: Mortgage in Principle'
      },
      {
        title: 'Offer Accepted',
        date: 'Pending',
        completed: false,
        icon: <Check className="h-3 w-3" />
      },
      {
        title: 'Solicitor Assigned',
        date: 'Pending',
        completed: false,
        icon: <Scale className="h-3 w-3" />
      },
      {
        title: 'Surveys Completed',
        date: 'Pending',
        completed: false,
        icon: <UserCheck className="h-3 w-3" />
      },
      {
        title: 'Exchange Contracts',
        date: 'Pending',
        completed: false,
        icon: <FileText className="h-3 w-3" />
      },
      {
        title: 'Completion',
        date: 'Pending',
        completed: false,
        icon: <Key className="h-3 w-3" />
      }
    ]
  },
  {
    id: '2',
    propertyId: '123',
    propertyAddress: '123 Maple Road, London N1 5AB',
    offerAmount: 425000,
    status: 'accepted',
    submittedDate: '2024-03-10',
    documents: [
      { name: 'Proof of Funds', status: 'completed' },
      { name: 'Mortgage in Principle', status: 'completed' }
    ],
    milestones: {
      viewingComplete: true,
      offerSubmitted: true,
      documentsVerified: true,
      solicitorAssigned: true
    },
    timeline: [
      {
        title: 'Viewing Completed',
        date: 'March 5, 2024',
        completed: true,
        icon: <Home className="h-3 w-3" />,
        info: 'In-person viewing'
      },
      {
        title: 'Offer Submitted',
        date: 'March 7, 2024',
        completed: true,
        icon: <FileText className="h-3 w-3" />,
        info: '£425,000'
      },
      {
        title: 'Documents Uploaded',
        date: 'March 8, 2024',
        completed: true,
        icon: <FileText className="h-3 w-3" />,
        info: 'All documents verified'
      },
      {
        title: 'Offer Accepted',
        date: 'March 10, 2024',
        completed: true,
        icon: <Check className="h-3 w-3" />
      },
      {
        title: 'Solicitor Assigned',
        date: 'March 12, 2024',
        completed: true,
        icon: <Scale className="h-3 w-3" />,
        info: 'Smith & Partners LLP'
      },
      {
        title: 'Surveys Completed',
        date: 'In Progress',
        current: true,
        icon: <UserCheck className="h-3 w-3" />,
        info: 'Scheduled for March 20'
      },
      {
        title: 'Exchange Contracts',
        date: 'Pending',
        completed: false,
        icon: <FileText className="h-3 w-3" />
      },
      {
        title: 'Completion',
        date: 'Pending',
        completed: false,
        icon: <Key className="h-3 w-3" />
      }
    ]
  }
];

const ApplicationsSection = () => {
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const filteredApplications = filter === 'all' 
    ? mockApplications 
    : mockApplications.filter(app => app.status === filter);

  const getStatusStyles = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setViewMode('detail');
  };

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
                <span className="text-emerald-600 font-medium">
                  £{selectedApplication.offerAmount.toLocaleString()}
                </span>
                <span className="text-gray-500">
                  Submitted: {new Date(selectedApplication.submittedDate).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusStyles(selectedApplication.status)}`}>
              {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
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
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
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
                    <span className="text-emerald-600 font-medium">
                      £{application.offerAmount.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      Offer made: {new Date(application.submittedDate).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusStyles(application.status)}`}>
                  {application.status === 'pending' && <Clock className="h-4 w-4" />}
                  {application.status === 'accepted' && <CheckCircle className="h-4 w-4" />}
                  {application.status === 'rejected' && <XCircle className="h-4 w-4" />}
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
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
                {/* Add more milestones */}
              </div>

              {/* Required Actions or Next Steps */}
              {application.status === 'pending' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Required Actions</h3>
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
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="border-t px-4 py-3 bg-gray-50 flex justify-between items-center">
              <div className="flex gap-4">
                {application.status === 'pending' && (
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
