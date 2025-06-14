const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testLiveAPI() {
  const apiUrl = 'https://us-central1-serverless-462906.cloudfunctions.net/contact-form-api';
  
  console.log('🚀 Testing Live Serverless Contact Form API\n');
  
  // Test 1: Health Check
  console.log('1. Testing Health Endpoint...');
  try {
    const healthResponse = await makeRequest(`${apiUrl}/health`);
    console.log('✅ Health Check:', healthResponse.data);
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
    
    const contactResponse = await makeRequest(`${apiUrl}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(contactData))
      },
      body: JSON.stringify(contactData)
    });
    
    console.log('✅ Contact Form Response:', contactResponse.data);
  } catch (error) {
    console.log('❌ Contact Form Error:', error.message);
  }
}

testLiveAPI();
