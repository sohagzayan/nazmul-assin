# Vercel Deployment Guide

## Quick Fix for Production 500 Error

The 500 error you're seeing is most likely due to:
1. Missing or incorrect environment variables
2. Database connection issues
3. Prisma client not being generated

## Required Steps:

### 1. Verify Environment Variables Format

Go to **Settings → Environment Variables** in Vercel and verify:

#### DATABASE_URL Format (CRITICAL)
Your DATABASE_URL must include the **database name**. The format should be:

```
mongodb+srv://webdevnazmulh_db_user:63huEUJhNt0LiO5v@cluster0.wml7okx.mongodb.net/task_management?retryWrites=true&w=majority
```

**Important:** Notice `/task_management` before the `?` - this is the database name. If your connection string doesn't have a database name, add it!

**Common mistakes:**
- ❌ `mongodb+srv://...@cluster0.wml7okx.mongodb.net/?appName=Cluster0` (no database name)
- ✅ `mongodb+srv://...@cluster0.wml7okx.mongodb.net/task_management?retryWrites=true&w=majority` (has database name)

#### JWT_SECRET
Make sure this is set to a secure random string (minimum 32 characters).

### 2. Verify MongoDB Atlas Access
Make sure your MongoDB Atlas cluster allows connections from anywhere:
- Go to MongoDB Atlas → Network Access
- Add IP Address: `0.0.0.0/0` (allows all IPs, including Vercel)
- If you see "IP Access List is empty", click "Add IP Address" → "Allow Access from Anywhere"

### 3. Check Vercel Build Logs
1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Check the **Build Logs** for any Prisma generation errors
4. Look for errors like:
   - "Prisma Client has not been generated"
   - "Cannot find module '../generated/prisma/client'"
   - Database connection errors

### 4. Redeploy
After fixing the DATABASE_URL format:
- Go to **Deployments** tab
- Click the three dots (⋯) on the latest deployment
- Click **Redeploy**

## Testing

After redeploying, try logging in again. The error should be resolved.

## Debugging Steps

### Step 1: Check Health Endpoint
Visit: `https://nazmul-assin.vercel.app/api/health`

This will show you:
- If environment variables are set
- If DATABASE_URL has the correct format
- If Prisma client can connect to the database

### Step 2: Check Vercel Function Logs
1. Go to **Deployments** → Click on latest deployment
2. Click on **Functions** tab
3. Click on `/api/auth/login`
4. Try logging in, then check the **Logs** tab
5. Look for `[LOGIN ERROR]` entries with full error details

### Step 3: Check Build Logs
1. Go to **Deployments** → Click on latest deployment
2. Check **Build Logs** for:
   - "Generated Prisma Client" message
   - Any Prisma generation errors
   - Environment variable warnings

### Step 4: Verify Common Issues

**DATABASE_URL Format:**
- ✅ Must include database name: `mongodb+srv://...@cluster.net/task_management?...`
- ❌ Missing database name: `mongodb+srv://...@cluster.net/?appName=...`

**MongoDB Atlas Network Access:**
- Go to MongoDB Atlas → Network Access
- Must have `0.0.0.0/0` (Allow Access from Anywhere) or specific Vercel IPs

**Environment Variables:**
- `DATABASE_URL` - Must be set and include database name
- `JWT_SECRET` - Must be set (minimum 32 characters recommended)

### Step 5: Test Locally with Production DATABASE_URL
1. Copy your production `DATABASE_URL` from Vercel
2. Set it in your local `.env.local`
3. Run `npm run dev` and test login
4. If it works locally but not in production, it's likely a network/IP whitelist issue

