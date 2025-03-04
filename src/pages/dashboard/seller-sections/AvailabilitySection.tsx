import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parse, addDays, isBefore, isAfter, addWeeks } from 'date-fns';
import { Plus, Trash2, Clock, Calendar as CalendarIcon, Repeat, AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

// Custom CSS to override react-calendar styles
const calendarStyles = `
  .react-calendar__tile--active {
    background: #10b981 !important;
    color: white !important;
  }
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: #059669 !important;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #f0fdf4 !important;
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #d1fae5 !important;
  }
`;

// Define types for availability
interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "11:00"
}

interface AvailabilityDate {
  date: Date;
  timeSlots: TimeSlot[];
}

// Interface for serialized data (for localStorage)
interface SerializedAvailabilityDate {
  date: string; // ISO string
  timeSlots: TimeSlot[];
}

// Define recurring pattern types
interface RecurringPattern {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  occurrences: number; // Number of times to repeat
}

// Predefined time slots for easier selection
const PREDEFINED_TIME_SLOTS: TimeSlot[] = [
  { start: '09:00', end: '11:00' },
  { start: '11:00', end: '13:00' },
  { start: '13:00', end: '15:00' },
  { start: '15:00', end: '17:00' },
  { start: '17:00', end: '19:00' },
  { start: '19:00', end: '21:00' },
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STORAGE_KEY = 'seller_availability';

const AvailabilitySection: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availabilityDates, setAvailabilityDates] = useState<AvailabilityDate[]>([]);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({ start: '09:00', end: '11:00' });
  const [customTimeSlot, setCustomTimeSlot] = useState(false);
  const [timeSlotError, setTimeSlotError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for recurring availability
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    enabled: false,
    frequency: 'weekly',
    daysOfWeek: [],
    occurrences: 4
  });

  // Load availability data from localStorage on component mount
  useEffect(() => {
    const loadAvailabilityData = () => {
      try {
        if (!user?.uid) return;
        
        const storageKey = `${STORAGE_KEY}_${user.uid}`;
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          const parsed = JSON.parse(savedData) as SerializedAvailabilityDate[];
          
          // Convert serialized dates back to Date objects
          const deserialized: AvailabilityDate[] = parsed.map(item => ({
            date: new Date(item.date),
            timeSlots: item.timeSlots
          }));
          
          setAvailabilityDates(deserialized);
          console.log('Loaded availability data from localStorage');
        }
      } catch (error) {
        console.error('Error loading availability data:', error);
      }
    };
    
    loadAvailabilityData();
  }, [user]);

  // Save availability data to localStorage whenever it changes
  useEffect(() => {
    const saveToLocalStorage = () => {
      try {
        if (!user?.uid) return;
        
        // Skip initial save when the component mounts
        if (availabilityDates.length === 0) return;
        
        const storageKey = `${STORAGE_KEY}_${user.uid}`;
        
        // Serialize Date objects to strings
        const serialized: SerializedAvailabilityDate[] = availabilityDates.map(item => ({
          date: item.date.toISOString(),
          timeSlots: item.timeSlots
        }));
        
        localStorage.setItem(storageKey, JSON.stringify(serialized));
        console.log('Saved availability data to localStorage');
      } catch (error) {
        console.error('Error saving availability data:', error);
      }
    };
    
    saveToLocalStorage();
  }, [availabilityDates, user]);

  // Handle calendar date change
  const handleDateChange = (value: any) => {
    // If it's a single date, use it directly
    if (value instanceof Date) {
      setSelectedDate(value);
      // Reset recurring pattern when a new date is selected
      setRecurringPattern({
        enabled: false,
        frequency: 'weekly',
        daysOfWeek: [],
        occurrences: 4
      });
    }
  };

  // Get available time slots for a specific date
  const getTimeSlotsForDate = (date: Date): TimeSlot[] => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const dateEntry = availabilityDates.find(
      (d) => format(d.date, 'yyyy-MM-dd') === formattedDate
    );
    return dateEntry?.timeSlots || [];
  };

  // Check if a date has time slots
  const hasTimeSlots = (date: Date): boolean => {
    return getTimeSlotsForDate(date).length > 0;
  };
  
  // Validate time slot
  const validateTimeSlot = (slot: TimeSlot): boolean => {
    // Check if end time is after start time
    if (slot.end <= slot.start) {
      setTimeSlotError('End time must be after start time');
      return false;
    }
    
    setTimeSlotError(null);
    return true;
  };

  // Add a time slot to a specific date
  const addTimeSlotToDate = (date: Date, slot: TimeSlot) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const existingDateIndex = availabilityDates.findIndex(
      (d) => format(d.date, 'yyyy-MM-dd') === formattedDate
    );

    const updatedDates = [...availabilityDates];
    
    if (existingDateIndex >= 0) {
      // Check for overlapping time slots
      const existingSlots = updatedDates[existingDateIndex].timeSlots;
      const overlapping = existingSlots.some(
        existingSlot => 
          (slot.start >= existingSlot.start && slot.start < existingSlot.end) ||
          (slot.end > existingSlot.start && slot.end <= existingSlot.end) ||
          (slot.start <= existingSlot.start && slot.end >= existingSlot.end)
      );
      
      if (overlapping) {
        setTimeSlotError('This time slot overlaps with an existing slot');
        return false;
      }
      
      // Add time slot to existing date
      updatedDates[existingDateIndex].timeSlots.push({ ...slot });
      // Sort time slots by start time
      updatedDates[existingDateIndex].timeSlots.sort((a, b) => a.start.localeCompare(b.start));
    } else {
      // Create new date entry with time slot
      updatedDates.push({
        date: new Date(date),
        timeSlots: [{ ...slot }],
      });
    }
    
    setAvailabilityDates(updatedDates);
    return true;
  };

  // Add a new time slot to the selected date (and recurring dates if enabled)
  const addTimeSlot = () => {
    if (!selectedDate) return;
    
    // Validate time slot
    if (!validateTimeSlot(newTimeSlot)) {
      return;
    }
    
    // If recurring is enabled, add to multiple dates
    if (recurringPattern.enabled) {
      const addedSuccessfully = createRecurringAvailability();
      if (addedSuccessfully) {
        setShowTimeSlotModal(false);
      }
    } else {
      // Just add to the selected date
      const addedSuccessfully = addTimeSlotToDate(selectedDate, newTimeSlot);
      if (addedSuccessfully) {
        setShowTimeSlotModal(false);
      }
    }
  };
  
  // Create recurring availability based on the pattern
  const createRecurringAvailability = (): boolean => {
    if (!selectedDate) return false;
    
    try {
      const dayOfWeek = selectedDate.getDay();
      let currentDate = new Date(selectedDate);
      let successCount = 0;
      
      // Add the first occurrence
      if (addTimeSlotToDate(currentDate, newTimeSlot)) {
        successCount++;
      }
      
      // Handle weekly pattern
      if (recurringPattern.frequency === 'weekly') {
        for (let i = 1; i < recurringPattern.occurrences; i++) {
          currentDate = addWeeks(currentDate, 1);
          if (addTimeSlotToDate(currentDate, newTimeSlot)) {
            successCount++;
          }
        }
      }
      // Handle daily pattern
      else if (recurringPattern.frequency === 'daily') {
        for (let i = 1; i < recurringPattern.occurrences; i++) {
          currentDate = addDays(currentDate, 1);
          if (addTimeSlotToDate(currentDate, newTimeSlot)) {
            successCount++;
          }
        }
      }
      // Handle custom (specific days of week)
      else if (recurringPattern.frequency === 'custom' && recurringPattern.daysOfWeek.length > 0) {
        // Sort the days of week to process them in order
        const sortedDays = [...recurringPattern.daysOfWeek].sort((a, b) => a - b);
        
        let weeksAdded = 0;
        let slotsAdded = 1; // Count the initially added slot
        
        while (slotsAdded < recurringPattern.occurrences && weeksAdded < 12) { // Limit to 12 weeks
          weeksAdded++;
          for (const day of sortedDays) {
            if (day === dayOfWeek) continue; // Skip the original day
            
            // Calculate days to add to get to the target day
            let daysToAdd = day - dayOfWeek;
            if (daysToAdd <= 0) daysToAdd += 7; // Wrap around to next week
            
            const targetDate = addDays(new Date(selectedDate), daysToAdd + (7 * (weeksAdded - 1)));
            
            if (addTimeSlotToDate(targetDate, newTimeSlot)) {
              successCount++;
              slotsAdded++;
              
              if (slotsAdded >= recurringPattern.occurrences) {
                break;
              }
            }
          }
        }
      }
      
      return successCount > 0;
    } catch (error) {
      console.error('Error creating recurring availability:', error);
      setTimeSlotError('Failed to create recurring availability');
      return false;
    }
  };

  // Remove a time slot from a date
  const removeTimeSlot = (date: Date, index: number) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const dateIndex = availabilityDates.findIndex(
      (d) => format(d.date, 'yyyy-MM-dd') === formattedDate
    );

    if (dateIndex >= 0) {
      const updatedDates = [...availabilityDates];
      updatedDates[dateIndex].timeSlots.splice(index, 1);

      // If no time slots left, remove the entire date
      if (updatedDates[dateIndex].timeSlots.length === 0) {
        updatedDates.splice(dateIndex, 1);
      }

      setAvailabilityDates(updatedDates);
    }
  };

  // Clear all availability data
  const clearAllAvailability = () => {
    if (window.confirm('Are you sure you want to clear all your availability?')) {
      setAvailabilityDates([]);
      
      // Also clear localStorage
      if (user?.uid) {
        const storageKey = `${STORAGE_KEY}_${user.uid}`;
        localStorage.removeItem(storageKey);
      }
    }
  };

  // Save all availability data (this would connect to an API in the future)
  const saveAvailability = async () => {
    try {
      setIsSaving(true);
      
      // For now, just log the data that would be sent to an API
      console.log('Saving availability data:', availabilityDates);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In the future, this would be an API call:
      // await availabilityService.saveAvailability(availabilityDates);
      
      setIsSaving(false);
      alert('Availability saved successfully!');
    } catch (error) {
      console.error('Error saving availability:', error);
      setIsSaving(false);
      alert('Failed to save availability. Please try again.');
    }
  };
  
  // Select a predefined time slot
  const selectPredefinedTimeSlot = (slot: TimeSlot) => {
    setNewTimeSlot(slot);
    setCustomTimeSlot(false);
    setTimeSlotError(null);
  };
  
  // Toggle a day of week for custom recurring pattern
  const toggleDayOfWeek = (day: number) => {
    const updatedDays = [...recurringPattern.daysOfWeek];
    const index = updatedDays.indexOf(day);
    
    if (index >= 0) {
      updatedDays.splice(index, 1);
    } else {
      updatedDays.push(day);
    }
    
    setRecurringPattern({
      ...recurringPattern,
      daysOfWeek: updatedDays
    });
  };

  // Custom tile content to show indicator for dates with availability
  const tileContent = ({ date }: { date: Date }) => {
    return hasTimeSlots(date) ? (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="h-1 w-1 bg-emerald-500 rounded-full"></div>
      </div>
    ) : null;
  };

  return (
    <div className="space-y-6">
      {/* Add the custom styles for the calendar */}
      <style>{calendarStyles}</style>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Availability</h1>
        <div className="space-x-2">
          {availabilityDates.length > 0 && (
            <button 
              onClick={clearAllAvailability}
              className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition"
            >
              Clear All
            </button>
          )}
          <button 
            onClick={saveAvailability}
            disabled={isSaving}
            className={`px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition flex items-center ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Availability'
            )}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Column */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-emerald-600" />
            Select Dates
          </h2>
          <p className="text-gray-500 mb-4">
            Select dates when you're available for property viewings.
          </p>
          
          <div className="calendar-container mb-4">
            <Calendar 
              onChange={handleDateChange}
              value={selectedDate}
              tileContent={tileContent}
              className="rounded border p-2 w-full"
              tileClassName="relative"
            />
          </div>
          
          {selectedDate && (
            <div className="mt-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <button
                  onClick={() => setShowTimeSlotModal(true)}
                  className="flex items-center text-sm text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Time Slot
                </button>
              </div>
              
              <div className="space-y-2">
                {getTimeSlotsForDate(selectedDate).length > 0 ? (
                  getTimeSlotsForDate(selectedDate).map((slot, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{slot.start} - {slot.end}</span>
                      </div>
                      <button
                        onClick={() => removeTimeSlot(selectedDate, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No time slots added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Summary Column */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-emerald-600" />
            Availability Summary
          </h2>
          <p className="text-gray-500 mb-4">
            Overview of all the dates and times you're available for viewings.
          </p>
          
          {availabilityDates.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {availabilityDates.sort((a, b) => a.date.getTime() - b.date.getTime()).map((dateEntry, dateIndex) => (
                <div key={dateIndex} className="border rounded-lg p-3">
                  <h3 className="font-medium text-lg mb-2">
                    {format(dateEntry.date, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <div className="space-y-2 pl-2">
                    {dateEntry.timeSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{slot.start} - {slot.end}</span>
                        </div>
                        <button
                          onClick={() => removeTimeSlot(dateEntry.date, slotIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-6 flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-2">No availability set</p>
                <p className="text-gray-500">
                  Select dates on the calendar and add time slots to create your availability schedule.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Time Slot Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-2">
              Add Time Slot for {format(selectedDate!, 'MMMM d, yyyy')}
            </h3>
            <p className="text-gray-500 mb-4">Select a time slot or create a custom one.</p>
            
            {/* Time Slot Selection */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Choose a time slot:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {PREDEFINED_TIME_SLOTS.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => selectPredefinedTimeSlot(slot)}
                    className={`p-2 rounded border ${
                      !customTimeSlot && 
                      newTimeSlot.start === slot.start && 
                      newTimeSlot.end === slot.end
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {slot.start} - {slot.end}
                  </button>
                ))}
                <button
                  onClick={() => setCustomTimeSlot(true)}
                  className={`p-2 rounded border ${
                    customTimeSlot
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Custom Time
                </button>
              </div>
              
              {customTimeSlot && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      id="start-time"
                      type="time"
                      value={newTimeSlot.start}
                      onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start: e.target.value })}
                      className="w-full p-2 border rounded focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      id="end-time"
                      type="time"
                      value={newTimeSlot.end}
                      onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end: e.target.value })}
                      className="w-full p-2 border rounded focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
              
              {timeSlotError && (
                <div className="mt-2 text-red-500 flex items-center text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {timeSlotError}
                </div>
              )}
            </div>
            
            {/* Recurring Options */}
            <div className="border-t pt-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Make this recurring?</h4>
                <button
                  onClick={() => setRecurringPattern({
                    ...recurringPattern,
                    enabled: !recurringPattern.enabled
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    recurringPattern.enabled ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      recurringPattern.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {recurringPattern.enabled && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setRecurringPattern({
                          ...recurringPattern,
                          frequency: 'daily'
                        })}
                        className={`px-3 py-1 rounded border ${
                          recurringPattern.frequency === 'daily'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        Daily
                      </button>
                      <button
                        onClick={() => setRecurringPattern({
                          ...recurringPattern,
                          frequency: 'weekly'
                        })}
                        className={`px-3 py-1 rounded border ${
                          recurringPattern.frequency === 'weekly'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        Weekly
                      </button>
                      <button
                        onClick={() => setRecurringPattern({
                          ...recurringPattern,
                          frequency: 'custom'
                        })}
                        className={`px-3 py-1 rounded border ${
                          recurringPattern.frequency === 'custom'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                  
                  {recurringPattern.frequency === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Repeat on these days:
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {DAYS_OF_WEEK.map((day, index) => (
                          <button
                            key={day}
                            onClick={() => toggleDayOfWeek(index)}
                            className={`px-2 py-1 rounded text-xs ${
                              recurringPattern.daysOfWeek.includes(index)
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of occurrences
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="12"
                      value={recurringPattern.occurrences}
                      onChange={(e) => setRecurringPattern({
                        ...recurringPattern,
                        occurrences: Math.max(2, Math.min(12, parseInt(e.target.value) || 2))
                      })}
                      className="w-full p-2 border rounded focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {recurringPattern.frequency === 'daily' 
                        ? `This will create ${recurringPattern.occurrences} daily occurrences` 
                        : recurringPattern.frequency === 'weekly'
                        ? `This will create ${recurringPattern.occurrences} weekly occurrences` 
                        : `This will create slots on selected days for ${recurringPattern.occurrences} occurrences`}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowTimeSlotModal(false)}
                className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addTimeSlot}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center"
              >
                <Check className="h-4 w-4 mr-1" /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilitySection; 