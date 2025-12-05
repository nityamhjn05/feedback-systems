// scripts/testEmail.js
require('dotenv').config();
const { sendEmail } = require('../config/email');

async function test() {
    console.log('📧 Testing email configuration...');
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Pass length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0}`);

    const result = await sendEmail({
        to: process.env.EMAIL_USER, // Send to self
        subject: 'Test Email from Feedback System',
        html: '<h1>It works!</h1><p>This is a test email to verify configuration.</p>'
    });

    if (result.success) {
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', result.messageId);
    } else {
        console.error('❌ Email failed:', result.error);
    }
}

test();
