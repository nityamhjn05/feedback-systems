# Email Configuration Guide

## 🎯 Goal
Send emails FROM admin's email TO users' email addresses for form notifications and password resets.

## 📧 For Testing (Current Setup)

### Step 1: Get Gmail App Password for nityamhjn05@gmail.com

1. **Login to Gmail**: https://mail.google.com (use nityamhjn05@gmail.com)

2. **Enable 2-Step Verification**:
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

3. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → Type "Feedback System"
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

4. **Update `.env` file**:
   ```bash
   EMAIL_USER=nityamhjn05@gmail.com
   EMAIL_PASS=abcdefghijklmnop  # Remove spaces from app password
   ```

### Step 2: Add Email to Test Employees

Run this script to update all employees with test email:

```bash
cd backend
node scripts/updateEmployeeEmails.js
```

Or manually update in MongoDB:
```javascript
db.employees.updateMany(
  {},
  { $set: { email: "nityamhjn05@gmail.com" } }
)
```

### Step 3: Restart Backend

```bash
cd backend
# Stop server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing Email Features

### Test 1: Form Assignment Notification

1. Login as admin (EMP001)
2. Create a new form
3. Assign to employees (EMP003, EMP004)
4. Check `nityamhjn05@gmail.com` inbox
5. You should receive notification emails

**Expected Email**:
- Subject: "New Feedback Form Assigned: [Form Title]"
- Contains: Form title, description, link to dashboard

### Test 2: Forgot Password

1. Go to login page
2. Click "Forgot Password?" (once frontend is created)
3. Enter Employee ID
4. Check `nityamhjn05@gmail.com` inbox
5. Click reset link
6. Enter new password

**Expected Email**:
- Subject: "Password Reset Request - Feedback System"
- Contains: Reset link (expires in 1 hour)

---

## 🔧 Current Email Flow

### Form Assignment:
```
Admin creates form
    ↓
Admin assigns to employees
    ↓
System sends email FROM: nityamhjn05@gmail.com
                    TO: employee's email (nityamhjn05@gmail.com for testing)
```

### Password Reset:
```
User requests password reset
    ↓
System sends email FROM: nityamhjn05@gmail.com
                    TO: employee's email (nityamhjn05@gmail.com for testing)
```

---

## 🚀 For Production (Future)

### Option 1: Each Admin Uses Their Own Email

Modify `config/email.js` to use admin's email dynamically:

```javascript
const createTransporter = (adminEmail, adminPassword) => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: adminEmail,
      pass: adminPassword
    }
  });
};
```

**Pros**: Emails come from actual admin
**Cons**: Need to store admin email passwords securely

### Option 2: Use Company Email Service

Use a dedicated email service like:
- **SendGrid** (recommended)
- **AWS SES**
- **Mailgun**

**Pros**: Professional, reliable, better deliverability
**Cons**: Requires account setup

---

## 📝 Quick Setup Checklist

- [ ] Get app password from Gmail (nityamhjn05@gmail.com)
- [ ] Update `.env` with `EMAIL_PASS`
- [ ] Update employee emails to `nityamhjn05@gmail.com`
- [ ] Restart backend server
- [ ] Test form assignment (check inbox)
- [ ] Test password reset (once frontend ready)

---

## 🐛 Troubleshooting

**Emails not sending?**
1. Check `.env` has correct `EMAIL_PASS` (no spaces)
2. Verify 2-Step Verification is enabled
3. Check backend console for errors
4. Verify employees have email addresses

**"Less secure app access" error?**
- Use App Password instead (see Step 1)
- Don't use your actual Gmail password

**Emails going to spam?**
- Normal for testing
- Check spam folder
- For production, use dedicated email service

---

## 💡 Current Configuration

**Sender**: nityamhjn05@gmail.com (Feedback System)
**Recipients**: All employees (set to nityamhjn05@gmail.com for testing)
**Service**: Gmail SMTP

**Email Templates**:
1. Form Assignment Notification
2. Password Reset Request
3. Password Reset Success Confirmation

All emails use professional HTML templates with branding!
