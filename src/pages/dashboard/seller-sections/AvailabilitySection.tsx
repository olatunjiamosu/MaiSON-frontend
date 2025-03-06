import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, addHours, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'react-hot-toast';
import PropertyService from '../../../services/PropertyService';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Database interface matching your Azure PostgreSQL schema
interface DbAvailability {
  id: string;  // Changed from number to string
  property_id: string;
  seller_id: string;
  start_time: string;
  end_time: string;
}

// Calendar event interface
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: DbAvailability;
}

// Time slot interface for UI
interface TimeSlot {
  date: string;
  time: string;
}

interface DbSlot {
  start_time: string;
  end_time: string;
}

interface AvailabilityInput {
  start_time: Date;
  end_time: Date;
}

const timeSlots = [
  '08:00', '08:30','09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

// Helper function to create ISO string from date and time
const createISOString = (date: string, time: string, isEndTime = false): string => {
  const dateObj = new Date(`${date}T${time}:00`);
  if (isEndTime) {
    dateObj.setMinutes(dateObj.getMinutes() + 30);
  }
  return dateObj.toISOString();
};

// Group adjacent time slots to minimize database records
const groupAdjacentTimeSlots = (slots: TimeSlot[]): { date: string, startTime: string, endTime: string }[] => {
  const sortedSlots = [...slots].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
  
  const groups: { date: string, startTime: string, endTime: string }[] = [];
  let currentGroup: { date: string, startTime: string, endTime: string } | null = null;
  
  sortedSlots.forEach((slot) => {
    if (!currentGroup) {
      currentGroup = {
        date: slot.date,
        startTime: slot.time,
        endTime: slot.time
      };
      groups.push(currentGroup);
      return;
    }
    
    if (currentGroup.date === slot.date) {
      const lastSlotTime = currentGroup.endTime;
      const [lastHours, lastMinutes] = lastSlotTime.split(':').map(Number);
      
      const lastSlotDate = new Date(0, 0, 0, lastHours, lastMinutes);
      lastSlotDate.setMinutes(lastSlotDate.getMinutes() + 30);
      const nextExpectedTime = `${String(lastSlotDate.getHours()).padStart(2, '0')}:${String(lastSlotDate.getMinutes()).padStart(2, '0')}`;
      
      if (nextExpectedTime === slot.time) {
        currentGroup.endTime = slot.time;
        return;
      }
    }
    
    currentGroup = {
      date: slot.date,
      startTime: slot.time,
      endTime: slot.time
    };
    groups.push(currentGroup);
  });
  
  return groups;
};

// Helper function to validate UUID
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const AvailabilitySection = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availabilities, setAvailabilities] = useState<TimeSlot[]>([]);
  const [dbAvailabilities, setDbAvailabilities] = useState<DbAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<string | null>(null);
  const [dragEndTime, setDragEndTime] = useState<string | null>(null);
  const [showRegularForm, setShowRegularForm] = useState(false);
  const [regularDay, setRegularDay] = useState<number | null>(null);
  const [regularStartTime, setRegularStartTime] = useState<string>('');
  const [regularEndTime, setRegularEndTime] = useState<string>('');
  const [regularWeeks, setRegularWeeks] = useState(4);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState<{start: Date, end: Date}>({
    start: new Date(),
    end: addHours(new Date(), 1)
  });

  const formatDate = (day: number): string => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const generateCalendarDays = () => {
    const { days, firstDay } = getDaysInMonth(currentMonth);
    const blanks = Array(firstDay).fill(null);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    
    // Get today's date information
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonthNum = today.getMonth();
    const currentYear = today.getFullYear();
    const isCurrentMonth = currentMonth.getMonth() === currentMonthNum && 
                          currentMonth.getFullYear() === currentYear;
    
    // If this is the current month, disable past days
    if (isCurrentMonth) {
      for (let i = 0; i < currentDay - 1; i++) {
        if (i < daysArray.length) {
          // Mark past days as disabled by setting them to -1
          daysArray[i] = -daysArray[i];
        }
      }
    }
    
    return [...blanks, ...daysArray];
  };

  const handleTimeToggle = (time: string) => {
    // If we're in the middle of a drag, don't do anything
    if (isDragging) return;
    
    // Create a new time slot immediately when clicked
    const timeSlot = {
      date: selectedDate,
      time
    };
    
    // Check if this slot already exists
    const existingIndex = availabilities.findIndex(
      slot => slot.date === selectedDate && slot.time === time
    );
    
    if (existingIndex !== -1) {
      // Remove if it already exists
      setAvailabilities(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      // Add if it doesn't exist
      setAvailabilities(prev => [...prev, timeSlot]);
    }
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(formatDate(day));
    // Clear selected times when changing date
    setSelectedTimes([]);
  };

  const getTimeIndex = (time: string) => timeSlots.indexOf(time);

  const handleDragEnter = (time: string) => {
    if (!isDragging || !selectedDate) return;
    
    setDragEndTime(time);
    
    // Calculate all times between start and end
    const startIndex = timeSlots.indexOf(dragStartTime!);
    const endIndex = timeSlots.indexOf(time);
    
    if (startIndex !== -1 && endIndex !== -1) {
      const start = Math.min(startIndex, endIndex);
      const end = Math.max(startIndex, endIndex);
      
      // Get all times in the range
      const selectedRange = timeSlots.slice(start, end + 1);
      setSelectedTimes(selectedRange);
    }
  };

  const removeAvailability = (date: string, time: string) => {
    setAvailabilities(prev => prev.filter(slot => !(slot.date === date && slot.time === time)));
  };

  // Convert availability slots to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return dbAvailabilities.map(slot => ({
      id: String(slot.id), // Convert number to string if needed
      title: 'Available',
      start: parseISO(slot.start_time),
      end: parseISO(slot.end_time),
      resource: slot
    }));
  }, [dbAvailabilities]);

  // Validate propertyId is a UUID
  useEffect(() => {
    if (propertyId && !isValidUUID(propertyId)) {
      setError('Invalid property ID format. Expected UUID.');
    } else {
      setError('');
    }
  }, [propertyId]);

  // Fetch availability slots from Azure PostgreSQL
  const fetchAvailability = async () => {
    try {
      if (!propertyId || !isValidUUID(propertyId)) {
        throw new Error('Invalid property ID');
      }

      setIsLoading(true);
      const slots = await PropertyService.getPropertyAvailability(propertyId);
      setDbAvailabilities(slots);
      setError('');
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to fetch availability slots');
      toast.error('Failed to fetch availability slots');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  // Save changes to the database (with debounce)
  useEffect(() => {
    if (!user?.uid || !propertyId || isLoading) return;
    
    const saveAvailability = async () => {
      try {
        const groupedSlots = groupAdjacentTimeSlots(availabilities);
        
        const dbSlots: DbSlot[] = groupedSlots.map(group => ({
          start_time: createISOString(group.date, group.startTime),
          end_time: createISOString(group.date, group.endTime, true)
        }));
        
        await fetch(`http://localhost:8000/api/availability/property/${propertyId}`, {
          method: 'DELETE'
        });
        
        if (dbSlots.length > 0) {
          const response = await fetch('http://localhost:8000/api/availability', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              propertyId,
              sellerId: user?.uid,
              availabilitySlots: dbSlots
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          setShowSavedIndicator(true);
          setTimeout(() => setShowSavedIndicator(false), 2000);
        }
      } catch (err) {
        console.error('Error saving availability:', err);
        setError('Failed to save availability. Please try again.');
      }
    };
    
    const timeoutId = setTimeout(saveAvailability, 1000);
    return () => clearTimeout(timeoutId);
  }, [availabilities, propertyId, user?.uid, isLoading]);

  // Handle slot selection (for creating new availability)
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      const date = format(start, 'yyyy-MM-dd');
      const startTime = format(start, 'HH:mm');
      const endTime = format(end, 'HH:mm');
      
      // Add all 30-minute slots between start and end
      const newSlots: TimeSlot[] = [];
      let currentTime = new Date(start);
      
      while (currentTime < end) {
        const timeStr = format(currentTime, 'HH:mm');
        if (timeSlots.includes(timeStr)) {
          newSlots.push({
            date,
            time: timeStr
          });
        }
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
      
      setAvailabilities(prev => [...prev, ...newSlots]);
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
    [dbAvailabilities]
  );

  // Update the deleteAvailability function to use string ID
  const deleteAvailability = async (slotId: string) => {
    try {
      if (!propertyId || !isValidUUID(propertyId)) {
        throw new Error('Invalid property ID');
      }

      await PropertyService.deletePropertyAvailability(propertyId);
      await fetchAvailability();
      toast.success('Availability slot deleted successfully');
    } catch (err) {
      console.error('Error deleting availability:', err);
      toast.error('Failed to delete availability slot');
      throw err;
    }
  };

  // Save a new availability slot
  const saveAvailability = async (newSlot: Omit<DbAvailability, 'id'>) => {
    try {
      if (!propertyId || !isValidUUID(propertyId)) {
        throw new Error('Invalid property ID');
      }

      const input: AvailabilityInput = {
        start_time: parseISO(newSlot.start_time),
        end_time: parseISO(newSlot.end_time)
      };

      await PropertyService.createAvailability(propertyId, [input]);
      await fetchAvailability();
      toast.success('Availability slot added successfully');
    } catch (err) {
      console.error('Error saving availability:', err);
      toast.error('Failed to save availability slot');
      throw err;
    }
  };

  // Handle adding a new availability slot
  const handleAddAvailability = () => {
    const input: Omit<DbAvailability, 'id'> = {
      property_id: propertyId!,
      seller_id: user!.uid,
      start_time: format(newSlot.start, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      end_time: format(newSlot.end, "yyyy-MM-dd'T'HH:mm:ss'Z'")
    };
    
    saveAvailability(input);
    setShowAddModal(false);
  };

  const testEndpoint = async () => {
    if (!propertyId || !user?.uid) {
      setError('Error: Missing propertyId or user');
      return;
    }

    if (!isValidUUID(propertyId)) {
      setError('Error: Invalid UUID format for property ID');
      return;
    }

    try {
      const endpoint = `http://localhost:8000/api/availability/property/${propertyId}`;
      console.log('Testing endpoint:', endpoint);
      console.log('Property ID (UUID):', propertyId);
      console.log('User ID:', user.uid);
      
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
      setError(`Success! Status: ${response.status}. Found ${data.length || 0} slots`);
      
    } catch (error) {
      console.error('Test failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
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
      setError('Error: User not authenticated');
      return;
    }

    try {
      setError(`Checking seller ID for Firebase UID: ${user.uid}`);
      
      // First check localStorage for a saved seller ID
      const savedSellerId = localStorage.getItem('lastSellerId');
      if (savedSellerId) {
        setError(`Found seller ID in localStorage: ${savedSellerId}`);
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
            setError(`Found seller ID in property data: ${sellerId}`);
            return;
          }
          
          // Check if the property has a seller_id property
          if (propertyData.seller_id) {
            const sellerId = propertyData.seller_id;
            localStorage.setItem('lastSellerId', sellerId);
            setError(`Found seller ID in property data: ${sellerId}`);
            return;
          }
        }
      }
      
      // If we still don't have a seller ID, suggest creating one
      setError(`No seller ID found. Please click "Create Test Seller" to create a new seller.`);
    } catch (error) {
      console.error('Test failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Discover available endpoints
  const discoverEndpoints = async () => {
    setError('Discovering available endpoints...');
    
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
    
    setError(`Endpoint discovery results:\n${results.join('\n')}`);
  };

  // Create a test seller linked to the current user
  const createTestSeller = async () => {
    if (!user?.uid) {
      setError('Error: User not authenticated');
      return;
    }

    try {
      console.log('Creating test seller for Firebase UID:', user.uid);
      setError('Attempting to create a test seller...');
      
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
          
          setError(`Success! Property created with ID: ${data.property.id}.\nSeller ID: ${sellerId}\n\nYou can now add availability slots. The seller ID has been saved for future use.`);
          
          // Navigate to the property's availability page
          navigate(`/seller-dashboard/property/${data.property.id}/availability`);
          return;
        }
        
        // Check if we got a seller ID directly
        if (data.seller && data.seller.id) {
          const sellerId = data.seller.id;
          localStorage.setItem('lastSellerId', sellerId);
          
          setError(`Success! Seller created with ID: ${sellerId}`);
          return;
        }
        
        // If we got a property with a seller_id
        if (data.property) {
          console.log('Property created with ID:', data.property.id);
          
          // Check if the property has a seller_id
          if (data.property.seller_id) {
            const sellerId = data.property.seller_id;
            localStorage.setItem('lastSellerId', sellerId);
            
            setError(`Success! Property created with ID: ${data.property.id}.\nSeller ID: ${sellerId}\n\nYou can now add availability slots.`);
            
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
              
              setError(`Success! Property created with ID: ${data.property.id}.\nSeller ID: ${sellerId}\n\nYou can now add availability slots.`);
              navigate(`/seller-dashboard/property/${data.property.id}/availability`);
              return;
            }
            
            if (propertyData.seller_id) {
              const sellerId = propertyData.seller_id;
              localStorage.setItem('lastSellerId', sellerId);
              
              setError(`Success! Property created with ID: ${data.property.id}.\nSeller ID: ${sellerId}\n\nYou can now add availability slots.`);
              navigate(`/seller-dashboard/property/${data.property.id}/availability`);
              return;
            }
          }
          
          // If we still don't have a seller_id, inform the user
          setError(`Property created with ID: ${data.property.id}, but no seller ID was found.\n\nWhen adding availability, we'll try to use your Firebase UID (${user.uid}) directly.`);
          navigate(`/seller-dashboard/property/${data.property.id}/availability`);
        } else {
          setError(`Response did not contain property or seller data. Check the console for details.`);
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError(`Invalid response from server: ${text}`);
      }
    } catch (error) {
      console.error('Failed to create test seller:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Failed to create test seller'}`);
    }
  };

  // Add this function near your other test functions
  const viewAllSlots = async () => {
    if (!propertyId || !user?.uid) {
      setError('Error: Missing propertyId or user');
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
      setError(`Found ${data.length} availability slots in database:\n${JSON.stringify(formattedSlots, null, 2)}`);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addRegularAvailability = () => {
    if (!regularDay || !regularStartTime || !regularEndTime) return;
    
    const startIndex = getTimeIndex(regularStartTime);
    const endIndex = getTimeIndex(regularEndTime);
    
    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      console.error("Invalid time range");
      return;
    }
    
    // Get all times in the range
    const selectedTimeRange = timeSlots.slice(startIndex, endIndex + 1);
    
    // Generate the dates for the selected day of week for the next N weeks
    const newAvailabilities: TimeSlot[] = [];
    const today = new Date();
    
    for (let week = 0; week < regularWeeks; week++) {
      // Find the date of the next occurrence of the selected day
      const date = new Date(today);
      date.setDate(today.getDate() + ((regularDay + 7 - today.getDay()) % 7) + (week * 7));
      
      const formattedDate = date.toISOString().split('T')[0];
      
      // Add each time slot for this date
      selectedTimeRange.forEach(time => {
        // Check if this slot already exists
        const alreadyExists = availabilities.some(
          slot => slot.date === formattedDate && slot.time === time
        );
        
        if (!alreadyExists) {
          newAvailabilities.push({
            date: formattedDate,
            time
          });
        }
      });
    }
    
    // Add all new availabilities
    if (newAvailabilities.length > 0) {
      setAvailabilities(prev => [...prev, ...newAvailabilities]);
    }
    
    // Reset form
    setShowRegularForm(false);
    setRegularDay(null);
    setRegularStartTime('');
    setRegularEndTime('');
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
            onClick={testEndpoint}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test API Connection
          </button>
          <button 
            onClick={viewAllSlots}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
          >
            View All Slots
          </button>
        </div>
      </div>
      
      {error && (
        <div className={`mb-4 p-4 rounded ${
          error.startsWith('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {error.includes('\n') ? (
            <div>
              <p className="font-semibold mb-2">{error.split('\n')[0]}</p>
              <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-2 rounded">
                {error.split('\n').slice(1).join('\n')}
              </pre>
            </div>
          ) : (
            error
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar and time selection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <span className="font-semibold">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center p-2 text-sm font-medium">
                {day}
              </div>
            ))}
            {generateCalendarDays().map((day, index) => (
              <button
                key={index}
                onClick={() => day && day > 0 && handleDateSelect(day)}
                disabled={!day || day < 0}
                className={`
                  p-2 text-center rounded
                  ${!day ? 'bg-transparent' : day < 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}
                  ${selectedDate === (day && day > 0 ? formatDate(day) : '') ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                `}
              >
                {day ? Math.abs(day) : ''}
              </button>
            ))}
          </div>
          
          <h4 className="font-medium mb-2">Select Times <span className="text-sm text-gray-500">(drag to select multiple)</span></h4>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Morning column */}
            <div>
              <h5 className="text-center mb-2 font-medium text-sm bg-green-50 p-1 rounded">Morning</h5>
              <div className="space-y-1">
                {timeSlots.filter(time => {
                  const hour = parseInt(time.split(':')[0]);
                  return hour >= 8 && hour < 12;
                }).map(time => (
                  <button
                    key={time}
                    onClick={() => handleTimeToggle(time)}
                    onMouseDown={() => {
                      if (!selectedDate) return;
                      setDragStartTime(time);
                    }}
                    onMouseEnter={() => {
                      if (dragStartTime && !isDragging) {
                        setIsDragging(true);
                        setSelectedTimes([dragStartTime]);
                      }
                      
                      if (isDragging) {
                        handleDragEnter(time);
                      }
                    }}
                    disabled={!selectedDate}
                    className={`
                      w-full p-2 rounded text-sm select-none
                      ${selectedTimes.includes(time) ? 'bg-green-500 text-white' : 'bg-gray-100'}
                      ${!selectedDate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-100'}
                      ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}
                      ${availabilities.some(slot => slot.date === selectedDate && slot.time === time) ? 'bg-green-500 text-white' : ''}
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Afternoon column */}
            <div>
              <h5 className="text-center mb-2 font-medium text-sm bg-green-50 p-1 rounded">Afternoon</h5>
              <div className="space-y-1">
                {timeSlots.filter(time => {
                  const hour = parseInt(time.split(':')[0]);
                  return hour >= 12 && hour < 17;
                }).map(time => (
                  <button
                    key={time}
                    onClick={() => handleTimeToggle(time)}
                    onMouseDown={() => {
                      if (!selectedDate) return;
                      setDragStartTime(time);
                    }}
                    onMouseEnter={() => {
                      if (dragStartTime && !isDragging) {
                        setIsDragging(true);
                        setSelectedTimes([dragStartTime]);
                      }
                      
                      if (isDragging) {
                        handleDragEnter(time);
                      }
                    }}
                    disabled={!selectedDate}
                    className={`
                      w-full p-2 rounded text-sm select-none
                      ${selectedTimes.includes(time) ? 'bg-green-500 text-white' : 'bg-gray-100'}
                      ${!selectedDate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-100'}
                      ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}
                      ${availabilities.some(slot => slot.date === selectedDate && slot.time === time) ? 'bg-green-500 text-white' : ''}
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Evening column */}
            <div>
              <h5 className="text-center mb-2 font-medium text-sm bg-green-50 p-1 rounded">Evening</h5>
              <div className="space-y-1">
                {timeSlots.filter(time => {
                  const hour = parseInt(time.split(':')[0]);
                  return hour >= 17;
                }).map(time => (
                  <button
                    key={time}
                    onClick={() => handleTimeToggle(time)}
                    onMouseDown={() => {
                      if (!selectedDate) return;
                      setDragStartTime(time);
                    }}
                    onMouseEnter={() => {
                      if (dragStartTime && !isDragging) {
                        setIsDragging(true);
                        setSelectedTimes([dragStartTime]);
                      }
                      
                      if (isDragging) {
                        handleDragEnter(time);
                      }
                    }}
                    disabled={!selectedDate}
                    className={`
                      w-full p-2 rounded text-sm select-none
                      ${selectedTimes.includes(time) ? 'bg-green-500 text-white' : 'bg-gray-100'}
                      ${!selectedDate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-100'}
                      ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}
                      ${availabilities.some(slot => slot.date === selectedDate && slot.time === time) ? 'bg-green-500 text-white' : ''}
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowRegularForm(true)}
              className="text-green-600 font-medium text-sm hover:text-green-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Regular Availability
            </button>
          </div>
        </div>
        
        {/* Added availability list */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Your Available Slots</h3>
          {availabilities.length === 0 ? (
            <p className="text-gray-500">No availability added yet. Select a date and time to add slots.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {Object.entries(
                availabilities.reduce((acc, slot) => {
                  const date = slot.date;
                  if (!acc[date]) {
                    acc[date] = [];
                  }
                  acc[date].push(slot.time);
                  return acc;
                }, {} as Record<string, string[]>)
              ).map(([date, times], dateIndex) => (
                <div key={dateIndex} className="border border-gray-200 rounded-lg p-3 mb-2">
                  <div className="font-medium mb-2">
                    {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {times.sort().map((time, timeIndex) => (
                      <div key={timeIndex} className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded">
                        {time}
                        <button 
                          onClick={() => removeAvailability(date, time)}
                          className="ml-1 text-green-500 hover:text-green-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 h-6">
            {showSavedIndicator && (
              <div className="text-sm text-green-600 italic text-center fade-out">
                ✓ Changes saved
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Regular availability popup */}
      {showRegularForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Add Regular Availability</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set up a recurring availability pattern for specific days of the week.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Day of the Week</label>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <button
                    key={day}
                    onClick={() => setRegularDay(index)}
                    className={`
                      p-2 text-center rounded text-sm
                      ${regularDay === index ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <select 
                  value={regularStartTime} 
                  onChange={(e) => setRegularStartTime(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <select 
                  value={regularEndTime} 
                  onChange={(e) => setRegularEndTime(e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={!regularStartTime}
                >
                  <option value="">Select time</option>
                  {timeSlots
                    .filter(time => {
                      if (!regularStartTime) return true;
                      return getTimeIndex(time) >= getTimeIndex(regularStartTime);
                    })
                    .map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Number of weeks to schedule: {regularWeeks}
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={regularWeeks}
                onChange={(e) => setRegularWeeks(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 week</span>
                <span>12 weeks</span>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowRegularForm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addRegularAvailability}
                disabled={!regularDay || !regularStartTime || !regularEndTime}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Add Regular Availability
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .fade-out {
          animation: fadeOut 1.5s ease-out 0.5s forwards;
        }
      `}</style>
    </div>
  );
};

export default AvailabilitySection; 