# EduSafe - Deployment Guide

## 🚀 Quick Start Deployment

This guide covers deploying EduSafe (frontend on Vercel + backend on Railway/Render).

---

## 📋 Prerequisites

- Node.js 16+ installed locally
- MongoDB Atlas account (free tier available)
- GitHub account
- Vercel account (free)
- Railway or Render account (for backend)

---

## 🎯 Step 1: Prepare Environment Files

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd EduSafe/backend
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your values:
   ```
   MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/edusafe
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-frontend.vercel.app
   JWT_SECRET=your-random-secret-key
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd EduSafe/frontend
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env`:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

---

## 🌐 Step 2: Deploy Backend (Railway)

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your `AI-ED-TECH-PLATFORM` repository
4. Configure environment variables in Railway dashboard:
   - `MONGO_URI` - Your MongoDB connection string
   - `PORT` - 5000
   - `NODE_ENV` - production
   - `CLIENT_URL` - Your Vercel frontend URL
   - `JWT_SECRET` - Your secret key

5. Railway will automatically deploy and give you a URL like:
   ```
   https://your-app-name.railway.app
   ```

---

## 🎨 Step 3: Deploy Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project" → "Import Git Repository"
3. Select `AI-ED-TECH-PLATFORM` repository
4. Configure project settings:
   - **Framework**: Vite
   - **Root Directory**: `EduSafe/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-railway-url`

6. Click "Deploy" and wait for build to complete

Your frontend will be available at: `https://your-project.vercel.app`

---

## ✅ Step 4: Verify Deployment

### Test Backend Connection
```bash
curl https://your-backend-url/health
```

### Test Frontend
- Open https://your-frontend.vercel.app in browser
- Check browser console for API errors
- Verify API calls are going to correct backend URL

---

## 🔧 Troubleshooting

### "API calls failing with CORS error"
- Backend `CLIENT_URL` in `.env` must match your Vercel frontend URL
- Restart backend after changing env variables

### "Frontend can't connect to backend"
- Verify `VITE_API_URL` is correct in Vercel environment variables
- Make sure backend URL doesn't have trailing slash
- Check if backend is running (visit backend URL in browser)

### "Build fails on Vercel"
- Check Vercel logs for specific error
- Ensure `package.json` exists in `EduSafe/frontend`
- Try rebuilding in Vercel dashboard

### "MongoDB connection error"
- Verify `MONGO_URI` is correct
- Check if your IP is whitelisted in MongoDB Atlas (allow all: 0.0.0.0)
- Test connection locally first before deploying

---

## 📝 Environment Variables Summary

### Backend (.env)
```
MONGO_URI=<your-mongodb-atlas-connection-string>
PORT=5000
NODE_ENV=production
CLIENT_URL=<your-vercel-frontend-url>
JWT_SECRET=<random-secret-key>
```

### Frontend (.env)
```
VITE_API_URL=<your-railway-backend-url>
```

---

## 🚀 Continuous Deployment

Both Vercel and Railway automatically redeploy when you push to main/master branch.

To deploy new changes:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com
