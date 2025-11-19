This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Create a `.env.local` file in the project root before running the app. It should define the database connection string for Prisma as well as the demo credentials shown in the login screen:

```
DATABASE_URL="mongodb://127.0.0.1:27017/task_management"
NEXT_PUBLIC_DEMO_ADMIN_USERNAME="admin"
NEXT_PUBLIC_DEMO_ADMIN_EMAIL="admin@taskmanager.com"
NEXT_PUBLIC_DEMO_ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_DEMO_USER_USERNAME="john"
NEXT_PUBLIC_DEMO_USER_EMAIL="john@taskmanager.com"
NEXT_PUBLIC_DEMO_USER_PASSWORD="john123"
JWT_SECRET="task-manager-secret-key"
```

Update these values to match your local or hosted services.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Step-by-Step Vercel Deployment

1. **Push your code to GitHub** (if not already done)
   ```bash
   git push origin main
   ```

2. **Import your project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Environment Variables** (CRITICAL)
   
   In your Vercel project settings, go to **Settings → Environment Variables** and add the following:
   
   **Required Variables:**
   - `DATABASE_URL` - Your MongoDB connection string
     - Example: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
     - For MongoDB Atlas, use the connection string from your cluster
   - `JWT_SECRET` - A secure random string for JWT token signing
     - Generate a strong secret: `openssl rand -base64 32`
     - Or use any long random string (minimum 32 characters recommended)
   
   **Optional Variables (for demo credentials):**
   - `NEXT_PUBLIC_DEMO_ADMIN_USERNAME` - Default: `admin`
   - `NEXT_PUBLIC_DEMO_ADMIN_EMAIL` - Default: `admin@taskmanager.com`
   - `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD` - Default: `admin123`
   - `NEXT_PUBLIC_DEMO_USER_USERNAME` - Default: `john`
   - `NEXT_PUBLIC_DEMO_USER_EMAIL` - Default: `john@taskmanager.com`
   - `NEXT_PUBLIC_DEMO_USER_PASSWORD` - Default: `john123`

4. **Deploy**
   - Vercel will automatically detect Next.js and build your project
   - The build process will run `prisma generate` automatically (via postinstall script)
   - After deployment, your app will be live!

5. **Troubleshooting**
   
   If you see a 500 error on login:
   - ✅ Check that `DATABASE_URL` is set correctly in Vercel
   - ✅ Check that `JWT_SECRET` is set in Vercel
   - ✅ Verify your MongoDB connection string is accessible from the internet (for MongoDB Atlas, ensure your IP is whitelisted or use 0.0.0.0/0 for all IPs)
   - ✅ Check Vercel deployment logs for specific error messages
   - ✅ Ensure Prisma Client is generated (check build logs)

### MongoDB Atlas Setup (if using cloud MongoDB)

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (add `0.0.0.0/0` for Vercel deployments)
4. Get your connection string and use it as `DATABASE_URL`

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
