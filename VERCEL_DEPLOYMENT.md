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

If you still see errors:

1. **Check Vercel Function Logs:**
   - Go to **Deployments** → Click on deployment → **Functions** tab
   - Click on the `/api/auth/login` function
   - Check the logs for specific error messages

2. **Verify DATABASE_URL:**
   - Make sure it includes the database name (e.g., `/task_management`)
   - Test the connection string locally if possible

3. **Check Prisma Generation:**
   - Look in build logs for "Generated Prisma Client" message
   - If missing, the `postinstall` script might have failed

4. **Common Issues:**
   - ❌ DATABASE_URL missing database name
   - ❌ MongoDB Atlas IP whitelist not configured
   - ❌ JWT_SECRET not set or too short
   - ❌ Prisma client not generated during build

