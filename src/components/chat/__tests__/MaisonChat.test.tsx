import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MaisonChat from '../MaisonChat';
import ChatService from '../../../services/ChatService';
import { render } from 'test-utils';

// Mock the ChatService
jest.mock('../../../services/ChatService');

describe('MaisonChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    render(<MaisonChat />);
  });

  it('renders the chat button when closed', () => {
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens the chat window when button is clicked', () => {
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText("Hi! I'm MaiSON, your AI assistant. How can I help you today?")).toBeInTheDocument();
  });

  it('shows initial greeting message', () => {
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText("Hi! I'm MaiSON, your AI assistant. How can I help you today?")).toBeInTheDocument();
  });

  it('sends message when user types and clicks send', async () => {
    const mockResponse = {
      message: 'I can help you with that!',
      session_id: '123',
      conversation_id: 1,
      intent: 'greeting',
      context: {}
    };
    (ChatService.sendMessage as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Open chat
    fireEvent.click(screen.getByRole('button'));
    
    // Type message
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'Hello');
    
    // Click send
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    // Check if message was sent
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    // Check if response was received
    await waitFor(() => {
      expect(screen.getByText('I can help you with that!')).toBeInTheDocument();
    });
  });

  it('shows loading state while waiting for response', async () => {
    (ChatService.sendMessage as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    fireEvent.click(screen.getByRole('button'));
    
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'Hello');
    
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('shows error message when API call fails', async () => {
    (ChatService.sendMessage as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    );

    fireEvent.click(screen.getByRole('button'));
    
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'Hello');
    
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Sorry, I encountered an error. Please try again.')
      ).toBeInTheDocument();
    });
  });

  it('sends message when Enter key is pressed', async () => {
    const mockResponse = {
      message: 'I can help you with that!',
      session_id: '123',
      conversation_id: 1,
      intent: 'greeting',
      context: {}
    };
    (ChatService.sendMessage as jest.Mock).mockResolvedValueOnce(mockResponse);

    fireEvent.click(screen.getByRole('button'));
    
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'Hello{enter}');

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('disables input and send button while loading', async () => {
    (ChatService.sendMessage as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    fireEvent.click(screen.getByRole('button'));
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });

    await userEvent.type(input, 'Hello');
    fireEvent.click(sendButton);

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  test('renders chat container', () => {
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
  });

  test('renders input field', () => {
    // First click to open chat
    const openButton = screen.getByRole('button');
    fireEvent.click(openButton);
    
    // Now we can check for the input
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  test('renders send button', () => {
    // First click to open chat
    const openButton = screen.getByRole('button');
    fireEvent.click(openButton);
    
    // Now we can check for the send button
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });
}); 