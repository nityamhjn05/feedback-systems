// utils/emailTemplates.js

// Password Reset Email Template
const passwordResetEmail = (employeeName, resetLink) => {
  return {
    subject: 'Password Reset Request - Feedback System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${employeeName}</strong>,</p>
            
            <p>We received a request to reset your password for your Feedback System account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <p style="text-align: center;">
              <a href="${resetLink}" class="button" style="color: #ffffff !important;">Reset Password</a>
            </p>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4f46e5;">${resetLink}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in <strong>1 hour</strong></li>
                <li>This link can only be used <strong>once</strong></li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact your administrator.</p>
            
            <p>Best regards,<br><strong>Feedback System Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Form Assignment Email Template
const formAssignmentEmail = (employeeName, formTitle, formDescription, formLink) => {
  return {
    subject: `New Feedback Form Assigned: ${formTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .form-card { background: white; border-left: 4px solid #4f46e5; padding: 20px; margin: 20px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Form Assigned</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${employeeName}</strong>,</p>
            
            <p>You have been assigned a new feedback form. Please complete it at your earliest convenience.</p>
            
            <div class="form-card">
              <h2 style="margin-top: 0; color: #4f46e5;">${formTitle}</h2>
              ${formDescription ? `<p style="color: #64748b;">${formDescription}</p>` : ''}
            </div>
            
            <p style="text-align: center;">
              <a href="${formLink}" class="button" style="color: #ffffff !important;">Complete Form</a>
            </p>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4f46e5;">${formLink}</p>
            
            <p>Thank you for your participation!</p>
            
            <p>Best regards,<br><strong>Feedback System Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Password Reset Success Email Template
const passwordResetSuccessEmail = (employeeName) => {
  return {
    subject: 'Password Successfully Reset - Feedback System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${employeeName}</strong>,</p>
            
            <div class="success">
              <p><strong>Your password has been successfully reset.</strong></p>
            </div>
            
            <p>You can now log in to your account using your new password.</p>
            
            <p>If you did not make this change, please contact your administrator immediately.</p>
            
            <p>Best regards,<br><strong>Feedback System Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// New Response Notification Email Template (For Admins)
const responseNotificationEmail = (adminName, employeeName, formTitle, responseLink) => {
  return {
    subject: `New Response: ${formTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .card { background: white; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📨 New Response Received</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${adminName}</strong>,</p>
            
            <p>A new response has been submitted for one of your forms.</p>
            
            <div class="card">
              <p><strong>Form:</strong> ${formTitle}</p>
              <p><strong>Submitted By:</strong> ${employeeName}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p style="text-align: center;">
              <a href="${responseLink}" class="button" style="color: #ffffff !important;">View Response</a>
            </p>
            
            <p>Best regards,<br><strong>Feedback System Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

module.exports = {
  passwordResetEmail,
  formAssignmentEmail,
  passwordResetSuccessEmail,
  responseNotificationEmail
};
