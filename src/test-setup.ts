import '@testing-library/jest-dom';
import type { Config } from '@jest/types';
import { expect } from '@jest/globals';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: Record<string, any>): R;
    }
  }
}
