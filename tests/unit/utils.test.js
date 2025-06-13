const { createResponse, sanitizeLogData, generateId, validateEnvironment, getClientIP, isEmpty, safeJsonParse, truncateText } = require('../../src/utils');

describe('Utils Module', () => {
  describe('createResponse', () => {
    test('should create basic success response', () => {
      const response = createResponse(true, 'Success message');
      
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success message');
      expect(response.timestamp).toBeDefined();
      expect(response.details).toBeUndefined();
      expect(response.data).toBeUndefined();
    });

    test('should create error response with details', () => {
      const details = { field: 'email', error: 'Invalid format' };
      const response = createResponse(false, 'Validation failed', details);
      
      expect(response.success).toBe(false);
      expect(response.message).toBe('Validation failed');
      expect(response.details).toEqual(details);
      expect(response.timestamp).toBeDefined();
    });

    test('should create success response with data', () => {
      const data = { id: '123', status: 'created' };
      const response = createResponse(true, 'Created successfully', null, data);
      
      expect(response.success).toBe(true);
      expect(response.message).toBe('Created successfully');
      expect(response.data).toEqual(data);
      expect(response.details).toBeUndefined();
    });
  });

  describe('sanitizeLogData', () => {
    test('should mask sensitive fields', () => {
      const data = {
        name: 'John',
        password: 'secret123',
        token: 'abc123',
        message: 'Hello world'
      };

      const sanitized = sanitizeLogData(data);

      expect(sanitized.name).toBe('John');
      expect(sanitized.password).toBe('***masked***');
      expect(sanitized.token).toBe('***masked***');
      expect(sanitized.message).toBe('Hello world');
    });

    test('should truncate long messages', () => {
      const longMessage = 'A'.repeat(250);
      const data = { message: longMessage };

      const sanitized = sanitizeLogData(data);

      expect(sanitized.message).toHaveLength(203); // 200 + '...'
      expect(sanitized.message.endsWith('...')).toBe(true);
    });

    test('should handle non-object input', () => {
      expect(sanitizeLogData('string')).toBe('string');
      expect(sanitizeLogData(123)).toBe(123);
      expect(sanitizeLogData(null)).toBe(null);
    });
  });

  describe('generateId', () => {
    test('should generate ID with default length', () => {
      const id = generateId();
      expect(id).toHaveLength(8);
      expect(/^[A-Za-z0-9]+$/.test(id)).toBe(true);
    });

    test('should generate ID with custom length', () => {
      const id = generateId(12);
      expect(id).toHaveLength(12);
      expect(/^[A-Za-z0-9]+$/.test(id)).toBe(true);
    });

    test('should generate different IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('validateEnvironment', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('should pass with all required variables', () => {
      process.env.GCP_PROJECT_ID = 'test-project';
      process.env.SENDGRID_API_KEY = 'test-key';
      process.env.ADMIN_EMAIL = 'admin@test.com';

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    test('should fail with missing variables', () => {
      delete process.env.GCP_PROJECT_ID;
      delete process.env.SENDGRID_API_KEY;

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('GCP_PROJECT_ID');
      expect(result.missing).toContain('SENDGRID_API_KEY');
    });
  });

  describe('getClientIP', () => {
    test('should get IP from req.ip', () => {
      const req = { ip: '192.168.1.1' };
      expect(getClientIP(req)).toBe('192.168.1.1');
    });

    test('should fallback to connection.remoteAddress', () => {
      const req = { connection: { remoteAddress: '192.168.1.2' } };
      expect(getClientIP(req)).toBe('192.168.1.2');
    });

    test('should return unknown for missing IP', () => {
      const req = {};
      expect(getClientIP(req)).toBe('unknown');
    });
  });

  describe('isEmpty', () => {
    test('should detect empty strings', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty('\t\n')).toBe(true);
    });

    test('should detect non-empty strings', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty('  hello  ')).toBe(false);
    });

    test('should handle null and undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });
  });

  describe('safeJsonParse', () => {
    test('should parse valid JSON', () => {
      const json = '{"name": "John", "age": 30}';
      const result = safeJsonParse(json);
      
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    test('should return default value for invalid JSON', () => {
      const invalidJson = '{"name": "John", "age":}';
      const result = safeJsonParse(invalidJson, { error: true });
      
      expect(result).toEqual({ error: true });
    });

    test('should return null by default for invalid JSON', () => {
      const invalidJson = '{"name": "John", "age":}';
      const result = safeJsonParse(invalidJson);
      
      expect(result).toBe(null);
    });
  });

  describe('truncateText', () => {
    test('should not truncate short text', () => {
      const text = 'Short text';
      expect(truncateText(text, 50)).toBe('Short text');
    });

    test('should truncate long text', () => {
      const text = 'This is a very long text that should be truncated';
      const result = truncateText(text, 20);
      
      expect(result).toHaveLength(20);
      expect(result.endsWith('...')).toBe(true);
      expect(result).toBe('This is a very lo...');
    });

    test('should handle null and undefined', () => {
      expect(truncateText(null)).toBe(null);
      expect(truncateText(undefined)).toBe(undefined);
    });
  });
});
