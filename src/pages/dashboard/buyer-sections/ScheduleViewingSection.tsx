import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, addMonths } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import 'react-day-picker/dist/style.css';

interface ScheduleViewingSectionProps {
  property?: {
    id: string;
    address: {
      street: string;
      city: string;
      postcode: string;
    };
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Availability {
  date: string;
  slots: TimeSlot[];
}

const ScheduleViewingSection: React.FC<ScheduleViewingSectionProps> = ({ property }) => {
  // Mock availability data - this would come from the backend
  const [availability] = useState<Availability[]>([
    {
      date: '2025-04-15',
      slots: [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: false },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
      ]
    },
    {
      date: '2025-04-16',
      slots: [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: true },
        { time: '14:00', available: false },
        { time: '15:00', available: true },
      ]
    },
    {
      date: '2025-04-17',
      slots: [
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: false },
      ]
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null); // Reset time when date changes
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both a date and time');
      return;
    }

    setIsSubmitting(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Viewing request submitted successfully!');
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      toast.error('Failed to submit viewing request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    console.log('Checking date:', dateStr);
    console.log('Available dates:', availability.map(d => d.date));
    const isAvailable = availability.some(day => {
      const matches = day.date === dateStr;
      console.log('Comparing:', day.date, 'with', dateStr, 'matches:', matches);
      return matches && day.slots.some(slot => slot.available);
    });
    console.log('Is available:', isAvailable);
    return isAvailable;
  };

  const getAvailableSlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    console.log('Getting slots for date:', dateStr);
    const day = availability.find(day => {
      const matches = day.date === dateStr;
      console.log('Comparing:', day.date, 'with', dateStr, 'matches:', matches);
      return matches;
    });
    console.log('Found day:', day);
    return day ? day.slots : [];
  };

  // Custom modifiers for the calendar
  const modifiers = {
    available: (date: Date) => {
      const isAvailable = isDateAvailable(date);
      console.log('Date:', date, 'isAvailable:', isAvailable);
      return isAvailable;
    },
  };

  const modifiersStyles = {
    available: {
      backgroundColor: '#f0fdf4',
      color: '#065f46',
    },
  };

  // Custom styles for the calendar
  const css = `
    .rdp {
      --rdp-cell-size: 40px;
      --rdp-accent-color: #10b981;
      --rdp-background-color: #f0fdf4;
      margin: 0;
    }
    .rdp-day_selected {
      background-color: var(--rdp-accent-color);
      color: white;
    }
    .rdp-day_selected:hover {
      background-color: #059669;
    }
    .rdp-day:hover:not([disabled]) {
      background-color: #d1fae5;
    }
    .rdp-day_today {
      font-weight: bold;
      color: var(--rdp-accent-color);
    }
  `;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Schedule a Viewing</h1>
        {property && (
          <div className="mt-2 flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.address.street}, {property.address.city}, {property.address.postcode}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Column */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-emerald-600" />
                Select a Date
              </h2>
              <p className="text-gray-500 mb-4">
                Choose a date when you'd like to view the property.
              </p>
              
              <style>{css}</style>
              
              <div className="calendar-container">
                <DayPicker
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  fromDate={new Date()}
                  toDate={addMonths(new Date(), 3)}
                  showOutsideDays
                  className="border rounded-lg p-3"
                />
              </div>

              {selectedDate && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <p className="text-emerald-800 font-medium">
                    Selected Date: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-emerald-600 text-sm mt-1">
                    {getAvailableSlots(selectedDate).filter(slot => slot.available).length} time slots available
                  </p>
                </div>
              )}
            </div>

            {/* Time Slots Column */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-emerald-600" />
                Available Time Slots
              </h2>
              <p className="text-gray-500 mb-4">
                Select a time slot for your viewing.
              </p>
              
              {selectedDate ? (
                <div className="space-y-4">
                  {getAvailableSlots(selectedDate).map((slot) => (
                    <div
                      key={slot.time}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedTime === slot.time
                          ? 'border-emerald-500 bg-emerald-50'
                          : slot.available
                          ? 'border-gray-200 hover:border-emerald-300'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                      }`}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="font-medium">{slot.time}</span>
                        </div>
                        {slot.available ? (
                          <Check className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a date first
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          {selectedDate && selectedTime && (
            <div className="mt-8">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Request Viewing'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleViewingSection; 