const request = require('supertest');
const { app } = require('./src/index');

// Simple test to verify the API works
async function testLocalApi() {
  console.log('🚀 Testing Contact Form API locally...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await request(app)
      .get('/health')
      .expect(200);
    
    console.log('✅ Health check passed:', healthResponse.body);

    // Test contact form with valid data
    console.log('\n2. Testing contact form with valid data...');
    const contactResponse = await request(app)
      .post('/contact')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message to verify the contact form API is working correctly.',
        subject: 'API Test'
      })
      .expect(200);
    
    console.log('✅ Contact form submission passed:', contactResponse.body);

    // Test validation with invalid data
    console.log('\n3. Testing validation with invalid data...');
    const validationResponse = await request(app)
      .post('/contact')
      .send({
        name: '',
        email: 'invalid-email',
        message: 'Short'
      })
      .expect(400);
    
    console.log('✅ Validation test passed:', validationResponse.body);

    console.log('\n🎉 All API tests passed! The contact form API is working correctly.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testLocalApi();
