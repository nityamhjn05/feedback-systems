# 📧 Switching to SendGrid

## Why SendGrid?
- **Better Deliverability**: Emails less likely to go to spam.
- **No Password Sharing**: Uses API Key instead of email password.
- **Verified Sender**: Send from `admin@company.com` or `noreply@company.com`.
- **Analytics**: Track opens, clicks, and bounces.

## 🚀 Migration Steps

### Step 1: Choose Verification Method

**Option A: Single Sender (Easiest, but limited)**
- Verify ONE email (e.g., `admin@company.com`).
- All emails must come FROM this address.
- Use **Reply-To** headers to direct replies to different people (we implemented this!).

**Option B: Domain Authentication (Recommended for Scale)**
- Verify your entire domain (e.g., `@company.com`).
- Allows you to send FROM `any-name@company.com`.
- ⚠️ **Note**: You CANNOT verify public domains like `gmail.com`, `yahoo.com`, etc. You must own the domain (e.g., `my-startup.com`).
- **How to do it**:
  1. Go to **Settings** → **Sender Authentication**.
  2. Click **Authenticate Your Domain**.
  3. Add the CNAME records to your DNS provider (GoDaddy, AWS, etc.).
  4. Once verified, you can send as `admin1@company.com`, `admin2@company.com`, etc.

### Step 2: Generate API Key
1. Go to **Settings** → **API Keys**.
2. Click **Create API Key**.
3. Name it "Feedback System".
4. Select **Full Access** (or Restricted with Mail Send).
5. **Copy the API Key** (starts with `SG.`).

### Step 3: Update `.env` File

Open `backend/.env` and update the email section:

```bash
# Comment out Gmail config
# EMAIL_SERVICE=gmail
# EMAIL_USER=...
# EMAIL_PASS=...

# Enable SendGrid
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Your Verified Sender <admin@yourcompany.com>"
```

### Step 4: Restart Server

```bash
cd backend
# Stop server (Ctrl+C)
npm run dev
```

---

## ✅ Admin Notifications (New Feature)

We have also enabled **Admin Notifications**!

**How it works**:
1. User submits a form.
2. System identifies the Admin who created the form.
3. System sends an email to that Admin:
   - **Subject**: "New Response: [Form Title]"
   - **Content**: Submitter name, time, and link to view response.

**Note**: This works with BOTH Gmail and SendGrid!
