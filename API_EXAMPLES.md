# API Usage Examples

This document provides practical examples of how to use the Contact Form API in different scenarios.

## 📡 API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-14T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Submit Contact Form
```http
POST /contact
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I would like to inquire about your services.",
  "subject": "Service Inquiry (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Thank you for your message. We'll get back to you soon!",
  "timestamp": "2025-06-14T10:30:00.000Z",
  "data": {
    "id": "abc123def456"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "timestamp": "2025-06-14T10:30:00.000Z",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## 🌐 Frontend Integration Examples

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>Contact Form</title>
    <style>
        .contact-form {
            max-width: 500px;
            margin: 50px auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
        }
        button:hover {
            background-color: #45a049;
        }
        button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .message {
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="contact-form">
        <h2>Contact Us</h2>
        <form id="contactForm">
            <div class="form-group">
                <label for="name">Name *</label>
                <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="subject">Subject</label>
                <input type="text" id="subject" name="subject">
            </div>
            
            <div class="form-group">
                <label for="message">Message *</label>
                <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            
            <button type="submit" id="submitBtn">Send Message</button>
        </form>
        
        <div id="messageDiv"></div>
    </div>

    <script>
        const API_URL = 'https://your-region-your-project.cloudfunctions.net/contact-form-api';
        
        document.getElementById('contactForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const messageDiv = document.getElementById('messageDiv');
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            messageDiv.innerHTML = '';
            
            try {
                const response = await fetch(`${API_URL}/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    messageDiv.innerHTML = `
                        <div class="message success">
                            ${result.message}
                            <br><small>Reference ID: ${result.data.id}</small>
                        </div>
                    `;
                    this.reset(); // Clear the form
                } else {
                    let errorMessage = result.message;
                    if (result.details && result.details.length > 0) {
                        errorMessage += '<br><ul>';
                        result.details.forEach(detail => {
                            errorMessage += `<li>${detail.message}</li>`;
                        });
                        errorMessage += '</ul>';
                    }
                    
                    messageDiv.innerHTML = `
                        <div class="message error">
                            ${errorMessage}
                        </div>
                    `;
                }
            } catch (error) {
                messageDiv.innerHTML = `
                    <div class="message error">
                        Network error. Please check your connection and try again.
                    </div>
                `;
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    </script>
</body>
</html>
```

### React Component

```jsx
import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const API_URL = 'https://your-region-your-project.cloudfunctions.net/contact-form-api';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `${result.message} (Reference ID: ${result.data.id})`
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        let errorText = result.message;
        if (result.details && result.details.length > 0) {
          errorText += '\n' + result.details.map(d => d.message).join('\n');
        }
        setMessage({
          type: 'error',
          text: errorText
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <h2>Contact Us</h2>
      
      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isSubmitting ? '#cccccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
```

### cURL Examples

```bash
# Test health endpoint
curl -X GET https://your-region-your-project.cloudfunctions.net/contact-form-api/health

# Submit contact form
curl -X POST https://your-region-your-project.cloudfunctions.net/contact-form-api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello, this is a test message.",
    "subject": "Test Subject"
  }'

# Test validation (invalid email)
curl -X POST https://your-region-your-project.cloudfunctions.net/contact-form-api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "message": "Test message"
  }'
```

## 🔒 Security Considerations

### Rate Limiting
The API implements rate limiting:
- **5 requests per 15 minutes** per IP address
- Returns HTTP 429 when limit exceeded

### CORS
Configure the `CORS_ORIGIN` environment variable:
```bash
# Single origin
CORS_ORIGIN=https://yourwebsite.com

# Multiple origins (not recommended for production)
CORS_ORIGIN=*
```

### Input Validation
All inputs are validated:
- **Name**: 1-100 characters, required
- **Email**: Valid email format, required
- **Message**: 10-1000 characters, required
- **Subject**: Max 200 characters, optional

### Data Storage
Contact submissions are stored in Firestore with:
- Auto-generated document ID
- Timestamp
- IP address and User-Agent (for abuse prevention)
- Status tracking (new, read, responded)

## 📧 Email Templates

The API sends two types of emails:

### User Confirmation Email
- Professional HTML template
- Includes reference ID
- Thank you message
- Company branding

### Admin Notification Email
- All form details
- Reply-to set to user's email
- Reference ID for tracking
- Timestamp

## 🐛 Error Handling

### Common HTTP Status Codes
- **200**: Success
- **400**: Validation error
- **429**: Rate limit exceeded
- **500**: Server error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-06-14T10:30:00.000Z",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## 📊 Monitoring

### CloudWatch Metrics (AWS)
- Function invocations
- Error rate
- Duration
- Memory usage

### Google Cloud Monitoring
- Function executions
- Error count
- Response time
- Resource utilization

### Custom Logging
All requests are logged with:
- IP address
- User agent
- Request timestamp
- Form data (sanitized)

---

For more information, see the main [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md) files.
