# Serverless Contact Form API

A production-ready serverless contact form API built on Google Cloud Platform that handles form submissions, stores data securely, and sends email notifications.

**🎉 Status: DEPLOYED SUCCESSFULLY! 🚀**

**Live API Endpoint:** `https://us-central1-serverless-462906.cloudfunctions.net/contact-form-api`

## 🌟 Features

- ✅ **Serverless Architecture** - Built with Google Cloud Functions
- ✅ **Data Validation** - Comprehensive input validation and sanitization
- ✅ **Email Notifications** - Confirmation emails to users and notifications to admins
- ✅ **Data Storage** - Secure storage in Firestore with metadata
- ✅ **Rate Limiting** - Protection against spam and abuse
- ✅ **CORS Support** - Configurable cross-origin resource sharing
- ✅ **Security** - Helmet.js security headers and input sanitization
- ✅ **Testing** - Comprehensive unit and integration tests
- ✅ **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions

## 🏗️ Architecture

```
Web Form → Cloud Function → Firestore Database
    ↓
Email Notification (SendGrid)
```

## 📋 API Documentation

### Endpoint: `POST /contact`

Submit a contact form with the following JSON payload:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here (10-1000 characters)",
  "subject": "Optional subject (max 200 characters)"
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Thank you for your message. We'll get back to you soon!",
  "timestamp": "2025-06-13T10:30:00.000Z",
  "data": {
    "id": "generated-document-id"
  }
}
```

### Error Response (400/500)

```json
{
  "success": false,
  "message": "Validation failed",
  "timestamp": "2025-06-13T10:30:00.000Z",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### Health Check: `GET /health`

```json
{
  "status": "healthy",
  "timestamp": "2025-06-13T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Google Cloud Platform account with billing enabled
- SendGrid account for email service
- Git for version control

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd serverless-contact-form-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start local development server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:8080`

5. **Run tests**
   ```bash
   npm test
   ```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Google Cloud Platform
GCP_PROJECT_ID=your-gcp-project-id

# Firestore Database
FIRESTORE_COLLECTION=contact_submissions

# SendGrid Email Service
SENDGRID_API_KEY=your-sendgrid-api-key

# Email Configuration
ADMIN_EMAIL=admin@yourcompany.com
FROM_EMAIL=noreply@yourcompany.com
COMPANY_NAME=Your Company Name

# CORS Configuration
CORS_ORIGIN=https://yourwebsite.com
```

## 📦 Deployment

### Google Cloud Platform Setup

1. **Enable required APIs**
   ```bash
   gcloud services enable cloudfunctions.googleapis.com
   gcloud services enable firestore.googleapis.com
   ```

2. **Create a service account**
   ```bash
   gcloud iam service-accounts create contact-form-api
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:contact-form-api@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/cloudsql.client"
   ```

3. **Deploy manually**
   ```bash
   npm run deploy
   ```

### Automated Deployment with GitHub Actions

1. **Set up GitHub Secrets**
   - `GCP_PROJECT_ID` - Your Google Cloud Project ID
   - `GCP_SA_KEY` - Service account key JSON
   - `SENDGRID_API_KEY` - Your SendGrid API key
   - `ADMIN_EMAIL` - Admin email address
   - `FROM_EMAIL` - From email address
   - `COMPANY_NAME` - Your company name
   - `CORS_ORIGIN` - Allowed origin for CORS

2. **Push to main branch**
   ```bash
   git push origin main
   ```

The GitHub Actions workflow will automatically run tests and deploy to production.

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run specific test suites
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Generate coverage report
```

### Test Coverage

The project maintains high test coverage:
- Branches: >80%
- Functions: >80%
- Lines: >80%
- Statements: >80%

## 🔒 Security Features

- **Input Validation** - Joi schema validation for all inputs
- **Sanitization** - HTML entity encoding to prevent XSS
- **Rate Limiting** - 5 requests per 15 minutes per IP
- **CORS** - Configurable allowed origins
- **Security Headers** - Helmet.js for security headers
- **Environment Variables** - Sensitive data stored securely

## 📊 Monitoring and Logging

The API includes comprehensive logging:
- Request/response logging
- Error tracking with context
- Performance metrics
- Security event logging

Use Google Cloud Console to monitor:
- Function executions
- Error rates
- Response times
- Resource usage

## 🛠️ Development

### Project Structure

```
contact-form-api/
├── src/
│   ├── index.js          # Main Cloud Function
│   ├── validation.js     # Input validation
│   ├── database.js       # Firestore operations
│   ├── email.js          # Email service
│   └── utils.js          # Helper functions
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── setup.js          # Test configuration
├── .github/
│   └── workflows/
│       └── deploy.yml    # CI/CD pipeline
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

### Code Quality

- **ESLint** - Google style guide
- **Jest** - Testing framework
- **GitHub Actions** - CI/CD pipeline
- **Automated** - Security scanning

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Run tests and linting
6. Submit a pull request

## 📈 Performance

- **Cold Start** - < 2 seconds
- **Warm Response** - < 500ms
- **Concurrent Requests** - Up to 50 (configurable)
- **Memory Usage** - 256MB-512MB

## 💰 Cost Optimization

- **Pay-per-use** - Only pay for actual requests
- **Auto-scaling** - Scales to zero when not in use
- **Efficient** - Optimized for minimal resource usage

## 🆘 Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SendGrid API key
   - Verify sender email verification
   - Check spam folder

2. **CORS errors**
   - Update `CORS_ORIGIN` environment variable
   - Ensure protocol (https/http) matches

3. **Database errors**
   - Verify Firestore permissions
   - Check project ID configuration

4. **Rate limiting**
   - Implement proper client-side error handling
   - Consider increasing limits for legitimate use

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your environment.

## 📚 Additional Resources

- [Google Cloud Functions Documentation](https://cloud.google.com/functions/docs)
- [Firestore Documentation](https://cloud.google.com/firestore/docs)
- [SendGrid API Documentation](https://docs.sendgrid.com/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

---
