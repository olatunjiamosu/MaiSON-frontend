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
    buyer_id: 'test-user-id',
    seller_id: 'seller123',
    current_offer: 450000,
    status: 'pending',
    last_offer_by: 'test-user-id',
    awaiting_response_from: 'seller123',
    created_at: '2024-03-20T12:00:00Z',
    updated_at: '2024-03-20T12:00:00Z',
    last_updated: '2024-03-20T12:00:00Z',
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
    localStorage.clear();
  });

  test('renders property details correctly', () => {
    renderWithRouter(<PropertyCard {...mockProperty} negotiations={mockNegotiations} />);

    expect(screen.getByText('£500,000')).toBeInTheDocument();
    expect(screen.getByText(mockProperty.address.street)).toBeInTheDocument();
    expect(screen.getByText(`${mockProperty.specs.bedrooms} Bed`)).toBeInTheDocument();
    expect(screen.getByText('1,200 sq ft')).toBeInTheDocument();
  });

  test('handles save button click with custom handler', async () => {
    const handleToggleSave = jest.fn().mockResolvedValue({});
    
    renderWithRouter(
      <PropertyCard 
        {...mockProperty} 
        onToggleSave={handleToggleSave} 
        isSaved={false} 
        negotiations={mockNegotiations}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save property/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(handleToggleSave).toHaveBeenCalledWith(mockProperty.id);
      expect(mockToastSuccess).toHaveBeenCalled();
    });
  });

  test('uses PropertyService when no custom handler is provided', async () => {
    renderWithRouter(<PropertyCard {...mockProperty} isSaved={false} negotiations={mockNegotiations} />);
    
    const saveButton = screen.getByRole('button', { name: /save property/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockSaveProperty).toHaveBeenCalledWith(mockProperty.id);
      expect(mockToastSuccess).toHaveBeenCalled();
    });
  });

  test('handles missing image with placeholder', () => {
    renderWithRouter(
      <PropertyCard 
        {...mockProperty} 
        main_image_url={undefined} 
        negotiations={mockNegotiations}
      />
    );
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/placeholder-property.jpg');
  });

  test('displays correct UI for saved and unsaved states', () => {
    const { rerender } = renderWithRouter(
      <PropertyCard {...mockProperty} isSaved={false} negotiations={mockNegotiations} />
    );
    
    expect(screen.getByRole('button', { name: /save property/i }))
      .toHaveAttribute('aria-label', 'Save property');
    
    rerender(
      <MemoryRouter>
        <PropertyCard {...mockProperty} isSaved={true} negotiations={mockNegotiations} />
      </MemoryRouter>
    );
    
    expect(screen.getByRole('button', { name: /unsave property/i }))
      .toHaveAttribute('aria-label', 'Unsave property');
  });

  test('navigates to property details page when clicked', () => {
    renderWithRouter(<PropertyCard {...mockProperty} negotiations={mockNegotiations} />);
    
    // Click on the property card itself to navigate
    const propertyCard = screen.getByRole('img', { name: /test road, test city/i });
    fireEvent.click(propertyCard);
    
    expect(mockNavigate).toHaveBeenCalledWith(`/property/${mockProperty.id}`, expect.anything());
  });

  test('displays chat button when seller_id is provided', () => {
    renderWithRouter(<PropertyCard {...mockProperty} negotiations={mockNegotiations} />);
    
    expect(screen.getByText('Chat with Mia about this property')).toBeInTheDocument();
  });

  test('does not display chat button when seller_id is not provided', () => {
    const propertyWithoutSeller = { ...mockProperty, seller_id: undefined };
    renderWithRouter(<PropertyCard {...propertyWithoutSeller} negotiations={mockNegotiations} />);
    
    expect(screen.queryByText('Chat with Mia about this property')).not.toBeInTheDocument();
  });

  test('initiates property chat when chat button is clicked', async () => {
    renderWithRouter(<PropertyCard {...mockProperty} negotiations={mockNegotiations} />);
    
    const chatButton = screen.getByText('Chat with Mia about this property');
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(mockInitiatePropertyChat).toHaveBeenCalledWith(
        mockProperty.id, 
        mockProperty.seller_id, 
        expect.stringContaining(`I'm interested in this property at ${mockProperty.address.street}`)
      );
      expect(mockToastSuccess).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/buyer-dashboard/property-chats');
    });
  });

  test('redirects to existing chat if conversation ID exists and is verified', async () => {
    localStorage.setItem(`property_chat_conversation_${mockProperty.id}`, '456');
    mockVerifyConversationExists.mockResolvedValueOnce(true);
    
    renderWithRouter(<PropertyCard {...mockProperty} negotiations={mockNegotiations} />);
    
    const chatButton = screen.getByText('Chat with Mia about this property');
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(mockVerifyConversationExists).toHaveBeenCalledWith(456, true);
      expect(mockInitiatePropertyChat).not.toHaveBeenCalled();
      expect(localStorage.getItem('last_property_chat_id')).toBe('456');
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Redirecting to existing chat...', 
        expect.anything()
      );
      expect(mockNavigate).toHaveBeenCalledWith('/buyer-dashboard/property-chats');
    });
  });
  
  test('creates new chat if conversation ID exists but is not verified', async () => {
    localStorage.setItem(`property_chat_conversation_${mockProperty.id}`, '456');
    mockVerifyConversationExists.mockResolvedValueOnce(false);
    
    renderWithRouter(<PropertyCard {...mockProperty} negotiations={mockNegotiations} />);
    
    const chatButton = screen.getByText('Chat with Mia about this property');
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(mockVerifyConversationExists).toHaveBeenCalledWith(456, true);
      expect(mockInitiatePropertyChat).toHaveBeenCalledWith(
        mockProperty.id, 
        mockProperty.seller_id, 
        expect.stringContaining(`I'm interested in this property at ${mockProperty.address.street}`)
      );
      expect(localStorage.getItem(`property_chat_conversation_${mockProperty.id}`)).toBe('123');
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Chat started! Redirecting to chat window...', 
        expect.anything()
      );
      expect(mockNavigate).toHaveBeenCalledWith('/buyer-dashboard/property-chats');
    });
  });
}); 