import React from 'react';

export const Alert: React.FC<{ className?: string }> = ({ className, children }) => {
  return (
    <div className={`bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<{ className?: string }> = ({ className, children }) => {
  return (
    <p className={`text-sm ${className}`}>
      {children}
    </p>
  );
};