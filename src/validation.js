const Joi = require('joi');

// Validation schema for contact form
const contactFormSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name must be less than 100 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  message: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Message is required',
      'string.min': 'Message must be at least 10 characters long',
      'string.max': 'Message must be less than 1000 characters',
      'any.required': 'Message is required'
    }),
  
  subject: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Subject must be less than 200 characters'
    })
});

/**
 * Validates contact form data
 * @param {Object} data - The form data to validate
 * @returns {Object} - Validation result with isValid, data, and errors
 */
function validateContactForm(data) {
  const { error, value } = contactFormSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return {
      isValid: false,
      errors: errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: null,
    data: value
  };
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if input contains potentially malicious content
 * @param {string} input - Input to check
 * @returns {boolean} - True if suspicious content detected
 */
function containsSuspiciousContent(input) {
  if (typeof input !== 'string') return false;
  
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

module.exports = {
  validateContactForm,
  sanitizeHtml,
  isValidEmail,
  containsSuspiciousContent
};
