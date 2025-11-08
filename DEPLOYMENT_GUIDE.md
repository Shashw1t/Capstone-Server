# 🚀 Complete Deployment Guide - Separate Repositories

## Overview
This guide walks you through deploying the GeeksforGeeks Clone with separate repositories for frontend and backend.

---

## 📦 **PART 1: Backend Deployment**

### **Step 1: Create Backend GitHub Repository**

1. Go to https://github.com/new
2. **Repository name**: `gfgclone-backend`
3. **Description**: "Backend API for GeeksforGeeks Clone"
4. **Visibility**: Public (or Private)
5. **DO NOT** check "Initialize with README" (we already have files)
6. Click **"Create repository"**

### **Step 2: Push Backend Code**

You're currently in the `gfgclone-backend` folder. Run these commands:

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial backend commit"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/gfgclone-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### **Step 3: Deploy Backend to Render**

1. Go to https://render.com/ and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select **`gfgclone-backend`** repository
5. Configure:
   - **Name**: `gfgclone-backend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (since entire repo is backend)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for deployment
8. **Copy your backend URL**: `https://gfgclone-backend-xxxx.onrender.com`

**⚠️ Important Note:** Render's free tier has security restrictions that prevent running user code (C++, Java, Python compilation). You'll need to:
- Use Judge0 API for code execution (recommended)
- Or upgrade to a paid plan with Docker support

---

## 📦 **PART 2: Frontend Deployment**

### **Step 1: Update Current Repository**

Go back to your original project:

```powershell
cd C:\Users\shash\OneDrive\Desktop\PROJECTS\gfgclone
```

### **Step 2: Remove Backend Folder from Frontend Repo**

```powershell
# Remove backend folder
Remove-Item -Recurse -Force backend

# Stage the deletion
git add -A

# Commit
git commit -m "Remove backend - moved to separate repository"
```

### **Step 3: Create Environment Variable File**

Create `.env` file in root:

```env
VITE_API_URL=http://localhost:3001
```

Create `.env.production` file in root:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

**Replace `your-backend-url` with your actual Render backend URL!**

### **Step 4: Update Frontend Code to Use Environment Variables**

Update `src/pages/ProblemSolver.jsx` - find all `http://localhost:3001` and replace with:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

Then use `${API_URL}/compile` instead of hardcoded URLs.

### **Step 5: Update .gitignore**

Make sure `.env` is in `.gitignore`:

```
# Environment variables
.env
.env.local
```

### **Step 6: Push Frontend Changes**

```powershell
git add .
git commit -m "Add environment variables for API URL"
git push origin main
```

### **Step 7: Deploy Frontend to Vercel**

1. Go to https://vercel.com/ and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your **`Capstone`** repository
4. Vercel auto-detects Vite settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables** - Click "Add" and enter:
   ```
   Key: VITE_API_URL
   Value: https://your-backend-url.onrender.com
   ```

6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Get your URL: `https://your-project.vercel.app`

---

## 📦 **PART 3: Connect Frontend & Backend**

### **Update Backend CORS**

After getting your Vercel URL, update backend `server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://your-project.vercel.app',  // Add your Vercel URL
  ],
  credentials: true
}));
```

Commit and push backend changes:

```powershell
cd C:\Users\shash\OneDrive\Desktop\PROJECTS\gfgclone-backend
git add .
git commit -m "Update CORS for production frontend"
git push origin main
```

Render will automatically redeploy your backend.

---

## ✅ **Verification Steps**

1. Visit your Vercel frontend URL
2. Navigate through all pages
3. Test dark mode toggle
4. Try logging in
5. Test problem solving (may not work due to code execution limitations)

---

## 🔧 **Alternative: Use Judge0 for Code Execution**

Since Render free tier can't execute user code, integrate Judge0:

### **1. Get Judge0 API Key**
- Go to https://rapidapi.com/judge0-official/api/judge0-ce
- Sign up for free
- Get API key (50 requests/day free)

### **2. Update Backend**

Install axios:
```bash
npm install axios
```

Update `server.js`:
```javascript
const axios = require('axios');

app.post('/compile', async (req, res) => {
  const { code, language, input } = req.body;
  
  const languageMap = {
    'cpp': 54,
    'java': 62,
    'python': 71
  };
  
  try {
    const response = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions',
      {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageMap[language],
        stdin: Buffer.from(input || '').toString('base64'),
      },
      {
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );
    
    const token = response.data.token;
    
    // Poll for result
    let result;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );
    } while (result.data.status.id <= 2);
    
    res.json({
      output: Buffer.from(result.data.stdout || '', 'base64').toString(),
      error: Buffer.from(result.data.stderr || '', 'base64').toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Add environment variable in Render:
- Key: `JUDGE0_API_KEY`
- Value: Your RapidAPI key

---

## 📊 **Repository Structure**

After this process, you'll have:

1. **`gfgclone-backend`** repository:
   - Backend code only
   - Deployed on Render
   - URL: `https://gfgclone-backend-xxxx.onrender.com`

2. **`Capstone`** repository (your current one):
   - Frontend code only
   - Deployed on Vercel
   - URL: `https://your-project.vercel.app`

---

## 🎯 **Benefits of Separate Repos**

✅ Independent deployment cycles
✅ Better code organization
✅ Separate version control
✅ Easier team collaboration
✅ Independent scaling
✅ Clear separation of concerns

---

## 📝 **Summary of Commands**

```powershell
# Backend (gfgclone-backend folder)
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/YOUR_USERNAME/gfgclone-backend.git
git push -u origin main

# Frontend (gfgclone folder)
cd C:\Users\shash\OneDrive\Desktop\PROJECTS\gfgclone
Remove-Item -Recurse -Force backend
git add -A
git commit -m "Remove backend - moved to separate repository"
git push origin main
```

---

## 🆘 **Troubleshooting**

### **Issue: CORS Error**
- Make sure backend CORS includes your Vercel URL
- Redeploy backend after CORS update

### **Issue: API Not Working**
- Check environment variable is set correctly in Vercel
- Check Render logs for backend errors
- Verify URLs match exactly (no trailing slashes)

### **Issue: Code Execution Fails**
- Expected on Render free tier
- Implement Judge0 integration
- Or use Railway.app instead

---

## 🎉 **You're Done!**

You now have a professional deployment with:
- ✅ Separate repositories
- ✅ Frontend on Vercel (fast, global CDN)
- ✅ Backend on Render (free Node.js hosting)
- ✅ Independent deployment pipelines
- ✅ Production-ready setup

Good luck! 🚀
