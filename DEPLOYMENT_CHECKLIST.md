# 🚀 Deployment Checklist - Groq AI Chatbot

## ✅ Pre-Deployment Steps

### 1. Add Your Groq API Key Locally

**Where to add it:**
- Open the `.env` file in your project root
- Replace the empty value with your actual API key:
  ```
  GROQ_API_KEY=gsk_your_actual_api_key_here
  ```

**⚠️ IMPORTANT**: Never commit the `.env` file to Git! It's already in `.gitignore`.

### 2. Test Locally (Optional but Recommended)

```bash
# Open index.html in your browser
# Test the chatbot with:
# - VIN: 1HGBH41JXMN109186
# - V5C: AB12CDE3456
# - Postcode: SO50 9TS
```

## 🔐 Git & GitHub Setup

### 3. Update .gitignore

**Already configured!** Your `.gitignore` includes:
```
.env
node_modules/
.DS_Store
```

### 4. Commit Your Code

```bash
# Stage all files EXCEPT .env
git add .

# Commit with a meaningful message
git commit -m "feat: Add Groq AI integration for vehicle recall chatbot"

# Push to GitHub
git push origin main
```

**✅ Safe to push**: Your `.env` file with the actual API key will NOT be pushed to GitHub.

## ☁️ Vercel Deployment

### 5. Add Environment Variables in Vercel

**CRITICAL STEP**: Before deploying, add your Groq API key to Vercel:

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (AutoCare Vehicle Recall Chatbot)
3. Click **Settings** → **Environment Variables**
4. Add the following:

| Key | Value | Environments |
|-----|-------|-------------|
| `GROQ_API_KEY` | `gsk_your_actual_api_key_here` | Production, Preview, Development |

5. Click **Save**

### 6. Deploy to Vercel

**Option A: Automatic Deployment (Recommended)**
```bash
# Just push to GitHub - Vercel will auto-deploy
git push origin main
```

**Option B: Manual Deployment**
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel --prod
```

### 7. Verify Deployment

1. Wait for deployment to complete (usually 1-2 minutes)
2. Visit your Vercel URL
3. Test the chatbot:
   - Enter VIN: `1HGBH41JXMN109186`
   - Enter V5C: `AB12CDE3456`
   - Enter Postcode: `SO50 9TS`
4. Verify Groq AI responses are working

## 🔍 Post-Deployment Verification

### 8. Check Environment Variables

**In Vercel Dashboard:**
- Settings → Environment Variables
- Verify `GROQ_API_KEY` is set for all environments

**In Browser Console (F12):**
```javascript
// Should NOT see your API key in console
// If you see it, there's a security issue!
```

### 9. Monitor Groq API Usage

1. Visit: https://console.groq.com/
2. Go to **Usage** section
3. Monitor:
   - Requests per minute
   - Daily usage
   - Error rates

### 10. Test All Features

- [ ] VIN validation with recall status
- [ ] V5C certificate verification
- [ ] Dealer search by postcode
- [ ] OTP generation and verification
- [ ] Email confirmation (SendGrid)
- [ ] Password protection (if enabled)

## 🚨 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] API keys are NOT visible in client-side code
- [ ] Environment variables are set in Vercel (not hardcoded)
- [ ] SendGrid API key is secure
- [ ] Password protection is enabled (if required)

## 📊 What Gets Pushed to GitHub?

**✅ Safe to Push:**
- `index.html`
- `app.js`
- `styles.css`
- `groq-agent.js`
- `auth.js`
- `v5c-mock-db.json`
- `vercel.json`
- `package.json`
- `.gitignore`
- `.env.example` (template with no real keys)
- `README.md`
- `DEPLOYMENT.md`
- `GROQ_SETUP.md`

**❌ NEVER Push:**
- `.env` (contains your actual API key)
- `node_modules/`
- `.DS_Store`

## 🎯 Quick Command Reference

```bash
# 1. Add your Groq API key to .env file
# Edit .env and add: GROQ_API_KEY=gsk_your_key_here

# 2. Commit and push (safe - .env is ignored)
git add .
git commit -m "feat: Add Groq AI integration"
git push origin main

# 3. Add environment variables in Vercel dashboard
# Settings → Environment Variables → Add GROQ_API_KEY

# 4. Vercel will auto-deploy from GitHub
# Or manually deploy:
vercel --prod
```

## 🆘 Troubleshooting

### Issue: "Invalid API Key" in Production
**Solution**: Verify `GROQ_API_KEY` is set in Vercel Environment Variables

### Issue: API Key Visible in Browser Console
**Solution**: Move API calls to server-side (Vercel Serverless Functions)

### Issue: CORS Error
**Solution**: Use Vercel Serverless Functions for API calls (see GROQ_SETUP.md)

### Issue: Rate Limit Exceeded
**Solution**: Implement request queuing or upgrade Groq plan

## 📞 Support

- **Groq Console**: https://console.groq.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Customer Care**: Call 0800-123-4567 | Email support@autorecall.com

---

**Next Steps:**
1. ✅ Add Groq API key to `.env` file
2. ✅ Commit and push to GitHub (safe - .env is ignored)
3. ✅ Add `GROQ_API_KEY` to Vercel Environment Variables
4. ✅ Deploy and test!

**Estimated Time**: 5-10 minutes
**Difficulty**: Easy 🟢