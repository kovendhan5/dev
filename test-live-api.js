const fetch = require('node-fetch');

async function testLiveAPI() {
  const apiUrl = 'https://us-central1-serverless-462906.cloudfunctions.net/contact-form-api';
  
  console.log('🚀 Testing Live Serverless Contact Form API\n');
  
  // Test 1: Health Check
  console.log('1. Testing Health Endpoint...');
  try {
    const healthResponse = await fetch(`${apiUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.log('❌ Health Check Error:', error.message);
  }
  
  // Test 2: Contact Form Submission
  console.log('\n2. Testing Contact Form Submission...');
  try {
    const contactData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Live API Test',
      message: 'This is a test of the live serverless contact form API!'
    };
    
    const contactResponse = await fetch(`${apiUrl}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    });
    
    const contactResult = await contactResponse.json();
    console.log('✅ Contact Form Response:', contactResult);
  } catch (error) {
    console.log('❌ Contact Form Error:', error.message);
  }
}

testLiveAPI();
