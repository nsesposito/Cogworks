# 🚀 Simple Deployment Guide - Manual Setup (Recommended)

Since Render's Blueprint YAML can be finicky, here's the **EASIER manual setup** method:

## Step 1: Push to GitHub First

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/cogworks.git
git push -u origin main
```

## Step 2: Create Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Settings:
   - **Name**: `cogworks-db`
   - **Database**: `cogworks`
   - **User**: `cogworks`
   - **Plan**: **Free**
4. Click **"Create Database"**
5. **IMPORTANT**: Copy the **"Internal Database URL"** (you'll need this in a moment)

## Step 3: Deploy Backend API

1. Click **"New +"** → **"Web Service"**
2. **Connect your GitHub repository** (authorize if needed)
3. Select the `cogworks` repository
4. Configure:

**Basic Settings:**
- **Name**: `cogworks-api`
- **Region**: Pick any (I recommend Oregon)
- **Branch**: `main`
- **Root Directory**: (leave blank)
- **Runtime**: `Node`

**Build & Start Commands:**
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`

**Instance Type:**
- Select **"Free"**

**Environment Variables** - Click "Add Environment Variable" for each:
- `NODE_ENV` = `production`
- `DATABASE_URL` = **(paste the Internal Database URL from Step 2)**
- `CLIENT_URL` = `https://cogworks-client.onrender.com`
- `JWT_SECRET` = `cogworks-super-secret-key-123456-change-me`
- `PORT` = `5000`

5. Click **"Create Web Service"**
6. Wait for it to deploy (~5 minutes)
7. **Copy your API URL** (looks like: `https://cogworks-api.onrender.com`)

## Step 4: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Select your `cogworks` repository
3. Configure:

**Basic Settings:**
- **Name**: `cogworks-client`
- **Branch**: `main`
- **Root Directory**: (leave blank)

**Build Settings:**
- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `client/dist`

**Environment Variables:**
- `VITE_API_URL` = `https://cogworks-api.onrender.com/api` 
  *(Use the URL from Step 3, and add `/api` at the end)*

4. Click **"Create Static Site"**
5. Wait for it to deploy (~3 minutes)

## Step 5: Update Backend Environment Variable

Now that you have the actual frontend URL:

1. Go back to your **cogworks-api** service
2. Go to **"Environment"** tab
3. Update **`CLIENT_URL`** to your actual frontend URL
   - Should be something like: `https://cogworks-client.onrender.com`
4. Click **"Save Changes"**
5. Service will auto-redeploy

## Step 6: Test Your App! 🎉

1. Go to your frontend URL (from Step 4)
2. Register a new account
3. Test all features:
   - ✅ Login/Register
   - ✅ Send messages
   - ✅ Create notes  
   - ✅ Change password

## ⏱️ Deployment Timeline

- Database: Instant
- Backend: ~5 minutes
- Frontend: ~3 minutes
- **Total: ~10 minutes**

## 🔧 Troubleshooting

### Backend won't start?

**Check the logs** in Render dashboard. Common issues:
- ❌ Wrong DATABASE_URL → Copy the **Internal** URL, not External
- ❌ Forgot to add all environment variables

### Frontend can't connect to backend?

- ✅ Make sure `VITE_API_URL` ends with `/api`
- ✅ Example: `https://cogworks-api.onrender.com/api` ← notice the `/api`
- ✅ Make sure backend `CLIENT_URL` does NOT end with `/api`
- ✅ Example: `https://cogworks-client.onrender.com` ← no `/api`

### Database connection error?

- Wait 1-2 minutes for database to finish provisioning
- Verify you used the **Internal Database URL**

### App is slow first time?

- ✅ Normal! Free tier apps "sleep" after 15 min
- ✅ First request takes ~30 seconds to wake up
- ✅ After that, it's fast!

## 📝 Your Final URLs

Save these:
- **Your App**: `https://cogworks-client.onrender.com` (or whatever yours is)
- **API**: `https://cogworks-api.onrender.com`
- **Health Check**: `https://cogworks-api.onrender.com/api/health`

## 🔄 Updating Your App

To deploy updates:

```bash
git add .
git commit -m "Your update description"
git push
```

Render will automatically rebuild and redeploy! 

## 💡 Pro Tips

1. **Check Health**: Visit `https://your-api.onrender.com/api/health` to verify backend
2. **View Logs**: Render dashboard shows real-time logs for debugging
3. **Free SSL**: All Render apps get free HTTPS automatically
4. **Custom Domain**: You can add your own domain in settings

---

That's it! This manual method is more reliable than Blueprint. Follow these steps and you'll be live in ~10 minutes! 🚀
