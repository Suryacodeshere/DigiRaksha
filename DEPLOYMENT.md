# UPI Guard Deployment Guide

This guide will help you deploy your UPI Guard application to Vercel, Netlify, and GitHub.

## Prerequisites

1. **GitHub Account**: For version control and hosting
2. **Vercel Account**: For deployment
3. **Netlify Account**: For deployment
4. **Firebase Project**: For backend services

## Step 1: GitHub Setup

### 1.1 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: UPI Guard application"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `upi-guard` or your preferred name
3. Don't initialize with README (since you already have files)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/upi-guard.git
git branch -M main
git push -u origin main
```

## Step 2: Firebase Setup

### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Authentication and Realtime Database

### 2.2 Get Firebase Configuration
1. Go to Project Settings > General
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web
4. Copy the configuration object

### 2.3 Update Environment Variables
Create a `.env` file in your project root:
```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 3: Vercel Deployment

### 3.1 Deploy via Vercel Dashboard
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect it's a Vite project

### 3.2 Configure Environment Variables
1. In your Vercel project dashboard
2. Go to Settings > Environment Variables
3. Add each Firebase environment variable:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### 3.3 Deploy
1. Click "Deploy" button
2. Your app will be available at `https://your-project-name.vercel.app`

### 3.4 Deploy via CLI (Alternative)
```bash
npm install -g vercel
vercel login
vercel --prod
```

## Step 4: Netlify Deployment

### 4.1 Deploy via Netlify Dashboard
1. Go to [Netlify](https://netlify.com)
2. Sign in with GitHub
3. Click "New site from Git"
4. Choose your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### 4.2 Configure Environment Variables
1. Go to Site settings > Environment variables
2. Add all Firebase environment variables (same as Vercel)

### 4.3 Deploy
1. Click "Deploy site"
2. Your app will be available at `https://random-name.netlify.app`

### 4.4 Deploy via CLI (Alternative)
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

## Step 5: Custom Domain (Optional)

### 5.1 Vercel Custom Domain
1. Go to your project dashboard
2. Settings > Domains
3. Add your custom domain
4. Follow DNS configuration instructions

### 5.2 Netlify Custom Domain
1. Go to Site settings > Domain management
2. Add custom domain
3. Configure DNS settings

## Step 6: Continuous Deployment

Both Vercel and Netlify will automatically redeploy when you push changes to your main branch.

### 6.1 Workflow
1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Vercel and Netlify will automatically build and deploy

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Ensure all dependencies are in package.json
   - Check build logs in deployment dashboard

2. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check Firebase project settings
   - Ensure Realtime Database rules allow read/write

3. **Environment Variables Not Working**
   - Make sure variables start with `VITE_`
   - Check variable names match exactly
   - Redeploy after adding variables

### Build Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Security Notes

1. **Never commit `.env` file** - it's in `.gitignore`
2. **Use environment variables** for all sensitive data
3. **Configure Firebase security rules** properly
4. **Use HTTPS** in production (handled by Vercel/Netlify)

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify all environment variables
3. Test locally with `npm run build && npm run preview`
4. Check Firebase console for errors

Your UPI Guard application should now be successfully deployed on both Vercel and Netlify! 🚀
