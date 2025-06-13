// Global test setup
require('dotenv').config({ path: '.env.test' });

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment variables
process.env.GCP_PROJECT_ID = 'test-project';
process.env.SENDGRID_API_KEY = 'test-sendgrid-key';
process.env.ADMIN_EMAIL = 'admin@test.com';
process.env.FROM_EMAIL = 'noreply@test.com';
process.env.COMPANY_NAME = 'Test Company';
process.env.CORS_ORIGIN = 'https://test.com';
process.env.FIRESTORE_COLLECTION = 'test_contact_submissions';
