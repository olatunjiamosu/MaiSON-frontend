declare module '../../test-utils/test-utils' {
  import { RenderOptions, RenderResult } from '@testing-library/react';
  import { ReactElement } from 'react';

  export * from '@testing-library/react';
  
  export function render(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'queries'>
  ): RenderResult;
} 