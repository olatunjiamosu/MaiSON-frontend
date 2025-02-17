import React from 'react';

export const Button: React.FC<{
  onClick?: () => void;
  variant?: 'default' | 'outline';
  className?: string;
}> = ({ onClick, variant = 'default', className, children }) => {
  const baseStyle = 'px-4 py-2 rounded-lg transition-colors';
  const variantStyle = variant === 'outline' ? 'border border-gray-300 text-gray-700' : 'bg-emerald-600 text-white';

  return (
    <button onClick={onClick} className={`${baseStyle} ${variantStyle} ${className}`}>
      {children}
    </button>
  );
};