import React from 'react';
import type { FC } from 'react';

// Create a simple mock component type
type IconProps = {
  className?: string;
  size?: number | string;
  'aria-label'?: string;
};

// Create a mock component factory
const createIconMock = (name: string): FC<IconProps> => {
  const Icon: FC<IconProps> = (props) => React.createElement('div', {
    'data-testid': `mock-${name.toLowerCase()}-icon`,
    ...props
  }, name);
  Icon.displayName = name;
  return Icon;
};

// Export mocked icons
export const Map = createIconMock('Map');
export const List = createIconMock('List');
export const Heart = createIconMock('Heart');
export const Filter = createIconMock('Filter');
export const Search = createIconMock('Search');
export const Send = createIconMock('Send');
export const X = createIconMock('X');
export const MessageCircle = createIconMock('MessageCircle'); 