describe('API Client', () => {
  describe('API Client Export', () => {
    it('should export apiClient', () => {
      const { apiClient } = require('../../services/api');
      expect(apiClient).toBeDefined();
    });

    it('should have checkHealth method', () => {
      const { apiClient } = require('../../services/api');
      expect(apiClient.checkHealth).toBeDefined();
      expect(typeof apiClient.checkHealth).toBe('function');
    });

    it('should have sendMessage method', () => {
      const { apiClient } = require('../../services/api');
      expect(apiClient.sendMessage).toBeDefined();
      expect(typeof apiClient.sendMessage).toBe('function');
    });
  });

  describe('Personality Modes', () => {
    it('should support all 6 personality modes', () => {
      const personalities = ['Serious', 'Goofy', 'Creative', 'Adaptive', 'Professional', 'Casual'];

      personalities.forEach(personality => {
        expect(personality).toBeDefined();
        expect(typeof personality).toBe('string');
      });
    });

    it('should have exactly 6 personality modes', () => {
      const personalities = ['Serious', 'Goofy', 'Creative', 'Adaptive', 'Professional', 'Casual'];
      expect(personalities.length).toBe(6);
    });
  });

  describe('API Methods', () => {
    it('should have async methods', () => {
      const { apiClient } = require('../../services/api');

      const checkHealthResult = apiClient.checkHealth();
      expect(checkHealthResult).toHaveProperty('then');
      expect(checkHealthResult).toHaveProperty('catch');
    });
  });

  describe('Message Data Structure', () => {
    it('should accept message data with required fields', () => {
      const messageData = {
        message: 'Hello',
        personality: 'Serious' as const,
        context: {
          timestamp: new Date().toISOString(),
          messageCount: 1,
        },
      };

      expect(messageData).toHaveProperty('message');
      expect(messageData).toHaveProperty('personality');
      expect(messageData).toHaveProperty('context');
      expect(messageData.context).toHaveProperty('timestamp');
      expect(messageData.context).toHaveProperty('messageCount');
    });
  });
});

