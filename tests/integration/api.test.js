const request = require('supertest');
const { app, clearRateLimit } = require('../../src/index');

// Mock the database and email modules
jest.mock('../../src/database');
jest.mock('../../src/email');

const { saveContactSubmission } = require('../../src/database');
const { sendEmails } = require('../../src/email');

describe('Contact Form API Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Clear rate limiting between tests
    clearRateLimit();
    
    // Mock successful database save
    saveContactSubmission.mockResolvedValue('test-doc-id-123');
    
    // Mock successful email sending
    sendEmails.mockResolvedValue();
  });

  describe('POST /contact', () => {
    test('should successfully process valid contact form', async () => {
      const validContactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message that is long enough to pass validation.',
        subject: 'Test Subject'
      };

      const response = await request(app)
        .post('/contact')
        .send(validContactData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Thank you for your message. We\'ll get back to you soon!');
      expect(response.body.data.id).toBe('test-doc-id-123');
      
      // Verify database and email functions were called
      expect(saveContactSubmission).toHaveBeenCalledTimes(1);
      expect(sendEmails).toHaveBeenCalledTimes(1);
    });

    test('should reject invalid email format', async () => {
      const invalidContactData = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'This is a test message that is long enough to pass validation.'
      };

      const response = await request(app)
        .post('/contact')
        .send(invalidContactData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.details).toHaveLength(1);
      expect(response.body.details[0].field).toBe('email');
      
      // Verify database and email functions were not called
      expect(saveContactSubmission).not.toHaveBeenCalled();
      expect(sendEmails).not.toHaveBeenCalled();
    });

    test('should reject missing required fields', async () => {
      const incompleteData = {
        name: 'John Doe'
        // Missing email and message
      };

      const response = await request(app)
        .post('/contact')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.details.length).toBeGreaterThan(1);
      
      // Check that both email and message errors are present
      const fields = response.body.details.map(error => error.field);
      expect(fields).toContain('email');
      expect(fields).toContain('message');
    });

    test('should handle database errors gracefully', async () => {
      saveContactSubmission.mockRejectedValue(new Error('Database connection failed'));

      const validContactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message that is long enough to pass validation.'
      };

      const response = await request(app)
        .post('/contact')
        .send(validContactData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Internal server error. Please try again later.');
    });

    test('should continue processing even if email fails', async () => {
      sendEmails.mockRejectedValue(new Error('Email service unavailable'));

      const validContactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message that is long enough to pass validation.'
      };

      const response = await request(app)
        .post('/contact')
        .send(validContactData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-doc-id-123');
      
      // Verify database was called but email failed
      expect(saveContactSubmission).toHaveBeenCalledTimes(1);
      expect(sendEmails).toHaveBeenCalledTimes(1);
    });

    test('should handle rate limiting', async () => {
      const validContactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message that is long enough to pass validation.'
      };

      // Make 6 requests quickly (limit is 5)
      const requests = [];
      for (let i = 0; i < 6; i++) {
        requests.push(
          request(app)
            .post('/contact')
            .send(validContactData)
        );
      }

      const responses = await Promise.all(requests);
      
      // First 5 should succeed
      const successfulResponses = responses.filter(res => res.status === 200);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(successfulResponses.length).toBe(5);
      expect(rateLimitedResponses.length).toBe(1);
      
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].body.success).toBe(false);
        expect(rateLimitedResponses[0].body.message).toContain('Too many requests');
      }
    });

    test('should reject requests with invalid content type', async () => {
      const response = await request(app)
        .post('/contact')
        .set('Content-Type', 'text/plain')
        .send('invalid data')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle OPTIONS request for CORS', async () => {
      const response = await request(app)
        .options('/contact')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.version).toBeDefined();
    });
  });

  describe('404 handling', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
    });

    test('should return 404 for unsupported methods', async () => {
      const response = await request(app)
        .delete('/contact')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
    });
  });
});
