const { validateContactForm, sanitizeHtml, isValidEmail, containsSuspiciousContent } = require('../../src/validation');

describe('Validation Module', () => {
  describe('validateContactForm', () => {
    test('should validate correct contact form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message that is long enough to pass validation.',
        subject: 'Test Subject'
      };

      const result = validateContactForm(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toBe(null);
      expect(result.data).toEqual(validData);
    });

    test('should reject empty name', () => {
      const invalidData = {
        name: '',
        email: 'john@example.com',
        message: 'This is a test message that is long enough to pass validation.'
      };

      const result = validateContactForm(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[0].message).toBe('Name is required');
    });

    test('should reject invalid email format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'This is a test message that is long enough to pass validation.'
      };

      const result = validateContactForm(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[0].message).toBe('Please provide a valid email address');
    });

    test('should reject short message', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Short'
      };

      const result = validateContactForm(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('message');
      expect(result.errors[0].message).toBe('Message must be at least 10 characters long');
    });

    test('should reject long subject', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message that is long enough to pass validation.',
        subject: 'A'.repeat(201) // 201 characters
      };

      const result = validateContactForm(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('subject');
      expect(result.errors[0].message).toBe('Subject must be less than 200 characters');
    });

    test('should allow optional subject', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message that is long enough to pass validation.'
      };

      const result = validateContactForm(validData);

      expect(result.isValid).toBe(true);
      expect(result.data.subject).toBeUndefined();
    });
  });

  describe('sanitizeHtml', () => {
    test('should sanitize HTML characters', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
      
      expect(sanitizeHtml(input)).toBe(expected);
    });

    test('should handle non-string input', () => {
      expect(sanitizeHtml(123)).toBe(123);
      expect(sanitizeHtml(null)).toBe(null);
      expect(sanitizeHtml(undefined)).toBe(undefined);
    });
  });

  describe('isValidEmail', () => {
    test('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@invalid.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
    });
  });

  describe('containsSuspiciousContent', () => {
    test('should detect suspicious script tags', () => {
      expect(containsSuspiciousContent('<script>alert("xss")</script>')).toBe(true);
      expect(containsSuspiciousContent('<SCRIPT>alert("xss")</SCRIPT>')).toBe(true);
    });

    test('should detect javascript protocols', () => {
      expect(containsSuspiciousContent('javascript:alert("xss")')).toBe(true);
      expect(containsSuspiciousContent('JAVASCRIPT:alert("xss")')).toBe(true);
    });

    test('should detect event handlers', () => {
      expect(containsSuspiciousContent('onclick=alert("xss")')).toBe(true);
      expect(containsSuspiciousContent('onload=alert("xss")')).toBe(true);
    });

    test('should return false for safe content', () => {
      expect(containsSuspiciousContent('This is a safe message')).toBe(false);
      expect(containsSuspiciousContent('Contact us at support@example.com')).toBe(false);
    });

    test('should handle non-string input', () => {
      expect(containsSuspiciousContent(123)).toBe(false);
      expect(containsSuspiciousContent(null)).toBe(false);
      expect(containsSuspiciousContent(undefined)).toBe(false);
    });
  });
});
