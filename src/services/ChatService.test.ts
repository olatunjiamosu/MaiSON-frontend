import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ChatResponse } from '../types/chat';
import ChatService from './ChatService';

// Mock the ChatService module
jest.mock('./ChatService');

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ChatService.clearSession();
  });

  describe('sendMessage', () => {
    it('successfully sends a message and receives response', async () => {
      const response = await ChatService.sendMessage('Hi', false);
      
      expect(response.message).toBe('Response to: Hi');
      expect(response.session_id).toBe('12345');
      expect(ChatService.getSessionId()).toBe('12345');
      expect(ChatService.sendMessage).toHaveBeenCalledWith('Hi', false);
    });

    it('maintains session ID across multiple messages', async () => {
      // Send first message
      await ChatService.sendMessage('First message', false);
      expect(ChatService.getSessionId()).toBe('12345');

      // Send second message
      const secondResponse = await ChatService.sendMessage('Second message', false);
      
      expect(secondResponse.message).toBe('Response to: Second message');
      expect(secondResponse.session_id).toBe('12345');
      expect(ChatService.sendMessage).toHaveBeenCalledTimes(2);
    });

    it('handles API errors appropriately', async () => {
      await expect(ChatService.sendMessage('trigger API error', false))
        .rejects
        .toThrow('API error: 500');
    });

    it('handles network errors appropriately', async () => {
      await expect(ChatService.sendMessage('trigger network error', false))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('session management', () => {
    test('clearSession removes the current session ID', async () => {
      // Send a message to get a session ID
      await ChatService.sendMessage('Hi', false);
      expect(ChatService.getSessionId()).toBe('12345');

      // Clear the session
      ChatService.clearSession();
      expect(ChatService.getSessionId()).toBeNull();
    });
  });
}); 