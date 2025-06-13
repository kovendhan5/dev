# Deployment Guide

This guide provides step-by-step instructions for deploying the Serverless Contact Form API to Google Cloud Platform.

## Prerequisites

- Google Cloud Platform account with billing enabled
- SendGrid account for email delivery
- Node.js 18+ installed locally
- Google Cloud SDK installed and configured

## Step 1: Google Cloud Setup

### 1.1 Create or Select a Project

```bash
# Create a new project
gcloud projects create your-project-id --name="Contact Form API"

# Set the project as default
gcloud config set project your-project-id
```

### 1.2 Enable Required APIs

```bash
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
```

### 1.3 Create Firestore Database

```bash
# Create Firestore database in native mode
gcloud firestore databases create --region=us-central1
```

### 1.4 Create Service Account

```bash
# Create service account
gcloud iam service-accounts create contact-form-api \
  --display-name="Contact Form API Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:contact-form-api@your-project-id.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:contact-form-api@your-project-id.iam.gserviceaccount.com" \
  --role="roles/logging.logWriter"

# Create and download service account key
gcloud iam service-accounts keys create service-account-key.json \
  --iam-account=contact-form-api@your-project-id.iam.gserviceaccount.com
```

## Step 2: SendGrid Setup

### 2.1 Create SendGrid Account

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your account and sender identity
3. Create an API key with "Mail Send" permissions

### 2.2 Verify Sender Identity

1. Go to Settings > Sender Authentication
2. Verify your domain or single sender email
3. Note the verified email for use in configuration

## Step 3: Local Configuration

### 3.1 Clone and Setup Project

```bash
git clone <your-repository-url>
cd serverless-contact-form-api
npm install
```

### 3.2 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file:

```bash
GCP_PROJECT_ID=your-project-id
FIRESTORE_COLLECTION=contact_submissions
SENDGRID_API_KEY=your-sendgrid-api-key
ADMIN_EMAIL=admin@yourcompany.com
FROM_EMAIL=noreply@yourcompany.com
COMPANY_NAME=Your Company Name
CORS_ORIGIN=https://yourwebsite.com
```

## Step 4: Testing

### 4.1 Local Testing

```bash
# Run tests
npm test

# Start local development server
npm run dev

# Test the endpoint
curl -X POST http://localhost:8080/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message from the local development server."
  }'
```

## Step 5: Deployment

### 5.1 Manual Deployment

```bash
# Set authentication
export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"

# Deploy function
gcloud functions deploy contact-form-api \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source=. \
  --entry-point=contactFormHandler \
  --set-env-vars="GCP_PROJECT_ID=your-project-id,SENDGRID_API_KEY=your-sendgrid-key,ADMIN_EMAIL=admin@yourcompany.com,FROM_EMAIL=noreply@yourcompany.com,COMPANY_NAME=Your Company,CORS_ORIGIN=https://yourwebsite.com" \
  --max-instances=50 \
  --memory=512MB \
  --timeout=60s \
  --service-account=contact-form-api@your-project-id.iam.gserviceaccount.com
```

### 5.2 Verify Deployment

```bash
# Get function URL
gcloud functions describe contact-form-api --format="value(httpsTrigger.url)"

# Test deployed function
curl -X POST https://your-region-your-project-id.cloudfunctions.net/contact-form-api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message from the deployed function."
  }'
```

## Step 6: GitHub Actions Setup (Optional)

### 6.1 Add GitHub Secrets

Add the following secrets to your GitHub repository:

- `GCP_PROJECT_ID`: Your Google Cloud Project ID
- `GCP_SA_KEY`: Contents of service-account-key.json
- `SENDGRID_API_KEY`: Your SendGrid API key
- `ADMIN_EMAIL`: Admin email address
- `FROM_EMAIL`: From email address
- `COMPANY_NAME`: Your company name
- `CORS_ORIGIN`: Allowed origin for production
- `CORS_ORIGIN_STAGING`: Allowed origin for staging

### 6.2 Trigger Deployment

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

## Step 7: Frontend Integration

### 7.1 HTML Form Example

```html
<form id="contact-form">
  <input type="text" name="name" required placeholder="Your Name">
  <input type="email" name="email" required placeholder="Your Email">
  <input type="text" name="subject" placeholder="Subject (optional)">
  <textarea name="message" required placeholder="Your Message"></textarea>
  <button type="submit">Send Message</button>
</form>

<script>
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('https://your-function-url/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Thank you! Your message has been sent.');
      e.target.reset();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Network error. Please try again.');
  }
});
</script>
```

### 7.2 React Example

```jsx
import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://your-function-url/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert('Thank you! Your message has been sent.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
        placeholder="Your Name"
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
        placeholder="Your Email"
      />
      <input
        type="text"
        value={formData.subject}
        onChange={(e) => setFormData({...formData, subject: e.target.value})}
        placeholder="Subject (optional)"
      />
      <textarea
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        required
        placeholder="Your Message"
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

## Step 8: Monitoring and Maintenance

### 8.1 Set Up Monitoring

```bash
# Create log-based metric for errors
gcloud logging metrics create contact_form_errors \
  --description="Contact form API errors" \
  --log-filter='resource.type="cloud_function" AND resource.labels.function_name="contact-form-api" AND severity>=ERROR'

# Create alerting policy
gcloud alpha monitoring policies create \
  --policy-from-file=alerting-policy.yaml
```

### 8.2 Regular Maintenance

- Monitor function performance and errors
- Review and rotate API keys regularly
- Update dependencies for security patches
- Review and clean up old submissions if needed

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Verify service account has correct permissions
   - Check if APIs are enabled

2. **CORS Errors**
   - Ensure CORS_ORIGIN matches your website domain
   - Include protocol (https://) in origin

3. **Email Delivery Issues**
   - Verify SendGrid sender identity
   - Check API key permissions
   - Review SendGrid activity logs

4. **Function Timeout**
   - Increase timeout value in deployment
   - Optimize database queries
   - Review email service performance

For more help, check the main README.md or create an issue in the repository.
