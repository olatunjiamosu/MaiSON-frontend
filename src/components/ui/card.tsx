import React from 'react';

export const Card: React.FC<{ className?: string }> = ({ className, children }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ className?: string }> = ({ className, children }) => {
  return (
    <div className={`border-b mb-2 pb-2 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ className?: string }> = ({ className, children }) => {
  return (
    <div className={`text-gray-700 ${className}`}>
      {children}
    </div>
  );
};