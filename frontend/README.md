# Frontend - Contact Form Demo

This is a beautiful, modern frontend for testing the serverless contact form API.

## Features

- 🎨 **Modern Design** - Beautiful gradient background and glass-morphism effects
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Real-time Validation** - Instant feedback on form fields
- 🔄 **Loading States** - Visual feedback during form submission
- ✅ **Success/Error Messages** - Clear user feedback
- 🌐 **API Integration** - Connects to your live serverless API
- 🔍 **API Health Check** - Automatically checks if the API is online

## How to Use

1. Open `index.html` in your web browser
2. Fill out the contact form
3. Click "Send Message"
4. Watch as your message is sent to the serverless API!

## What Happens When You Submit

1. **Frontend Validation** - Checks required fields and email format
2. **API Request** - Sends POST request to your Cloud Function
3. **Backend Processing** - API validates, stores in Firestore, sends email
4. **Response Display** - Shows success/error message to user

## API Endpoint

The frontend connects to:
```
https://us-central1-serverless-462906.cloudfunctions.net/contact-form-api/contact
```

## Files

- `index.html` - Complete frontend with HTML, CSS, and JavaScript
- `README.md` - This documentation file

## Browser Console

Open the browser's developer console (F12) to see detailed logs of:
- API health checks
- Form submissions
- Response data
- Error messages

Enjoy testing your serverless contact form! 🎉
