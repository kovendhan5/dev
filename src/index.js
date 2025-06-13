const functions = require('@google-cloud/functions-framework');
const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const { validateContactForm } = require('./validation');
const { saveContactSubmission } = require('./database');
const { sendEmails } = require('./email');
const { createResponse, logRequest } = require('./utils');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting storage (in-memory for simplicity)
const rateLimitStore = new Map();

// Rate limiting middleware
const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // Max 5 requests per window

  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, []);
  }

  const requests = rateLimitStore.get(clientIP);
  // Clean old requests
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return res.status(429).json(createResponse(false, 'Too many requests. Please try again later.'));
  }

  recentRequests.push(now);
  rateLimitStore.set(clientIP, recentRequests);
  next();
};

// Main contact form handler
app.post('/contact', rateLimit, async (req, res) => {
  try {
    // Log the request
    logRequest(req);

    // Validate input
    const validation = validateContactForm(req.body);
    if (!validation.isValid) {
      return res.status(400).json(createResponse(false, 'Validation failed', validation.errors));
    }

    const contactData = validation.data;

    // Add metadata
    const submission = {
      ...contactData,
      timestamp: new Date().toISOString(),
      metadata: {
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent') || 'Unknown',
        source: 'api'
      },
      status: 'new'
    };

    // Save to Firestore
    const documentId = await saveContactSubmission(submission);

    // Send emails
    await sendEmails(contactData, documentId);

    // Return success response
    res.status(200).json(createResponse(
      true, 
      'Thank you for your message. We\'ll get back to you soon!', 
      null, 
      { id: documentId }
    ));

  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json(createResponse(false, 'Internal server error. Please try again later.'));
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json(createResponse(false, 'Endpoint not found'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json(createResponse(false, 'Internal server error'));
});

// Register the function
functions.http('contactFormHandler', app);

module.exports = { app };
