import ChatService from './ChatService';

// Mock the global fetch function
global.fetch = jest.fn();

describe('ChatService', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    ChatService.clearSession();
  });

  describe('sendMessage', () => {
    test('successfully sends a message and receives response', async () => {
      const mockResponse = {
        message: 'Hello! How can I help you today?',
        sessionId: '12345'
      };

      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const response = await ChatService.sendMessage('Hi');

      // Verify the response
      expect(response).toEqual(mockResponse);
      expect(ChatService.getSessionId()).toBe('12345');

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/v1\/chat\/message$/),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Hi',
            sessionId: null
          })
        }
      );
    });

    test('maintains session ID across multiple messages', async () => {
      const mockResponses = [
        { message: 'First response', sessionId: '12345' },
        { message: 'Second response', sessionId: '12345' }
      ];

      // Mock two successive successful responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses[0])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses[1])
        });

      // Send first message
      await ChatService.sendMessage('First message');
      expect(ChatService.getSessionId()).toBe('12345');

      // Send second message
      const secondResponse = await ChatService.sendMessage('Second message');
      
      // Verify second message was sent with the session ID
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringMatching(/\/api\/v1\/chat\/message$/),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Second message',
            sessionId: '12345'
          })
        }
      );

      expect(secondResponse).toEqual(mockResponses[1]);
    });

    test('handles API errors appropriately', async () => {
      // Mock failed fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      // Expect the sendMessage call to throw an error
      await expect(ChatService.sendMessage('Hi'))
        .rejects
        .toThrow('API error: 500');
    });

    test('handles network errors appropriately', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      // Expect the sendMessage call to throw an error
      await expect(ChatService.sendMessage('Hi'))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('session management', () => {
    test('clearSession removes the current session ID', async () => {
      const mockResponse = {
        message: 'Hello',
        sessionId: '12345'
      };

      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Send a message to get a session ID
      await ChatService.sendMessage('Hi');
      expect(ChatService.getSessionId()).toBe('12345');

      // Clear the session
      ChatService.clearSession();
      expect(ChatService.getSessionId()).toBeNull();
    });
  });
}); 