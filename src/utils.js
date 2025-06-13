/**
 * Creates a standardized API response object
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {Object|null} details - Additional error details or data
 * @param {Object|null} data - Additional response data
 * @returns {Object} - Standardized response object
 */
function createResponse(success, message, details = null, data = null) {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.details = details;
  }

  if (data) {
    response.data = data;
  }

  return response;
}

/**
 * Logs incoming request information
 * @param {Object} req - Express request object
 */
function logRequest(req) {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    body: req.method === 'POST' ? sanitizeLogData(req.body) : undefined
  };

  console.log('Incoming request:', JSON.stringify(logData, null, 2));
}

/**
 * Sanitizes sensitive data for logging
 * @param {Object} data - Data to sanitize
 * @returns {Object} - Sanitized data
 */
function sanitizeLogData(data) {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };
  
  // Remove or mask sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***masked***';
    }
  });

  // Truncate long fields for logging
  if (sanitized.message && sanitized.message.length > 200) {
    sanitized.message = sanitized.message.substring(0, 200) + '...';
  }

  return sanitized;
}

/**
 * Generates a random alphanumeric ID
 * @param {number} length - Length of the ID (default: 8)
 * @returns {string} - Random ID
 */
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validates environment variables
 * @returns {Object} - Validation result with missing variables
 */
function validateEnvironment() {
  const required = [
    'GCP_PROJECT_ID',
    'SENDGRID_API_KEY',
    'ADMIN_EMAIL'
  ];

  const missing = required.filter(variable => !process.env[variable]);

  return {
    isValid: missing.length === 0,
    missing: missing
  };
}

/**
 * Gets client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
}

/**
 * Formats a date to ISO string with timezone
 * @param {Date} date - Date to format (default: now)
 * @returns {string} - Formatted date string
 */
function formatDate(date = new Date()) {
  return date.toISOString();
}

/**
 * Checks if a string is empty or contains only whitespace
 * @param {string} str - String to check
 * @returns {boolean} - True if empty or whitespace only
 */
function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * Safely parses JSON string
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed object or default value
 */
function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error.message);
    return defaultValue;
  }
}

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with function result
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delayMs = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
}

/**
 * Truncates text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

module.exports = {
  createResponse,
  logRequest,
  sanitizeLogData,
  generateId,
  validateEnvironment,
  getClientIP,
  formatDate,
  isEmpty,
  safeJsonParse,
  delay,
  retryWithBackoff,
  truncateText
};
