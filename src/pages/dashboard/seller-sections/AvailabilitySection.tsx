import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { format, parseISO, addHours, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'react-hot-toast';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Database interface matching your Azure PostgreSQL schema
interface DbAvailability {
  id: number;           // This stays as number since it's a serial ID
  property_id: string;  // UUID
  seller_id: string;    // UUID (Firebase UID)
  start_time: Date;
  end_time: Date;
}

// Calendar event interface
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

// Helper function to validate UUID
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const AvailabilitySection = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { user } = useAuth();
  const [availabilitySlots, setAvailabilitySlots] = useState<DbAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  
  // Calendar view state
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState<{start: Date, end: Date}>({
    start: new Date(),
    end: addHours(new Date(), 1)
  });

  // Validate propertyId is a UUID
  useEffect(() => {
    if (propertyId && !isValidUUID(propertyId)) {
      setError('Invalid property ID format. Expected UUID.');
    } else {
      setError('');
    }
  }, [propertyId]);

  // Fetch availability slots from Azure PostgreSQL
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!propertyId || !user?.uid || !isValidUUID(propertyId)) return;
      
      try {
        // First fetch property details to verify it exists
        console.log(`Fetching property details for ${propertyId}`);
        const propertyResponse = await fetch(`http://localhost:8000/api/property/${propertyId}`, {
          headers: {
            'Accept': 'application/json',
          }
        });
        
        console.log('Property details response status:', propertyResponse.status);
        const propertyText = await propertyResponse.text();
        console.log('Property details raw response:', propertyText);
        
        if (!propertyResponse.ok) {
          throw new Error(`Failed to fetch property details: ${propertyText}`);
        }
        
        try {
          const propertyData = JSON.parse(propertyText);
          console.log('Property data:', propertyData);
          
          // Now fetch availability slots
          const response = await fetch(`http://localhost:8000/api/availability/property/${propertyId}`, {
            headers: {
              'Authorization': `Bearer ${await user.getIdToken()}`,
              'Accept': 'application/json',
            }
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch availability: ${errorText}`);
          }
          
    const data = await response.json();
          setAvailabilitySlots(data.map((slot: any) => ({
            ...slot,
            start_time: new Date(slot.start_time),
            end_time: new Date(slot.end_time)
          })));
        } catch (parseError) {
          console.error('Error parsing property data:', parseError);
          throw new Error(`Invalid property data: ${propertyText}`);
        }
  } catch (error) {
    console.error('Error fetching availability:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch availability');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [propertyId, user]);

  // Convert availability slots to calendar events
  const events = useMemo(() => {
    return availabilitySlots.map(slot => ({
      id: slot.id,
      title: 'Available',
      start: new Date(slot.start_time),
      end: new Date(slot.end_time),
      resource: slot
    }));
  }, [availabilitySlots]);

  // Handle slot selection (for creating new availability)
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setNewSlot({ start, end });
      setShowAddModal(true);
    },
    []
  );

  // Handle event selection (for editing or deleting)
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      const confirmDelete = window.confirm(
        `Do you want to remove this availability slot?\n\nDate: ${format(event.start, 'PPP')}\nTime: ${format(event.start, 'p')} - ${format(event.end, 'p')}`
      );
      
      if (confirmDelete) {
        deleteAvailability(event.id);
      }
    },
    [availabilitySlots]
  );

  // Save a new availability slot
  const saveAvailability = async (newSlot: Omit<DbAvailability, 'id'>) => {
    if (!propertyId || !user?.uid || !isValidUUID(propertyId)) {
      setError('Invalid property ID or user not authenticated');
      return;
    }

    try {
      console.log('Saving availability with the following data:');
      console.log('Property ID:', propertyId);
      console.log('User ID:', user.uid);
      console.log('Start time:', newSlot.start_time.toISOString());
      console.log('End time:', newSlot.end_time.toISOString());
      
      // First fetch property details to get the seller ID
      console.log('Fetching property details to get seller ID...');
      const propertyResponse = await fetch(`http://localhost:8000/api/property/${propertyId}`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!propertyResponse.ok) {
        throw new Error(`Failed to fetch property details: ${await propertyResponse.text()}`);
      }
      
      const propertyData = await propertyResponse.json();
      console.log('Property data:', propertyData);
      
      // Check for seller ID in various places
      let sellerId = null;
      
      // 1. Check if the property has a seller object with an ID
      if (propertyData.seller && propertyData.seller.id) {
        sellerId = propertyData.seller.id;
        console.log('Using seller ID from property.seller.id:', sellerId);
      } 
      // 2. Check if the property has a seller_id property
      else if (propertyData.seller_id) {
        sellerId = propertyData.seller_id;
        console.log('Using seller ID from property.seller_id:', sellerId);
      } 
      // 3. Check localStorage for a previously saved seller ID
      else {
        const savedSellerId = localStorage.getItem('lastSellerId');
        if (savedSellerId) {
          sellerId = savedSellerId;
          console.log('Using seller ID from localStorage:', sellerId);
        } else {
          // 4. Use the hardcoded ID as a last resort
          sellerId = "b0dc906d-1238-46a2-b7a3-d20a2b529543"; // Update with the seller ID from the response
          console.log('No seller ID found, using hardcoded fallback:', sellerId);
        }
      }
      
      // Set a loading toast - store the ID returned by toast.loading()
      const loadingToastId = toast.loading('Saving availability slot...') as unknown as string;

      console.log('Sending availability request with seller ID:', sellerId);
      const response = await fetch(`http://localhost:8000/api/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          property_id: propertyId,
          seller_id: sellerId,
          start_time: newSlot.start_time.toISOString(),
          end_time: newSlot.end_time.toISOString()
        }),
      });

      // Dismiss the loading toast using the stored ID
      toast.dismiss(loadingToastId);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response from server:', errorText);
        
        // If we still get an error, try using the property ID as the seller ID
        if (errorText.includes('seller_id') || errorText.includes('foreign key constraint')) {
          console.log('Trying to use property ID as seller ID...');
          
          const finalAttemptResponse = await fetch(`http://localhost:8000/api/availability`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await user.getIdToken()}`,
            },
            body: JSON.stringify({
              property_id: propertyId,
              seller_id: propertyId, // Use property ID as seller ID
              start_time: newSlot.start_time.toISOString(),
              end_time: newSlot.end_time.toISOString()
            }),
          });
          
          if (finalAttemptResponse.ok) {
            const savedSlot = await finalAttemptResponse.json();
            setAvailabilitySlots(prev => [...prev, {
              ...savedSlot,
              start_time: new Date(savedSlot.start_time),
              end_time: new Date(savedSlot.end_time)
            }]);
            
            toast.success('Availability slot added successfully (using property ID as seller ID)');
            return;
          } else {
            const finalErrorText = await finalAttemptResponse.text();
            console.log('Final error response from server:', finalErrorText);
            toast.error('Seller ID format error. Please contact your administrator.');
            setTestResult(`Error: Could not add availability slot. We tried multiple approaches but none worked. Error: ${finalErrorText}`);
          }
        } else {
          throw new Error(`Failed to save availability: ${errorText}`);
        }
        return;
      }

      const savedSlot = await response.json();
      setAvailabilitySlots(prev => [...prev, {
        ...savedSlot,
        start_time: new Date(savedSlot.start_time),
        end_time: new Date(savedSlot.end_time)
      }]);
      
      toast.success('Availability slot added successfully');
      } catch (error) {
      console.error('Error saving availability:', error);
      setError(error instanceof Error ? error.message : 'Failed to save availability');
      toast.error('Failed to add availability slot');
    }
  };

  // Delete an availability slot
  const deleteAvailability = async (slotId: number) => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`http://localhost:8000/api/availability/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete availability: ${errorText}`);
      }

      setAvailabilitySlots(prev => prev.filter(slot => slot.id !== slotId));
      toast.success('Availability slot removed');
    } catch (error) {
      console.error('Error deleting availability:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete availability');
      toast.error('Failed to remove availability slot');
    }
  };

  // Handle adding a new availability slot
  const handleAddAvailability = () => {
    saveAvailability({
      property_id: propertyId!,
      seller_id: user!.uid,
      start_time: newSlot.start,
      end_time: newSlot.end
    });
    setShowAddModal(false);
  };

  const testEndpoint = async () => {
    if (!propertyId || !user?.uid) {
      setTestResult('Error: Missing propertyId or user');
      return;
    }

    if (!isValidUUID(propertyId)) {
      setTestResult('Error: Invalid UUID format for property ID');
      return;
    }

    try {
      const endpoint = `http://localhost:8000/api/availability/property/${propertyId}`;
      console.log('Testing endpoint:', endpoint);
      console.log('Property ID (UUID):', propertyId);
      console.log('User ID:', user.uid);
      
      setTestResult(`Testing endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${responseText}`);
      }
      
      const data = JSON.parse(responseText);
      setTestResult(`Success! Status: ${response.status}. Found ${data.length || 0} slots`);
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createTestProperty = async () => {
    try {
      console.log('Creating test property...');
      
      // First check if the server is running using the basic-test endpoint
      console.log('Checking server connection...');
      const checkResponse = await fetch('http://localhost:8000/basic-test');
      
      console.log('Server check response status:', checkResponse.status);
      const checkText = await checkResponse.text();
      console.log('Server check raw response:', checkText);
      
      // Now create a real property using the test-create endpoint
      console.log('Creating property...');
      const response = await fetch('http://localhost:8000/api/test-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Property creation response status:', response.status);
      const text = await response.text();
      console.log('Property creation raw response:', text);
      
      try {
        const data = JSON.parse(text);
        console.log('Parsed property data:', data);
        
        if (data.property && data.property.id) {
          console.log('Property created successfully with ID:', data.property.id);
          navigate(`/seller-dashboard/property/${data.property.id}/availability`);
    } else {
          throw new Error(data.error || 'No property ID returned');
        }
      } catch (parseError) {
        console.error('Failed to parse property creation response:', parseError);
        throw new Error(`Invalid response from server: ${text}`);
      }
    } catch (error) {
      console.error('Failed to create test property:', error);
      setError(error instanceof Error ? error.message : 'Failed to create test property');
    }
  };

  // Test seller ID endpoint
  const testSellerEndpoint = async () => {
    if (!user?.uid) {
      setTestResult('Error: User not authenticated');
      return;
    }

    try {
      setTestResult(`Checking seller ID for Firebase UID: ${user.uid}`);
      
      // First check localStorage for a saved seller ID
      const savedSellerId = localStorage.getItem('lastSellerId');
      if (savedSellerId) {
        setTestResult(`Found seller ID in localStorage: ${savedSellerId}`);
        return;
      }
      
      // If no seller ID in localStorage, check if we're on a property page
      if (propertyId) {
        console.log('Fetching property details to check for seller ID...');
        const propertyResponse = await fetch(`http://localhost:8000/api/property/${propertyId}`, {
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (propertyResponse.ok) {
          const propertyData = await propertyResponse.json();
          console.log('Property data:', propertyData);
          
          // Check if the property has a seller object with an ID
          if (propertyData.seller && propertyData.seller.id) {
            const sellerId = propertyData.seller.id;
            localStorage.setItem('lastSellerId', sellerId);
            setTestResult(`Found seller ID in property data: ${sellerId}`);
            return;
          }
          
          // Check if the property has a seller_id property
          if (propertyData.seller_id) {
            const sellerId = propertyData.seller_id;
            localStorage.setItem('lastSellerId', sellerId);
            setTestResult(`Found seller ID in property data: ${sellerId}`);
            return;
          }
        }
      }
      
      // If we still don't have a seller ID, suggest creating one
      setTestResult(`No seller ID found. Please click "Create Test Seller" to create a new seller.`);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Discover available endpoints
  const discoverEndpoints = async () => {
    setTestResult('Discovering available endpoints...');
    
    // List of potential endpoints to test
    const endpointsToTest = [
      '/api/test-create',
      '/api/test-create-seller',
      '/api/seller',
      '/api/seller/create',
      '/api/test/seller',
      '/api/test/create-seller',
      '/basic-test'
    ];
    
    const results: string[] = [];
    
    for (const endpoint of endpointsToTest) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const response = await fetch(`http://localhost:8000${endpoint}`, {
          method: endpoint === '/basic-test' ? 'GET' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log(`${endpoint} - Status: ${response.status}`);
        const text = await response.text();
        console.log(`${endpoint} - Response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        
        results.push(`${endpoint}: ${response.status} ${response.ok ? '✅' : '❌'}`);
      } catch (error) {
        console.error(`Error testing ${endpoint}:`, error);
        results.push(`${endpoint}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    setTestResult(`Endpoint discovery results:\n${results.join('\n')}`);
  };

  // Create a test seller linked to the current user
  const createTestSeller = async () => {
    if (!user?.uid) {
      setTestResult('Error: User not authenticated');
      return;
    }

    try {
      console.log('Creating test seller for Firebase UID:', user.uid);
      setTestResult('Attempting to create a test seller...');
      
      // Try to create a seller with a specific flag to indicate we want a seller, not just a property
      const response = await fetch('http://localhost:8000/api/test-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          create_seller: true,  // Explicitly request seller creation
          firebase_uid: user.uid,
          email: user.email || 'test@example.com',
          name: user.displayName || 'Test Seller',
          seller_only: true  // Add this flag to indicate we want a seller, not a property
        })
      });

      console.log('Seller creation response status:', response.status);
      const text = await response.text();
      console.log('Seller creation raw response:', text);
      
      try {
        const data = JSON.parse(text);
        console.log('Parsed response data:', data);
        
        // Check if we got a property with a seller object
        if (data.property && data.property.seller && data.property.seller.id) {
          const sellerId = data.property.seller.id;
          console.log('Found seller ID in response:', sellerId);
          
          // Store the seller ID in localStorage for future use
          localStorage.setItem('lastSellerId', sellerId);
          
          setTestResult(`Success! Property created with ID: ${data.property.id}.\nSeller ID: ${sellerId}\n\nYou can now add availability slots. The seller ID has been saved for future use.`);
          
          // Navigate to the property's availability page
          navigate(`/seller-dashboard/property/${data.property.id}/availability`);
          return;
        }
        
        // Check if we got a seller ID directly
        if (data.seller && data.seller.id) {
          const sellerId = data.seller.id;
          localStorage.setItem('lastSellerId', sellerId);
          
          setTestResult(`Success! Seller created with ID: ${sellerId}`);
          return;
        }
        
        // If we got a property with a seller_id
        if (data.property) {
          console.log('Property created with ID:', data.property.id);
          
          // Check if the property has a seller_id
          if (data.property.seller_id) {
            const sellerId = data.property.seller_id;
            localStorage.setItem('lastSellerId', sellerId);
            
            setTestResult(`Success! Property created with ID: ${data.property.id}.\nSeller ID: ${sellerId}\n\nYou can now add availability slots.`);
            
            // Navigate to the property's availability page
            navigate(`/seller-dashboard/property/${data.property.id}/availability`);
            return;
          }
          
          // If we have a property but no seller_id, try to look up the property to see if it has a seller
          const propertyResponse = await fetch(`http://localhost:8000/api/property/${data.property.id}`, {
            headers: {
              'Accept': 'application/json',
            }
          });
          
          if (propertyResponse.ok) {
            const propertyData = await propertyResponse.json();
            console.log('Property data after creation:', propertyData);
            
            if (propertyData.seller && propertyData.seller.id) {
              const sellerId = propertyData.seller.id;
              localStorage.setItem('lastSellerId', sellerId);
              
              setTestResult(`Success! Property created with ID: ${data.property.id}.\nSeller ID: ${sellerId}\n\nYou can now add availability slots.`);
              navigate(`/seller-dashboard/property/${data.property.id}/availability`);
              return;
            }
            
            if (propertyData.seller_id) {
              const sellerId = propertyData.seller_id;
              localStorage.setItem('lastSellerId', sellerId);
              
              setTestResult(`Success! Property created with ID: ${data.property.id}.\nSeller ID: ${sellerId}\n\nYou can now add availability slots.`);
              navigate(`/seller-dashboard/property/${data.property.id}/availability`);
              return;
            }
          }
          
          // If we still don't have a seller_id, inform the user
          setTestResult(`Property created with ID: ${data.property.id}, but no seller ID was found.\n\nWhen adding availability, we'll try to use your Firebase UID (${user.uid}) directly.`);
          navigate(`/seller-dashboard/property/${data.property.id}/availability`);
        } else {
          setTestResult(`Response did not contain property or seller data. Check the console for details.`);
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setTestResult(`Invalid response from server: ${text}`);
      }
    } catch (error) {
      console.error('Failed to create test seller:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Failed to create test seller'}`);
    }
  };

  // Add this function near your other test functions
  const viewAllSlots = async () => {
    if (!propertyId || !user?.uid) {
      setTestResult('Error: Missing propertyId or user');
      return;
    }

    try {
      console.log('Fetching all availability slots for property:', propertyId);
      
      const response = await fetch(`http://localhost:8000/api/availability/property/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch availability: ${await response.text()}`);
      }
      
      const data = await response.json();
      console.log('All availability slots:', data);
      
      // Format the slots for display
      const formattedSlots = data.map((slot: any) => {
        return {
          id: slot.id,
          property_id: slot.property_id,
          seller_id: slot.seller_id,
          start_time: new Date(slot.start_time).toLocaleString(),
          end_time: new Date(slot.end_time).toLocaleString()
        };
      });
      
      // Display the slots in the test result area
      setTestResult(`Found ${data.length} availability slots in database:\n${JSON.stringify(formattedSlots, null, 2)}`);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Show error if propertyId is invalid
  if (error) {
  return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Availability</h1>
        <div className="space-x-4">
            <button 
            onClick={createTestProperty}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
            Create Test Property
            </button>
          <button 
            onClick={createTestSeller}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Create Test Seller
          </button>
          <button 
            onClick={testEndpoint}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test API Connection
          </button>
          <button 
            onClick={testSellerEndpoint}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test Seller ID
          </button>
          <button 
            onClick={discoverEndpoints}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Discover Endpoints
          </button>
                <button
            onClick={viewAllSlots}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
            View All Slots
                </button>
        </div>
              </div>
              
      {testResult && (
        <div className={`mb-4 p-4 rounded ${
          testResult.startsWith('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {testResult.includes('\n') ? (
            <div>
              <p className="font-semibold mb-2">{testResult.split('\n')[0]}</p>
              <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-2 rounded">
                {testResult.split('\n').slice(1).join('\n')}
              </pre>
                      </div>
          ) : (
            testResult
          )}
            </div>
          )}
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Availability Calendar</h2>
          <div className="flex space-x-2">
                        <button
              onClick={() => setView(Views.DAY)}
              className={`px-3 py-1 rounded ${view === Views.DAY ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
            >
              Day
            </button>
            <button 
              onClick={() => setView(Views.WEEK)}
              className={`px-3 py-1 rounded ${view === Views.WEEK ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setView(Views.MONTH)}
              className={`px-3 py-1 rounded ${view === Views.MONTH ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
            >
              Month
                        </button>
                      </div>
                  </div>
        
        <div className="h-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              view={view}
              onView={(newView: View) => setView(newView)}
              date={date}
              onNavigate={(newDate: Date) => setDate(newDate)}
              defaultView={Views.WEEK}
              step={30}
              timeslots={2}
              eventPropGetter={() => ({
                style: {
                  backgroundColor: '#10b981', // Emerald-500
                  borderColor: '#059669', // Emerald-600
                },
              })}
              dayPropGetter={(date: Date) => ({
                style: {
                  backgroundColor: date.getDay() === 0 || date.getDay() === 6 
                    ? '#f9fafb' // Gray-50 for weekends
                    : '#ffffff',
                },
              })}
              tooltipAccessor={(event: CalendarEvent) => `Available: ${format(event.start, 'p')} - ${format(event.end, 'p')}`}
            />
          )}
        </div>
      </div>
      
      {/* Add Availability Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Availability Slot</h3>
            <div className="space-y-4">
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                  type="date" 
                  value={format(newSlot.start, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = parseISO(e.target.value);
                    const newStart = new Date(
                      newDate.getFullYear(),
                      newDate.getMonth(),
                      newDate.getDate(),
                      newSlot.start.getHours(),
                      newSlot.start.getMinutes()
                    );
                    const newEnd = new Date(
                      newDate.getFullYear(),
                      newDate.getMonth(),
                      newDate.getDate(),
                      newSlot.end.getHours(),
                      newSlot.end.getMinutes()
                    );
                    setNewSlot({ start: newStart, end: newEnd });
                  }}
                  className="w-full p-2 border rounded"
                    />
                  </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                    value={format(newSlot.start, 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const newStart = new Date(newSlot.start);
                      newStart.setHours(hours, minutes);
                      setNewSlot({ ...newSlot, start: newStart });
                    }}
                    className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                    type="time" 
                    value={format(newSlot.end, 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const newEnd = new Date(newSlot.end);
                      newEnd.setHours(hours, minutes);
                      setNewSlot({ ...newSlot, end: newEnd });
                    }}
                    className="w-full p-2 border rounded"
                  />
                  </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAvailability}
                className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
              >
                Add Availability
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilitySection; 