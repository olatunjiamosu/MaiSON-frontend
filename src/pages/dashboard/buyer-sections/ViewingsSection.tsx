import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Star, FileText, X } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

type ViewingStatus = 'upcoming' | 'completed';

interface Viewing {
  id: string;
  propertyId: string;
  propertyImage: string;
  propertyAddress: string;
  dateTime: string;
  status: ViewingStatus;
  notes?: string;
  agentName: string;
  agentPhone: string;
  rating?: number;
}

// Mock data
const mockViewings: Viewing[] = [
  {
    id: '1',
    propertyId: '123',
    propertyImage:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    propertyAddress: '123 Park Avenue, London SE22 9QA',
    dateTime: '2024-02-20T14:00:00',
    status: 'completed',
    agentName: 'John Smith',
    agentPhone: '07700 900123',
    notes: '',
    rating: 0,
  },
  {
    id: '2',
    propertyId: '456',
    propertyImage:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
    propertyAddress: '456 Oak Street, London SE15 3AB',
    dateTime: '2024-03-15T10:00:00',
    status: 'upcoming',
    agentName: 'Jane Doe',
    agentPhone: '07700 900456',
  },
  // Add more mock viewings...
];

const ViewingsSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ViewingStatus>('upcoming');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [displayOfferAmount, setDisplayOfferAmount] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<{ id: string; address: string } | null>(null);

  const filteredViewings = mockViewings.filter(
    viewing => viewing.status === activeTab
  );

  const getStatusColor = (status: ViewingStatus) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-emerald-600 bg-emerald-50';
    }
  };

  const getStatusIcon = (status: ViewingStatus) => {
    switch (status) {
      case 'upcoming':
        return <AlertCircle className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const handleRatingChange = (viewingId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [viewingId]: rating }));
    // TODO: Save rating to backend
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleMakeOffer = (propertyId: string, propertyAddress: string) => {
    setSelectedProperty({ id: propertyId, address: propertyAddress });
    setIsOfferModalOpen(true);
  };

  const handleSubmitOffer = () => {
    if (!selectedProperty) return;
    
    const numericAmount = parseFloat(offerAmount.replace(/,/g, ''));
    if (!offerAmount || isNaN(numericAmount)) {
      // Handle error
      return;
    }

    // TODO: Implement API call to submit offer
    console.log('Submitting offer:', {
      propertyId: selectedProperty.id,
      amount: numericAmount,
    });

    // Navigate to applications page after submission
    navigate('/buyer-dashboard/applications', {
      state: { propertyId: selectedProperty.id, fromViewing: true }
    });

    // Reset and close modal
    setOfferAmount('');
    setDisplayOfferAmount('');
    setIsOfferModalOpen(false);
    setSelectedProperty(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Property Viewings</h2>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {(['upcoming', 'completed'] as ViewingStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === status
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Offer Modal */}
      {isOfferModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative mx-4">
            {/* Close button */}
            <button
              onClick={() => setIsOfferModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal content */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Make an Offer</h3>
              <p className="text-gray-600">{selectedProperty.address}</p>
              
              <div className="space-y-2">
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
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter your offer amount"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmitOffer}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Submit Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Viewings List */}
      <div className="space-y-4">
        {filteredViewings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No {activeTab} viewings</p>
          </div>
        ) : (
          filteredViewings.map(viewing => (
            <div key={viewing.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-6">
                {/* Property Image */}
                <img
                  src={viewing.propertyImage}
                  alt="Property"
                  className="w-32 h-32 object-cover rounded-lg"
                />

                {/* Viewing Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {viewing.propertyAddress}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(
                            new Date(viewing.dateTime),
                            'EEEE, MMMM d, yyyy'
                          )}
                        </span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>
                          {format(new Date(viewing.dateTime), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(viewing.status)}`}
                    >
                      {getStatusIcon(viewing.status)}
                      {viewing.status.charAt(0).toUpperCase() +
                        viewing.status.slice(1)}
                    </span>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Seller:</span>{' '}
                      {viewing.agentName}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{' '}
                      {viewing.agentPhone}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {viewing.status === 'upcoming' && (
                      <>
                        <button
                          onClick={() => {
                            /* TODO: Implement reschedule */
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => {
                            /* TODO: Implement cancel */
                          }}
                          className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleViewProperty(viewing.propertyId)}
                      className="px-3 py-1 text-sm border border-emerald-600 text-emerald-600 rounded hover:bg-emerald-50"
                    >
                      View Property
                    </button>
                  </div>

                  {/* Notes and Rating for Completed Viewings */}
                  {viewing.status === 'completed' && (
                    <div className="mt-4 space-y-4">
                      {/* Notes */}
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Your Notes
                        </h4>
                        {editingNotes === viewing.id ? (
                          <div className="mt-2">
                            <textarea
                              value={noteText}
                              onChange={e => setNoteText(e.target.value)}
                              className="w-full p-2 border rounded"
                              rows={3}
                              placeholder="Add your notes about the viewing..."
                            />
                            <div className="mt-2 flex justify-end gap-2">
                              <button
                                onClick={() => setEditingNotes(null)}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: Save notes to backend
                                  console.log('Saving note:', noteText);
                                  setEditingNotes(null);
                                }}
                                className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              {viewing.notes || 'No notes added.'}
                            </p>
                            <button
                              onClick={() => {
                                setEditingNotes(viewing.id);
                                setNoteText(viewing.notes || '');
                              }}
                              className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
                            >
                              Edit Notes
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Rate the Viewing
                        </h4>
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() =>
                                handleRatingChange(viewing.id, star)
                              }
                              className={`h-6 w-6 ${ratings[viewing.id] >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              <Star />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end items-center">
                <button
                  onClick={() => handleMakeOffer(viewing.propertyId, viewing.propertyAddress)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Make an Offer</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewingsSection;
