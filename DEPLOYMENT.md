# Deployment Guide - Render with Docker

This guide walks you through deploying the Feedback System to Render using Docker.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your local machine
- A [Render](https://render.com) account (free tier available)
- A Git repository (GitHub, GitLab, or Bitbucket)
- MongoDB Atlas account (or other MongoDB hosting)
- SendGrid account for email functionality

---

## Part 1: Local Docker Testing

### Step 1: Build the Docker Image

```bash
cd /Users/amitmahajan/feedback-system
docker build -t feedback-system .
```

This will:
- Build your React frontend
- Set up the Node.js backend
- Copy the built frontend to be served by the backend

### Step 2: Test Locally with Docker

**Option A: Using your existing MongoDB (recommended for quick test)**

```bash
docker run -p 5000:5000 \
  -e MONGO_URI="your_mongodb_uri_here" \
  -e JWT_SECRET="supersecret_jwt_key" \
  -e SENDGRID_API_KEY="your_sendgrid_key" \
  -e EMAIL_FROM="Your App <noreply@yourdomain.com>" \
  -e FRONTEND_URL="http://localhost:5000" \
  -e NODE_ENV="production" \
  feedback-system
```

**Option B: Using Docker Compose (includes local MongoDB)**

```bash
docker-compose up
```

### Step 3: Verify Local Deployment

Open your browser and navigate to:
- **Application**: http://localhost:5000
- The backend will serve both API endpoints and the React frontend

Test:
- Login functionality
- Dashboard access
- API endpoints

---

## Part 2: Git Repository Setup

### Step 1: Initialize Git Repository (if not already done)

```bash
cd /Users/amitmahajan/feedback-system
git init
```

### Step 2: Add Files to Git

```bash
# Add all files (sensitive files are excluded by .gitignore)
git add .

# Commit the changes
git commit -m "Initial commit - Docker deployment setup"
```

### Step 3: Create Remote Repository

1. Go to [GitHub](https://github.com), [GitLab](https://gitlab.com), or [Bitbucket](https://bitbucket.org)
2. Create a new repository (e.g., `feedback-system`)
3. **Do NOT initialize with README** (you already have files)

### Step 4: Push to Remote Repository

**For GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/feedback-system.git
git branch -M main
git push -u origin main
```

**For GitLab:**
```bash
git remote add origin https://gitlab.com/YOUR_USERNAME/feedback-system.git
git branch -M main
git push -u origin main
```

---

## Part 3: Render Deployment

### Step 1: Create New Web Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository:
   - Click **"Connect account"** for GitHub/GitLab/Bitbucket
   - Authorize Render to access your repositories
   - Select your `feedback-system` repository

### Step 2: Configure the Web Service

Fill in the following settings:

| Field | Value |
|-------|-------|
| **Name** | `feedback-system` (or your preferred name) |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | Leave empty |
| **Runtime** | `Docker` |
| **Instance Type** | `Free` (or paid tier for better performance) |

### Step 3: Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your_secret_key_here` | Strong random string (32+ characters) |
| `SENDGRID_API_KEY` | `SG.xxxxx` | Your SendGrid API key |
| `EMAIL_FROM` | `"App Name <noreply@domain.com>"` | Must be verified in SendGrid |
| `FRONTEND_URL` | `https://your-app.onrender.com` | Will be provided after creation |
| `NODE_ENV` | `production` | Set to production |
| `PORT` | `5000` | Port number (Render will auto-detect) |

> **Note**: After creating the service, Render will provide you with a URL like `https://feedback-system-xxxx.onrender.com`. Update the `FRONTEND_URL` environment variable with this URL.

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Build the Docker image
   - Deploy the container
   - Assign a public URL

### Step 5: Update FRONTEND_URL

1. Once deployed, copy your Render URL (e.g., `https://feedback-system-xxxx.onrender.com`)
2. Go to **Environment** tab in Render dashboard
3. Update `FRONTEND_URL` to your Render URL
4. Click **"Save Changes"** (this will trigger a redeploy)

---

## Part 4: Post-Deployment Configuration

### Update CORS Settings (if needed)

If you encounter CORS issues, update `backend/server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Create Initial Admin User

After deployment, you'll need to create an admin user. You can:

**Option 1: Use Render Shell**
1. Go to your service in Render dashboard
2. Click **"Shell"** tab
3. Run: `node scripts/createAdmin.js`

**Option 2: Connect to MongoDB directly**
Use MongoDB Compass or the MongoDB Atlas interface to manually create an admin user.

---

## Part 5: Verification & Testing

### Test Your Deployed Application

1. **Visit your app**: `https://your-app.onrender.com`
2. **Test login**: Try logging in with your credentials
3. **Test API endpoints**: Verify all functionality works
4. **Check email**: Test password reset and notification emails
5. **Monitor logs**: Check Render logs for any errors

### View Logs

In Render dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. Monitor for errors or issues

---

## Troubleshooting

### Build Fails

**Issue**: Docker build fails
- Check Render logs for specific error
- Verify all dependencies are in `package.json`
- Ensure `Dockerfile` syntax is correct

### Application Won't Start

**Issue**: Service starts but crashes
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check logs for specific errors

### Frontend Not Loading

**Issue**: API works but frontend shows 404
- Verify `NODE_ENV=production` is set
- Check that frontend build completed successfully
- Verify `server.js` has static file serving code

### Database Connection Fails

**Issue**: Cannot connect to MongoDB
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas network access (allow all IPs: `0.0.0.0/0`)
- Ensure database user has correct permissions

### Email Not Sending

**Issue**: Emails not being sent
- Verify SendGrid API key is valid
- Check that sender email is verified in SendGrid
- Review SendGrid activity logs

---

## Updating Your Application

### Deploy Updates

1. Make changes to your code locally
2. Commit and push to Git:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. Render will automatically detect the push and redeploy

### Manual Deploy

In Render dashboard:
1. Go to your service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Cost Optimization

### Free Tier Limitations

Render's free tier:
- ✅ 750 hours/month (enough for one service)
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold starts take 30-60 seconds

### Upgrade Options

For production use, consider:
- **Starter ($7/month)**: No spin-down, better performance
- **Standard ($25/month)**: More resources, better for high traffic

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files to Git
2. **JWT Secret**: Use a strong, random string (32+ characters)
3. **MongoDB**: Use MongoDB Atlas with IP whitelisting
4. **HTTPS**: Render provides free SSL certificates
5. **API Keys**: Rotate SendGrid API keys periodically

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [SendGrid Documentation](https://docs.sendgrid.com/)

---

## Quick Reference Commands

```bash
# Build Docker image
docker build -t feedback-system .

# Run locally
docker run -p 5000:5000 --env-file backend/.env feedback-system

# Run with Docker Compose
docker-compose up

# Git commands
git add .
git commit -m "message"
git push origin main

# View Docker logs
docker logs <container_id>

# Stop Docker container
docker stop <container_id>
```

---

## Support

If you encounter issues:
1. Check Render logs first
2. Verify all environment variables
3. Test Docker build locally
4. Review MongoDB connection
5. Check SendGrid configuration
