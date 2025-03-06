import React from 'react';
import SellerAvailabilityCalendar from '../components/AvailabilityCalendar';

const TestCalendar = () => {
  // Your test IDs from the backend
  const testPropertyId = "41be6770-e51d-4478-858c-cd180a07f207";
  const testSellerId = "b621da8f-a21d-4d82-9e2c-f7594d35ecf1";

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test Availability Calendar</h1>
      <div className="bg-white rounded-lg shadow-lg">
        <SellerAvailabilityCalendar 
          propertyId={testPropertyId}
          sellerId={testSellerId}
        />
      </div>
    </div>
  );
};

export default TestCalendar; 