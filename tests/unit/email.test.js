const { sendEmails, sendConfirmationEmail, sendNotificationEmail } = require('../../src/email');

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }])
}));

const sgMail = require('@sendgrid/mail');

describe('Email Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to success state before each test
    sgMail.send.mockResolvedValue([{ statusCode: 202 }]);
    // Reset environment variables
    process.env.ADMIN_EMAIL = 'admin@test.com';
    process.env.FROM_EMAIL = 'noreply@test.com';
    process.env.COMPANY_NAME = 'Test Company';
  });

  describe('sendEmails', () => {
    test('should send both confirmation and notification emails', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        subject: 'Test Subject'
      };

      await sendEmails(contactData, 'test-doc-id');

      expect(sgMail.send).toHaveBeenCalledTimes(2);
    });    test('should not throw error if email sending fails', async () => {
      sgMail.send.mockRejectedValueOnce(new Error('SendGrid error'));

      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message'
      };

      // Should not throw, just log the error
      await expect(sendEmails(contactData, 'test-doc-id')).resolves.not.toThrow();
    });
  });

  describe('sendConfirmationEmail', () => {
    test('should send confirmation email with correct data', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        subject: 'Test Subject'
      };

      await sendConfirmationEmail(contactData, 'test-doc-id');

      expect(sgMail.send).toHaveBeenCalledTimes(1);
      
      const emailCall = sgMail.send.mock.calls[0][0];
      expect(emailCall.to).toBe('john@example.com');
      expect(emailCall.from.email).toBe('noreply@test.com');
      expect(emailCall.from.name).toBe('Test Company');
      expect(emailCall.subject).toBe('Thank you for contacting Test Company');
      expect(emailCall.html).toContain('John Doe');
      expect(emailCall.html).toContain('test-doc-id');
      expect(emailCall.text).toContain('John Doe');
    });

    test('should handle confirmation email without subject', async () => {
      const contactData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        message: 'Test message without subject'
      };

      await sendConfirmationEmail(contactData, 'test-doc-id-2');

      expect(sgMail.send).toHaveBeenCalledTimes(1);
      
      const emailCall = sgMail.send.mock.calls[0][0];
      expect(emailCall.html).toContain('Jane Smith');
      expect(emailCall.html).not.toContain('<strong>Subject:</strong>');
    });    test('should throw error if SendGrid fails', async () => {
      sgMail.send.mockRejectedValueOnce(new Error('SendGrid API error'));

      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message'
      };

      await expect(sendConfirmationEmail(contactData, 'test-doc-id')).rejects.toThrow('SendGrid API error');
    });
  });

  describe('sendNotificationEmail', () => {
    test('should send notification email to admin', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message with line breaks\nSecond line\nThird line',
        subject: 'Test Subject'
      };

      await sendNotificationEmail(contactData, 'test-doc-id');

      expect(sgMail.send).toHaveBeenCalledTimes(1);
      
      const emailCall = sgMail.send.mock.calls[0][0];
      expect(emailCall.to).toBe('admin@test.com');
      expect(emailCall.from.email).toBe('noreply@test.com');
      expect(emailCall.subject).toBe('New Contact Form Submission: Test Subject');
      expect(emailCall.replyTo).toBe('john@example.com');
      expect(emailCall.html).toContain('John Doe');
      expect(emailCall.html).toContain('john@example.com');
      expect(emailCall.html).toContain('test-doc-id');
      expect(emailCall.html).toContain('<br>'); // Line breaks converted
      expect(emailCall.text).toContain('John Doe');
    });

    test('should handle notification email without subject', async () => {
      const contactData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        message: 'Test message'
      };

      await sendNotificationEmail(contactData, 'test-doc-id-2');

      expect(sgMail.send).toHaveBeenCalledTimes(1);
      
      const emailCall = sgMail.send.mock.calls[0][0];
      expect(emailCall.subject).toBe('New Contact Form Submission: No Subject');
      expect(emailCall.html).not.toContain('<strong>Subject:</strong>');
    });    test('should throw error if SendGrid fails', async () => {
      sgMail.send.mockRejectedValueOnce(new Error('SendGrid notification error'));

      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message'
      };

      await expect(sendNotificationEmail(contactData, 'test-doc-id')).rejects.toThrow('SendGrid notification error');
    });
  });

  describe('email template generation', () => {
    test('should generate HTML templates with proper structure', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message',
        subject: 'Test Subject'
      };

      await sendConfirmationEmail(contactData, 'test-doc-id');

      const emailCall = sgMail.send.mock.calls[0][0];
      
      // Check HTML structure
      expect(emailCall.html).toContain('<!DOCTYPE html>');
      expect(emailCall.html).toContain('<html>');
      expect(emailCall.html).toContain('<head>');
      expect(emailCall.html).toContain('<body>');
      expect(emailCall.html).toContain('</html>');
      
      // Check content
      expect(emailCall.html).toContain('Test User');
      expect(emailCall.html).toContain('test-doc-id');
      expect(emailCall.html).toContain('Test Company');
    });

    test('should generate plain text versions', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message'
      };

      await sendConfirmationEmail(contactData, 'test-doc-id');

      const emailCall = sgMail.send.mock.calls[0][0];
      
      expect(emailCall.text).toBeDefined();
      expect(emailCall.text).toContain('Test User');
      expect(emailCall.text).toContain('test-doc-id');
      expect(emailCall.text).toContain('Test Company');
      expect(emailCall.text).not.toContain('<');
      expect(emailCall.text).not.toContain('>');
    });
  });
});
