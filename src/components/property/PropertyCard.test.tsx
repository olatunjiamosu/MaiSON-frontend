// Mock external dependencies
const mockSaveProperty = jest.fn().mockResolvedValue({});
const mockUnsaveProperty = jest.fn().mockResolvedValue({});
const mockUpdateNotes = jest.fn().mockResolvedValue({});

jest.mock('../../services/PropertyService', () => ({
  __esModule: true,
  default: {
    saveProperty: mockSaveProperty,
    unsaveProperty: mockUnsaveProperty,
    updateSavedPropertyNotes: mockUpdateNotes
  }
}));

const mockInitiatePropertyChat = jest.fn().mockResolvedValue({ conversation_id: '123' });
const mockVerifyConversationExists = jest.fn().mockResolvedValue(true);
const mockGetChatHistory = jest.fn().mockResolvedValue([]);

jest.mock('../../services/ChatService', () => ({
  __esModule: true,
  default: {
    initiatePropertyChat: mockInitiatePropertyChat,
    verifyConversationExists: mockVerifyConversationExists,
    getChatHistory: mockGetChatHistory,
    getUserConversations: jest.fn().mockResolvedValue({
      general_conversations: [],
      property_conversations: []
    })
  }
}));

// Mock Firebase Auth
const mockCurrentUser = {
  uid: 'test-user-id',
  email: 'test@example.com'
};

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: mockCurrentUser
  }))
}));

// Mock AuthContext
const mockAuthContext = {
  user: mockCurrentUser,
  userRole: 'buyer',
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
  signInWithGoogle: jest.fn(),
  signup: jest.fn()
};

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  toast: {
    success: mockToastSuccess,
    error: mockToastError
  },
  success: mockToastSuccess,
  error: mockToastError
}));

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock Heart icon
jest.mock('lucide-react', () => ({
  Heart: () => <div data-testid="mock-heart-icon">Heart</div>,
  MessageCircle: () => <div data-testid="mock-message-icon">Message</div>,
  FileText: () => <div data-testid="mock-file-text-icon">FileText</div>,
  X: () => <div data-testid="mock-x-icon">X</div>
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import { PropertySummary } from '../../types/property';
import PropertyService from '../../services/PropertyService';

// Mock negotiations array
const mockNegotiations = [
  {
    negotiation_id: '1',
    property_id: '1',
    buyer_id: '1',
    seller_id: '2',
    current_offer: 250000,
    status: 'active' as const,
    last_offer_by: 'buyer',
    awaiting_response_from: 'seller',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    last_updated: '2024-01-01',
    transactions: [],
    transaction_history: []
  }
];

const mockProperty: PropertySummary = {
  id: '1',
  price: 500000,
  main_image_url: 'test-image.jpg',
  created_at: '2024-03-20T12:00:00Z',
  owner_id: 1,
  seller_id: 'seller123',
  address: {
    street: 'Test Road',
    city: 'Test City',
    postcode: 'TE1 1ST',
  },
  specs: {
    property_type: 'Semi-Detached',
    square_footage: 1200,
    bedrooms: 3,
    bathrooms: 2
  }
};

// Helper function to render with Router context
const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

describe('PropertyCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('navigates to property details page when clicked', () => {
    renderWithRouter(<PropertyCard {...mockProperty} negotiations={mockNegotiations} />);
    
    // Click on the property card itself to navigate
    const propertyCard = screen.getByRole('img', { name: /test road, test city/i });
    fireEvent.click(propertyCard);
    
    expect(mockNavigate).toHaveBeenCalledWith(`/property/${mockProperty.id}`, expect.anything());
  });
}); 