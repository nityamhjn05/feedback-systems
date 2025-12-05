# Vercel Deployment Guide

This guide explains how to deploy the Feedback Hub application to Vercel.

## Overview

Vercel deployment strategy:
- **Frontend**: Deployed as static React build
- **Backend**: Deployed as serverless Node.js functions

## Prerequisites

1. [Vercel Account](https://vercel.com/signup) (free tier available)
2. Vercel CLI installed: `npm install -g vercel`
3. Git repository pushed to GitHub

---

## Deployment Steps

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/dashboard

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your Git repository: `nityamhjn05/feedback-systems`
   - Vercel will auto-detect the configuration

3. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: Leave default or use `npm run build`
   - **Output Directory**: Leave default

4. **Environment Variables**:
   Click "Environment Variables" and add:
   ```
   MONGO_URI = mongodb+srv://nitya:Ritu%40100@feedback-system.jwtl302.mongodb.net/feedbackDB?retryWrites=true&w=majority
   JWT_SECRET = supersecret_jwt_key_change_this
   SENDGRID_API_KEY = your_sendgrid_api_key
   EMAIL_FROM = "Feedback Hub <admin@yourdomain.com>"
   FRONTEND_URL = https://your-app.vercel.app
   NODE_ENV = production
   PORT = 5000
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your Vercel URL

6. **Update FRONTEND_URL**:
   - Go to Settings → Environment Variables
   - Update `FRONTEND_URL` with your Vercel URL
   - Redeploy

### Step 3: Deploy via CLI (Alternative)

```bash
# Navigate to project
cd /Users/amitmahajan/feedback-system

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? feedback-hub
# - Directory? ./
# - Override settings? No

# Production deployment
vercel --prod
```

---

## Important Notes

### Vercel Limitations

⚠️ **Serverless Functions**: Vercel runs backend as serverless functions with:
- 10-second execution limit (Hobby plan)
- 50-second limit (Pro plan)
- Cold starts on first request

⚠️ **Better Alternative**: Deploy frontend on Vercel, backend elsewhere

---

## Recommended Deployment Strategy

For better performance, consider split deployment:

### Option A: Frontend on Vercel + Backend on Render

**Frontend (Vercel)**:
1. Deploy only the `frontend` directory to Vercel
2. Fast, free hosting for React app
3. Excellent CDN and performance

**Backend (Render)**:
1. Deploy backend separately on Render
2. Always-on server (no cold starts)
3. Better for long-running processes

### Option B: Full Stack on Railway

Railway supports full-stack apps better than Vercel for this use case.

---

## Configuration Files

### vercel.json
Configures Vercel deployment with routes for API and frontend.

### Frontend Build Script
Add to `frontend/package.json`:
```json
{
  "scripts": {
    "vercel-build": "react-scripts build"
  }
}
```

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all dependencies in package.json
- Ensure Node version compatibility

### API Routes Not Working
- Verify routes in vercel.json
- Check environment variables are set
- Review function logs in Vercel dashboard

### Frontend Not Loading
- Check build output directory
- Verify static files are generated
- Check browser console for errors

---

## Post-Deployment

1. **Test the application**: Visit your Vercel URL
2. **Update API URL**: If using split deployment, update frontend API calls
3. **Monitor**: Check Vercel Analytics and Logs
4. **Custom Domain**: Add custom domain in Vercel settings (optional)

---

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Production**: Pushes to `main` branch
- **Preview**: Pushes to other branches

---

## Cost

**Vercel Hobby (Free)**:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions
- ⚠️ 10s function timeout

**Vercel Pro ($20/month)**:
- ✅ 1TB bandwidth
- ✅ 50s function timeout
- ✅ Better performance

---

## Alternative: Split Deployment

I recommend deploying:
- **Frontend**: Vercel (free, fast)
- **Backend**: Railway or Render (better for APIs)

Would you like me to set this up instead?
