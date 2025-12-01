# 🚀 Deployment Guide for Cogworks

This guide will help you deploy Cogworks to Render.com for FREE!

## Prerequisites

1. A GitHub account
2. A Render.com account (sign up at https://render.com)
3. Your code pushed to a GitHub repository

## Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
cd /Users/theworkmachine/Codes/antigravity/Cogworks

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Cogworks chat app"

# Create a new repository on GitHub (via web interface), then:
git remote add origin https://github.com/YOUR_USERNAME/cogworks.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy on Render (Automatic with Blueprint)

### Option A: One-Click Blueprint Deploy (Recommended)

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" button
   - Select "Blueprint"

2. **Connect Repository**
   - Connect your GitHub account if not already connected
   - Select the `cogworks` repository
   - Click "Connect"

3. **Deploy**
   - Render will automatically detect the `render.yaml` file
   - It will create 3 services:
     - `cogworks-api` (Backend)
     - `cogworks-client` (Frontend)
     - `cogworks-db` (PostgreSQL Database)
   - Click "Apply" to start deployment
   - Wait 5-10 minutes for deployment to complete

4. **Access Your App**
   - Your frontend will be at: `https://cogworks-client.onrender.com`
   - Your API will be at: `https://cogworks-api.onrender.com`

### Option B: Manual Deploy

If the blueprint doesn't work, follow these steps:

#### 1. Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name: `cogworks-db`
3. Database: `cogworks`
4. User: `cogworks`
5. Region: Oregon (Free)
6. Instance Type: Free
7. Click "Create Database"
8. **Copy the Internal Database URL** (you'll need this)

#### 2. Create Backend Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `cogworks-api`
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Root Directory**: leave blank
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: Free

4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (paste the Internal Database URL from step 1)
   - `CLIENT_URL` = `https://cogworks-client.onrender.com`
   - `JWT_SECRET` = (generate a random string, like `your-super-secret-jwt-key-change-me-12345`)
   - `PORT` = `5000`

5. Click "Create Web Service"

#### 3. Create Frontend Static Site

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `cogworks-client`
   - **Region**: Oregon (Free)  
   - **Branch**: `main`
   - **Root Directory**: leave blank
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

4. Add Environment Variable:
   - `VITE_API_URL` = `https://cogworks-api.onrender.com/api`

5. Click "Create Static Site"

## Step 3: Wait for Deployment

- Backend takes ~5 minutes
- Frontend takes ~3 minutes
- Database is instant

Watch the logs in each service to monitor progress.

## Step 4: Test Your Deployment

1. Visit your frontend URL: `https://cogworks-client.onrender.com`
2. Register a new account
3. Login
4. Test the features:
   - Send messages
   - Create notes
   - Change password

## Troubleshooting

### Backend fails to start

**Issue**: Database connection error

**Solution**: 
- Check that `DATABASE_URL` is set correctly in backend environment variables
- Use the **Internal Database URL** from the database settings

### Frontend can't connect to backend

**Issue**: CORS or API connection errors

**Solution**:
- Verify `VITE_API_URL` in frontend environment variables
- Should be: `https://cogworks-api.onrender.com/api` (with `/api`)
- Verify `CLIENT_URL` in backend environment variables
- Should be: `https://cogworks-client.onrender.com` (no `/api`)

### WebSocket not connecting

**Issue**: Real-time features don't work

**Solution**:
- WebSockets should work automatically on Render
- Check browser console for errors
- Ensure the Socket URL derives correctly from `VITE_API_URL`

### Free tier limitations

**Note**: Render's free tier:
- ✅ Unlimited bandwidth
- ✅ Auto SSL certificates
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes ~30 seconds

## Important URLs

After deployment, save these URLs:

- **Frontend (Your App)**: `https://cogworks-client.onrender.com`
- **Backend API**: `https://cogworks-api.onrender.com/api`
- **API Health Check**: `https://cogworks-api.onrender.com/api/health`

## Updating Your Deployment

When you want to deploy updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically rebuild and redeploy! 🎉

## Custom Domain (Optional)

To use your own domain:

1. Go to your static site settings on Render
2. Click "Custom Domains"
3. Add your domain
4. Update your DNS records as instructed
5. Render provides free SSL certificates!

## Cost

Everything is **100% FREE** on Render's free tier! 🎉

If you need more performance:
- Upgrade to paid tier: $7/month for backend
- Database upgrade: $7/month
- Frontend static site stays free

---

## Need Help?

If you run into issues:
1. Check Render's logs for each service
2. Verify all environment variables are correct
3. Check the troubleshooting section above
4. Review Render's documentation: https://render.com/docs

Happy deploying! 🚀
