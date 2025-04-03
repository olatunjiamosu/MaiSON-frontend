import React from 'react';
import { PropertyDetail } from '../../../types/property';
import PropertyDetailsView from '../../../components/property/PropertyDetailsView';

interface MyPropertySectionProps {
  property?: PropertyDetail;
}

const MyPropertySection: React.FC<MyPropertySectionProps> = ({ property }) => {
  return (
    <PropertyDetailsView
      property={property}
      viewMode="seller"
    />
  );
};

export default MyPropertySection; 