# 📧 Email Setup - Quick Guide

## ⚡ Quick Start (3 Steps)

### Step 1: Get Gmail App Password

1. Login to Gmail: **nityamhjn05@gmail.com**
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Copy the 16-character password

### Step 2: Update .env File

Edit `backend/.env`:
```bash
EMAIL_PASS=ejwz uvrb skfa ubkk  # Paste your app password (no spaces)
```

### Step 3: Update Employee Emails & Restart

```bash
cd backend
npm run update-emails  # Sets all employees to nityamhjn05@gmail.com
npm run dev  # Restart server
```

---

## ✅ Test Email Sending

### Test 1: Form Assignment Email

1. Login as admin (EMP001 / Admin@123)
2. Create a new form
3. Assign to employees
4. **Check inbox**: nityamhjn05@gmail.com

### Test 2: Password Reset Email

1. Request password reset
2. **Check inbox**: nityamhjn05@gmail.com
3. Click reset link
4. Set new password

---

## 🔧 Current Configuration

**Sender**: nityamhjn05@gmail.com  
**Recipients**: All employees (nityamhjn05@gmail.com for testing)  
**Service**: Gmail SMTP

---

## 🐛 Troubleshooting

**No emails received?**
- Check spam folder
- Verify `EMAIL_PASS` in `.env` (no spaces)
- Check backend console for errors
- Ensure 2-Step Verification enabled on Gmail

**"Invalid credentials" error?**
- Use App Password, not regular password
- Remove spaces from app password
- Restart backend after updating `.env`

---

## 📝 What Happens

When admin assigns a form:
```
1. Admin creates form
2. Admin assigns to employees
3. Email sent FROM: nityamhjn05@gmail.com
           TO: nityamhjn05@gmail.com (for testing)
4. Check inbox for notification
```

---

## 🎯 Next Steps

After testing works:
1. Update employee emails to real addresses
2. Consider using SendGrid/AWS SES for production
3. Implement per-admin email sending (future)
