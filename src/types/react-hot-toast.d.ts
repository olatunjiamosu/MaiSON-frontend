declare module 'react-hot-toast' {
  export const toast: {
    (message: string): void;
    success(message: string, options?: any): void;
    error(message: string, options?: any): void;
    loading(message: string, options?: any): void;
    dismiss(toastId?: string): void;
  };
} 