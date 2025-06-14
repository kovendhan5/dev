# 🔧 CORS Fix - How to Test the Frontend

## The Problem
You're getting "Failed to fetch" because browsers block requests from `file://` URLs to external APIs for security reasons.

## ✅ Solutions (Choose One)

### Option 1: Use Python HTTP Server (Recommended)
```bash
# Navigate to the frontend folder
cd frontend

# Start Python server
python -m http.server 8000

# Open in browser
http://localhost:8000
```

### Option 2: Use Node.js Server
```bash
# Navigate to the frontend folder
cd frontend

# Start Node.js server
node server.js

# Open in browser
http://localhost:3000
```

### Option 3: Use Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: Deploy to a Web Host
Upload the `frontend` folder to any web hosting service like:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## 🧪 Test Commands

Once you have the server running, test these URLs:

**Health Check:**
```
http://localhost:8000  (or your server URL)
```

**API Direct Test:**
```bash
curl -X GET "https://us-central1-serverless-462906.cloudfunctions.net/contact-form-api/health"
```

## ✅ API Status
Your serverless API is working perfectly! The issue is just the CORS restriction from `file://` protocol.

The API responds correctly to:
- ✅ Health checks
- ✅ Contact form submissions
- ✅ All validation and processing

Just serve the frontend from a proper HTTP server and you'll see it working beautifully! 🎉
