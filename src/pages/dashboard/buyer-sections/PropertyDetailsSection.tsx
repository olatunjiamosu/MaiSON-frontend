import React from 'react';
import { PropertyDetail } from '../../../types/property';
import PropertyDetailsView from '../../../components/property/PropertyDetailsView';
import { useNavigate } from 'react-router-dom';

interface PropertyDetailsSectionProps {
  property?: PropertyDetail;
}

const PropertyDetailsSection: React.FC<PropertyDetailsSectionProps> = ({ property }) => {
  const navigate = useNavigate();

  const handleMakeOffer = () => {
    if (property) {
      navigate(`/dashboard/buyer/property/${property.id}/make-offer`);
    }
  };

  const handleScheduleViewing = () => {
    if (property) {
      navigate(`/dashboard/buyer/property/${property.id}/schedule-viewing`);
    }
  };

  return (
    <PropertyDetailsView
      property={property}
      viewMode="buyer"
      onMakeOffer={handleMakeOffer}
      onScheduleViewing={handleScheduleViewing}
    />
  );
};

export default PropertyDetailsSection; 