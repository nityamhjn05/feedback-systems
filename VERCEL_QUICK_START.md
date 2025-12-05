# Quick Vercel Deployment

## 🚀 Deploy to Vercel in 5 Minutes

### Step 1: Go to Vercel
Visit: https://vercel.com/new

### Step 2: Import Your Repository
1. Click "Import Git Repository"
2. Select: `nityamhjn05/feedback-systems`
3. Click "Import"

### Step 3: Configure Project
Leave all settings as default:
- **Framework Preset**: Other (auto-detected)
- **Root Directory**: `./`
- **Build Command**: Auto-detected
- **Output Directory**: Auto-detected

### Step 4: Add Environment Variables
Click "Environment Variables" and add these **7 variables**:

```
MONGO_URI
mongodb+srv://nitya:Ritu%40100@feedback-system.jwtl302.mongodb.net/feedbackDB?retryWrites=true&w=majority

JWT_SECRET
supersecret_jwt_key_change_this

SENDGRID_API_KEY
(your SendGrid API key)

EMAIL_FROM
"Feedback Hub <admin@yourdomain.com>"

FRONTEND_URL
https://your-app.vercel.app

NODE_ENV
production

PORT
5000
```

### Step 5: Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Copy your Vercel URL

### Step 6: Update FRONTEND_URL
1. Go to Project Settings → Environment Variables
2. Edit `FRONTEND_URL` to your actual Vercel URL
3. Click "Redeploy" to apply changes

---

## ⚠️ Important Note

**Vercel has limitations for full-stack apps:**
- 10-second timeout for API calls (free tier)
- Serverless functions (cold starts)
- Not ideal for long-running processes

**Better Alternative:**
I recommend deploying:
- **Frontend on Vercel** (fast, free, excellent CDN)
- **Backend on Railway or Render** (better for APIs, no timeouts)

Would you like me to set up this split deployment instead? It will give you:
- ✅ Faster performance
- ✅ No timeout issues
- ✅ Better reliability
- ✅ Still mostly free

Let me know!
