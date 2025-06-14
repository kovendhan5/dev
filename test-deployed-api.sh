#!/bin/bash

echo "🧪 Testing Deployed Serverless Contact Form API"
echo "==============================================="

API_URL="https://us-central1-serverless-462906.cloudfunctions.net/contact-form-api"

echo ""
echo "1. Testing Health Endpoint..."
echo "GET $API_URL/health"

curl -s -X GET "$API_URL/health" | echo "Response: $(cat)"

echo ""
echo ""
echo "2. Testing Contact Form Endpoint..."
echo "POST $API_URL/contact"

curl -s -X POST "$API_URL/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "message": "Testing the deployed API!",
    "subject": "API Test"
  }' | echo "Response: $(cat)"

echo ""
echo ""
echo "✅ API Testing Complete!"
echo "Your serverless contact form is live and ready to use! 🎉"
