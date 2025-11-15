# Tournament Manager - Supabase Deployment Guide

## 🚀 Deploy Your Tournament Manager to Supabase

### Prerequisites
- Supabase account (sign up at https://supabase.com)
- GitHub account (for deployment)

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project name: `tournament-manager`
5. Enter database password (save this!)
6. Select region closest to your users
7. Click "Create new project"

### Step 2: Setup Database

1. In your Supabase project, go to **SQL Editor**
2. Copy and paste the entire contents of `supabase-setup.sql`
3. Click "Run" to create all tables and indexes

### Step 3: Get Database Connection String

1. Go to **Settings** → **Database**
2. Copy the **Connection string** (not the URI)
3. It should look like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Step 4: Deploy to Railway (Recommended)

Railway offers simple Node.js deployment with environment variables.

#### 4.1 Setup Railway

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository with the tournament manager code
4. Wait for deployment to complete

#### 4.2 Configure Environment Variables

1. In your Railway project, go to **Variables** tab
2. Add these variables:
   - `SUPABASE_DB_URL`: Your Supabase connection string
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (or let Railway assign)

#### 4.3 Deploy

1. Railway will automatically redeploy when you push changes
2. Your app will be available at `https://[project-name].railway.app`

### Alternative Deployment Options

#### Option A: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Add environment variables in Vercel dashboard
4. Deploy with `vercel --prod`

#### Option B: Render

1. Go to https://render.com and connect GitHub
2. Create new **Web Service**
3. Connect your repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables in dashboard

### Step 5: Test Your Deployment

1. Open your deployed app URL
2. Try signing up with a new account
3. Create a tournament
4. Join with another account
5. Verify everything works correctly

### Environment Variables Reference

```
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
NODE_ENV=production
PORT=3000
```

### Troubleshooting

**Database Connection Errors:**
- Verify your SUPABASE_DB_URL is correct
- Check that the database setup SQL ran successfully
- Ensure your Supabase project is active

**Build Errors:**
- Run `npm install` locally to check for missing dependencies
- Verify all files are committed to Git

**Runtime Errors:**
- Check the deployment platform's logs
- Ensure PORT environment variable is set
- Verify your environment variables are correctly configured

### File Structure for Deployment

```
tournament-manager/
├── backend/
│   ├── server.js              # Main server file
│   ├── database-supabase.js   # Supabase database connection
│   └── package.json
├── frontend/                  # Static HTML/CSS/JS files
├── supabase-setup.sql        # Database setup script
├── .env.example              # Environment variables template
└── package.json              # Main package.json
```

### Production Considerations

1. **Security**: The SQL setup includes basic RLS policies. Consider implementing proper authentication for production
2. **Performance**: Add database connection pooling and caching as needed
3. **Monitoring**: Set up error tracking and performance monitoring
4. **Backups**: Supabase provides automatic backups, but consider additional backup strategies
5. **Scaling**: Monitor usage and scale resources as needed

### Support

If you encounter issues:
1. Check the deployment platform's logs
2. Verify all environment variables are set correctly
3. Test the database connection manually
4. Check that all required files are included in your deployment

Your tournament manager should now be live and accessible to users worldwide! 🎉