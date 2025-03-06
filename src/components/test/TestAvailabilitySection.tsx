import React, { useState, useCallback } from 'react';
import { format, parseISO, addHours } from 'date-fns';

// TEST MODE: This interface mimics what we expect from the real database
interface TestAvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

const TestAvailabilitySection: React.FC = () => {
  // TEST MODE: Using local state to mimic database storage
  // INTEGRATION: Replace this with API calls to your actual database
  const [availabilitySlots, setAvailabilitySlots] = useState<TestAvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // TEST MODE: Hardcoded time slots
  // INTEGRATION: These could come from your backend configuration
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  // TEST MODE: Local save function
  // INTEGRATION: Replace with your API call to save availability
  const saveAvailability = (slot: TestAvailabilitySlot) => {
    setAvailabilitySlots(prev => [...prev, {
      ...slot,
      id: Math.random().toString(36).substr(2, 9) // TEST MODE: Generate random ID
      // INTEGRATION: Your backend should provide the real ID
    }]);
  };

  // TEST MODE: Local delete function
  // INTEGRATION: Replace with your API call to delete availability
  const deleteAvailability = (slotId: string) => {
    setAvailabilitySlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  // TEST MODE: Local handler for time slot selection
  // INTEGRATION: This logic can stay mostly the same, just update the save/delete calls
  const handleTimeSlotClick = (time: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingSlot = availabilitySlots.find(
      slot => slot.date === dateStr && slot.startTime === time
    );

    if (existingSlot) {
      deleteAvailability(existingSlot.id);
    } else {
      saveAvailability({
        id: '', // Will be set in saveAvailability
        date: dateStr,
        startTime: time,
        endTime: format(addHours(parseISO(`${dateStr}T${time}`), 1), 'HH:mm')
      });
    }
  };

  // TEST MODE: Helper to check if a slot is selected
  // INTEGRATION: This logic can stay the same
  const isTimeSlotSelected = (time: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return availabilitySlots.some(
      slot => slot.date === dateStr && slot.startTime === time
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Test Mode Availability Calendar</h2>
        <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
          This is a test version using local state. 
          Check the code comments for integration points.
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}
          className="px-3 py-1 bg-gray-100 rounded"
        >
          Previous
        </button>
        <span className="font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}
          className="px-3 py-1 bg-gray-100 rounded"
        >
          Next
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Morning */}
        <div>
          <h3 className="font-medium mb-2 bg-green-50 p-1 rounded text-center">Morning</h3>
          <div className="space-y-1">
            {timeSlots.filter(time => parseInt(time) < 12).map(time => (
              <button
                key={time}
                onClick={() => handleTimeSlotClick(time)}
                className={`w-full p-2 rounded text-sm ${
                  isTimeSlotSelected(time)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Afternoon */}
        <div>
          <h3 className="font-medium mb-2 bg-green-50 p-1 rounded text-center">Afternoon</h3>
          <div className="space-y-1">
            {timeSlots.filter(time => {
              const hour = parseInt(time);
              return hour >= 12 && hour < 17;
            }).map(time => (
              <button
                key={time}
                onClick={() => handleTimeSlotClick(time)}
                className={`w-full p-2 rounded text-sm ${
                  isTimeSlotSelected(time)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Evening */}
        <div>
          <h3 className="font-medium mb-2 bg-green-50 p-1 rounded text-center">Evening</h3>
          <div className="space-y-1">
            {timeSlots.filter(time => parseInt(time) >= 17).map(time => (
              <button
                key={time}
                onClick={() => handleTimeSlotClick(time)}
                className={`w-full p-2 rounded text-sm ${
                  isTimeSlotSelected(time)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Selections */}
      <div className="mt-6">
        <h3 className="font-medium mb-2">Selected Time Slots:</h3>
        <div className="bg-gray-50 p-4 rounded">
          {availabilitySlots.length === 0 ? (
            <p className="text-gray-500">No slots selected</p>
          ) : (
            <div className="space-y-2">
              {availabilitySlots.map(slot => (
                <div 
                  key={slot.id}
                  className="flex justify-between items-center bg-white p-2 rounded shadow-sm"
                >
                  <span>
                    {slot.date} at {slot.startTime} - {slot.endTime}
                  </span>
                  <button
                    onClick={() => deleteAvailability(slot.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Integration Notes */}
      <div className="mt-6 bg-blue-50 p-4 rounded">
        <h3 className="font-medium mb-2">Integration Notes:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Replace useState with API calls to your database</li>
          <li>Implement proper error handling for API calls</li>
          <li>Add loading states during API operations</li>
          <li>Consider adding validation for overlapping time slots</li>
          <li>Add proper date range restrictions if needed</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAvailabilitySection; 