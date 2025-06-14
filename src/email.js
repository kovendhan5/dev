const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yourcompany.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourcompany.com';
const COMPANY_NAME = process.env.COMPANY_NAME || 'Your Company';

/**
 * Sends both confirmation and notification emails
 * @param {Object} contactData - The contact form data
 * @param {string} submissionId - The Firestore document ID
 * @return {Promise<void>}
 */
async function sendEmails(contactData, submissionId) {
  try {
    const promises = [
      sendConfirmationEmail(contactData, submissionId),
      sendNotificationEmail(contactData, submissionId),
    ];

    await Promise.all(promises);
    console.log('All emails sent successfully');
  } catch (error) {
    console.error('Error sending emails:', error);
    // Don't throw here to avoid failing the entire request if email fails
  }
}

/**
 * Sends confirmation email to the user
 * @param {Object} contactData - The contact form data
 * @param {string} submissionId - The Firestore document ID
 * @return {Promise<void>}
 */
async function sendConfirmationEmail(contactData, submissionId) {
  const {name, email, subject} = contactData;

  const emailContent = {
    to: email,
    from: {
      email: FROM_EMAIL,
      name: COMPANY_NAME,
    },
    subject: `Thank you for contacting ${COMPANY_NAME}`,
    html: generateConfirmationEmailTemplate(name, subject, submissionId),
    text: generateConfirmationEmailText(name, subject, submissionId),
  };

  try {
    await sgMail.send(emailContent);
    console.log(`Confirmation email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

/**
 * Sends notification email to admin
 * @param {Object} contactData - The contact form data
 * @param {string} submissionId - The Firestore document ID
 * @return {Promise<void>}
 */
async function sendNotificationEmail(contactData, submissionId) {
  const {email, subject} = contactData;

  const emailContent = {
    to: ADMIN_EMAIL,
    from: {
      email: FROM_EMAIL,
      name: COMPANY_NAME,
    },
    subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
    html: generateNotificationEmailTemplate(contactData, submissionId),
    text: generateNotificationEmailText(contactData, submissionId),
    replyTo: email,
  };

  try {
    await sgMail.send(emailContent);
    console.log(`Notification email sent to admin: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
}

/**
 * Generates HTML template for confirmation email
 */
function generateConfirmationEmailTemplate(name, subject, submissionId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You - ${COMPANY_NAME}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${COMPANY_NAME}</h1>
                <h2>Thank You for Contacting Us!</h2>
            </div>
            <div class="content">
                <p>Dear ${name},</p>
                <p>Thank you for reaching out to us. We have received your message and will get back to you 
                   as soon as possible.</p>
                ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
                <p><strong>Reference ID:</strong> ${submissionId}</p>
                <p>We typically respond within 24-48 hours during business days.</p>
                <p>If your inquiry is urgent, please call us directly.</p>
                <p>Best regards,<br>${COMPANY_NAME} Team</p>
            </div>
            <div class="footer">
                <p>This is an automated confirmation email. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generates plain text for confirmation email
 */
function generateConfirmationEmailText(name, subject, submissionId) {
  return `
Dear ${name},

Thank you for reaching out to ${COMPANY_NAME}. We have received your message and will get back to you 
as soon as possible.

${subject ? `Subject: ${subject}` : ''}
Reference ID: ${submissionId}

We typically respond within 24-48 hours during business days.
If your inquiry is urgent, please call us directly.

Best regards,
${COMPANY_NAME} Team

This is an automated confirmation email. Please do not reply to this email.
  `.trim();
}

/**
 * Generates HTML template for notification email
 */
function generateNotificationEmailTemplate(contactData, submissionId) {
  const {name, email, message, subject} = contactData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .field { margin-bottom: 15px; padding: 10px; background-color: white; border-left: 4px solid #2196F3; }
            .field strong { color: #2196F3; }
            .message-content { background-color: #fff; padding: 15px; border: 1px solid #ddd; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
                <div class="field">
                    <strong>Reference ID:</strong> ${submissionId}
                </div>
                <div class="field">
                    <strong>Name:</strong> ${name}
                </div>
                <div class="field">
                    <strong>Email:</strong> ${email}
                </div>
                ${subject ? `<div class="field"><strong>Subject:</strong> ${subject}</div>` : ''}
                <div class="field">
                    <strong>Message:</strong>
                    <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="field">
                    <strong>Received:</strong> ${new Date().toLocaleString()}
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generates plain text for notification email
 */
function generateNotificationEmailText(contactData, submissionId) {
  const {name, email, message, subject} = contactData;

  return `
New Contact Form Submission

Reference ID: ${submissionId}
Name: ${name}
Email: ${email}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}

Received: ${new Date().toLocaleString()}
  `.trim();
}

module.exports = {
  sendEmails,
  sendConfirmationEmail,
  sendNotificationEmail,
};
