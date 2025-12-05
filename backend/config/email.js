// config/email.js
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    // Check for SendGrid
    if (process.env.EMAIL_SERVICE === 'sendgrid' || process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'apikey', // Always 'apikey' for SendGrid
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }

    // Default to Gmail/SMTP
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send email function
const sendEmail = async ({ to, subject, html, text, replyTo, from }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: from || process.env.EMAIL_FROM || `"Feedback System" <${process.env.EMAIL_USER}>`, // 👈 Allow dynamic "From"
            to,
            replyTo,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '')
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
