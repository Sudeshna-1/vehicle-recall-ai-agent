# UK Vehicle Recall Checker - Deployment Guide

This guide provides step-by-step instructions for deploying your chatbot application to various cloud platforms.

## 📋 Table of Contents

1. [Netlify Deployment](#netlify-deployment-recommended)
2. [Vercel Deployment](#vercel-deployment)
3. [Firebase Hosting](#firebase-hosting)
4. [GitHub Pages](#github-pages)
5. [AWS S3 + CloudFront](#aws-s3--cloudfront)
6. [Azure Static Web Apps](#azure-static-web-apps)

---

## 🚀 Netlify Deployment (Recommended)

**Fastest and easiest option with automatic HTTPS**

### Method 1: Drag & Drop (No Git Required)

1. **Visit Netlify**: Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. **Drag Your Folder**: Drag your entire project folder into the browser window
3. **Done!** Your site will be live in seconds at a URL like `https://random-name.netlify.app`

### Method 2: GitHub Integration (Recommended for Updates)

1. **Create GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/uk-recall-checker.git
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Go to [https://app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository
   - Build settings:
     - **Build command**: Leave empty (static site)
     - **Publish directory**: `.` (current directory)
   - Click "Deploy site"

3. **Custom Domain (Optional)**:
   - Go to Site settings → Domain management
   - Add your custom domain
   - Update DNS records as instructed

### Method 3: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Your site URL**: `https://your-site-name.netlify.app`

---

## ⚡ Vercel Deployment

**Great for developers, excellent performance**

### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Method 2: GitHub Integration

1. Push your code to GitHub (see Netlify instructions above)
2. Go to [https://vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Click "Deploy" (no build configuration needed)

**Your site URL**: `https://your-project.vercel.app`

---

## 🔥 Firebase Hosting

**Google's hosting solution with CDN**

### Prerequisites
- Google account
- Node.js installed

### Steps

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init hosting
# Select:
# - Use an existing project or create new one
# - Public directory: . (current directory)
# - Configure as single-page app: Yes
# - Set up automatic builds: No
# - Overwrite index.html: No

# Deploy
firebase deploy --only hosting
```

**Your site URL**: `https://your-project-id.web.app`

---

## 📄 GitHub Pages

**Free hosting directly from your GitHub repository**

### Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/uk-recall-checker.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Under "Source", select "main" branch
   - Click "Save"

3. **Wait 1-2 minutes** for deployment

**Your site URL**: `https://YOUR_USERNAME.github.io/uk-recall-checker/`

---

## ☁️ AWS S3 + CloudFront

**Enterprise-grade hosting with AWS**

### Prerequisites
- AWS account
- AWS CLI installed and configured

### Steps

```bash
# Install AWS CLI (if not installed)
# Visit: https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure

# Create S3 bucket
aws s3 mb s3://uk-recall-checker --region us-east-1

# Enable static website hosting
aws s3 website s3://uk-recall-checker --index-document index.html --error-document index.html

# Upload files
aws s3 sync . s3://uk-recall-checker --exclude ".git/*" --exclude "*.md" --exclude "node_modules/*"

# Make bucket public
aws s3api put-bucket-policy --bucket uk-recall-checker --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::uk-recall-checker/*"
  }]
}'
```

### Optional: CloudFront CDN Setup

1. Go to AWS CloudFront console
2. Create distribution
3. Origin domain: Select your S3 bucket
4. Default root object: `index.html`
5. Create distribution

**Your site URL**: `http://uk-recall-checker.s3-website-us-east-1.amazonaws.com`

---

## 🌐 Azure Static Web Apps

**Microsoft's static hosting solution**

### Method 1: Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Create new "Static Web App"
3. Connect to GitHub repository
4. Build configuration:
   - App location: `/`
   - Output location: `.`
5. Review and create

### Method 2: Azure CLI

```bash
# Install Azure CLI
# Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Create resource group
az group create --name uk-recall-rg --location eastus

# Create static web app
az staticwebapp create \
  --name uk-recall-checker \
  --resource-group uk-recall-rg \
  --source https://github.com/YOUR_USERNAME/uk-recall-checker \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location "."
```

**Your site URL**: `https://uk-recall-checker.azurestaticapps.net`

---

## 🔧 Quick Deployment Script

Create a file `deploy.sh` for easy deployment:

```bash
#!/bin/bash

echo "🚀 UK Vehicle Recall Checker - Quick Deploy"
echo ""
echo "Select deployment platform:"
echo "1) Netlify"
echo "2) Vercel"
echo "3) Firebase"
echo "4) GitHub Pages"
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo "Deploying to Netlify..."
    netlify deploy --prod
    ;;
  2)
    echo "Deploying to Vercel..."
    vercel --prod
    ;;
  3)
    echo "Deploying to Firebase..."
    firebase deploy --only hosting
    ;;
  4)
    echo "Pushing to GitHub..."
    git add .
    git commit -m "Deploy to GitHub Pages"
    git push origin main
    echo "Enable GitHub Pages in repository settings"
    ;;
  *)
    echo "Invalid choice"
    ;;
esac
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🎯 Recommended Platform Comparison

| Platform | Difficulty | Speed | Free Tier | Custom Domain | HTTPS | Best For |
|----------|-----------|-------|-----------|---------------|-------|----------|
| **Netlify** | ⭐ Easy | ⚡ Fast | ✅ Yes | ✅ Free | ✅ Auto | Beginners |
| **Vercel** | ⭐ Easy | ⚡ Fast | ✅ Yes | ✅ Free | ✅ Auto | Developers |
| **Firebase** | ⭐⭐ Medium | ⚡ Fast | ✅ Yes | ✅ Free | ✅ Auto | Google ecosystem |
| **GitHub Pages** | ⭐ Easy | ⚡ Medium | ✅ Yes | ✅ Free | ✅ Auto | Open source |
| **AWS S3** | ⭐⭐⭐ Hard | ⚡ Fast | ⚠️ Limited | 💰 Paid | 💰 Paid | Enterprise |
| **Azure** | ⭐⭐ Medium | ⚡ Fast | ✅ Yes | ✅ Free | ✅ Auto | Microsoft ecosystem |

---

## ✅ Post-Deployment Checklist

- [ ] Test the chatbot functionality
- [ ] Verify all themes work correctly
- [ ] Check mobile responsiveness
- [ ] Test VIN validation with sample VINs
- [ ] Verify map functionality (Leaflet)
- [ ] Test booking flow end-to-end
- [ ] Check all external CDN resources load (Bootstrap, Font Awesome, Leaflet)
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (Google Analytics, Plausible, etc.)
- [ ] Set up monitoring (UptimeRobot, Pingdom)

---

## 🐛 Troubleshooting

### Issue: External resources not loading
**Solution**: Check Content Security Policy headers and ensure CDN URLs are accessible

### Issue: Map not displaying
**Solution**: Verify Leaflet CSS and JS are loaded correctly. Check browser console for errors.

### Issue: 404 errors on page refresh
**Solution**: Ensure your hosting platform is configured for SPA routing (see configuration files)

### Issue: Slow loading times
**Solution**: 
- Enable CDN on your hosting platform
- Optimize images
- Enable caching headers (already configured in deployment files)

---

## 📞 Support

For deployment issues:
- **Netlify**: [Netlify Support](https://www.netlify.com/support/)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Firebase**: [Firebase Support](https://firebase.google.com/support)

---

## 🎉 Success!

Once deployed, share your chatbot URL with users. The application is fully functional and ready for public access!

**Example URLs**:
- Netlify: `https://uk-recall-checker.netlify.app`
- Vercel: `https://uk-recall-checker.vercel.app`
- Firebase: `https://uk-recall-checker.web.app`

---

**Need help?** Create an issue in your repository or consult the platform-specific documentation.