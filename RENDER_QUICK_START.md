# Quick Start - Render Deployment

## 🚀 Fast Track to Deployment

### Step 1: Push to Git (5 minutes)

```bash
# Navigate to project
cd /Users/amitmahajan/feedback-system

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Render deployment"

# Add your remote repository (create on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/feedback-system.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render (10 minutes)

1. **Go to Render**: https://dashboard.render.com/
2. **New Web Service**: Click "New +" → "Web Service"
3. **Connect Git**: Connect your GitHub/GitLab account and select your repository
4. **Configure**:
   - Name: `feedback-system`
   - Runtime: **Docker**
   - Branch: `main`
   - Instance: `Free`

5. **Add Environment Variables** (click "Advanced"):
   ```
   MONGO_URI = your_mongodb_connection_string
   JWT_SECRET = your_secret_key_minimum_32_characters
   SENDGRID_API_KEY = SG.your_sendgrid_api_key
   EMAIL_FROM = "Your App <noreply@yourdomain.com>"
   FRONTEND_URL = https://your-app.onrender.com
   NODE_ENV = production
   PORT = 5000
   ```

6. **Deploy**: Click "Create Web Service"

### Step 3: Post-Deployment (5 minutes)

1. **Copy your Render URL** (e.g., `https://feedback-system-xxxx.onrender.com`)
2. **Update FRONTEND_URL**:
   - Go to Environment tab in Render
   - Update `FRONTEND_URL` with your actual URL
   - Save (triggers redeploy)

3. **Create Admin User**:
   - In Render dashboard → Shell tab
   - Run: `node scripts/createAdmin.js`

4. **Test**: Visit your app and log in!

---

## 📋 Environment Variables Checklist

Before deploying, have these ready:

- [ ] MongoDB Atlas connection string
- [ ] Strong JWT secret (generate: `openssl rand -base64 32`)
- [ ] SendGrid API key
- [ ] Verified sender email in SendGrid
- [ ] Render account created

---

## 🔍 Quick Troubleshooting

**Build fails?**
→ Check Render logs for npm errors

**Frontend 404?**
→ Verify `NODE_ENV=production` is set

**Can't connect to MongoDB?**
→ Allow all IPs in MongoDB Atlas: `0.0.0.0/0`

**Emails not sending?**
→ Verify sender email in SendGrid

---

## 📚 Full Documentation

For detailed instructions, see:
- **[DEPLOYMENT.md](file:///Users/amitmahajan/feedback-system/DEPLOYMENT.md)** - Complete deployment guide
- **[walkthrough.md](file:///Users/amitmahajan/.gemini/antigravity/brain/e3cf6401-29c2-45be-8097-af714bf89d5b/walkthrough.md)** - What was configured

---

## ⚡ Local Testing (Optional)

If you have Docker installed:

```bash
# Build image
docker build -t feedback-system .

# Run (replace with your env vars)
docker run -p 5000:5000 \
  -e MONGO_URI="your_uri" \
  -e JWT_SECRET="your_secret" \
  -e SENDGRID_API_KEY="your_key" \
  -e EMAIL_FROM="Your App <email@domain.com>" \
  -e FRONTEND_URL="http://localhost:5000" \
  -e NODE_ENV="production" \
  feedback-system

# Or use Docker Compose
docker-compose up
```

Visit: http://localhost:5000

---

**Need help?** Check the full [DEPLOYMENT.md](file:///Users/amitmahajan/feedback-system/DEPLOYMENT.md) guide!
