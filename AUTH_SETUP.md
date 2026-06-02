# 🔐 Password Protection Setup Guide

## ✅ Installation Complete!

Your RecallCheck UK application now has **JavaScript-based password protection** implemented.

---

## 🚀 Quick Start (5 Minutes)

### 1. **Change the Default Password** ⚠️

**IMPORTANT:** The default password is `RecallCheck2024!` - you MUST change this!

**How to change:**
1. Open `auth.js`
2. Find line 10-11:
   ```javascript
   password: 'RecallCheck2024!',
   ```
3. Replace `RecallCheck2024!` with your secure password
4. Save the file

**Password Tips:**
- Use at least 12 characters
- Mix uppercase, lowercase, numbers, and symbols
- Avoid common words or personal information
- Example: `MyS3cur3P@ssw0rd!2024`

---

### 2. **Deploy to Vercel**

```bash
# If you haven't already, commit your changes
git add .
git commit -m "Add password protection"
git push
```

Vercel will automatically redeploy with the new authentication.

---

### 3. **Test the Protection**

1. Visit your Vercel URL
2. You should see a login screen
3. Enter your password
4. You'll be granted access for 24 hours (configurable)

---

## ⚙️ Configuration Options

All settings are in `auth.js` (lines 8-22):

```javascript
const AUTH_CONFIG = {
  // Your password
  password: 'RecallCheck2024!',
  
  // How long users stay logged in (default: 24 hours)
  sessionDuration: 24 * 60 * 60 * 1000,
  
  // Maximum failed login attempts before lockout
  maxAttempts: 5,
  
  // Lockout duration after max attempts (default: 15 minutes)
  lockoutDuration: 15 * 60 * 1000
};
```

### Common Customizations:

**Change session to 1 hour:**
```javascript
sessionDuration: 1 * 60 * 60 * 1000,
```

**Change session to 7 days:**
```javascript
sessionDuration: 7 * 24 * 60 * 60 * 1000,
```

**Allow 10 login attempts:**
```javascript
maxAttempts: 10,
```

**Lockout for 30 minutes:**
```javascript
lockoutDuration: 30 * 60 * 1000,
```

---

## 🔒 Security Features

✅ **Session Management**
- Users stay logged in for 24 hours (configurable)
- Sessions stored in browser localStorage
- Auto-logout after session expires

✅ **Brute Force Protection**
- Maximum 5 failed attempts (configurable)
- 15-minute lockout after max attempts
- Attempt counter resets on successful login

✅ **User Experience**
- Beautiful, modern login screen
- Real-time error feedback
- Smooth animations and transitions
- Mobile-responsive design
- Logout button in navbar

✅ **Page Protection**
- Content hidden until authentication
- Script loads before page renders
- No flash of unprotected content

---

## 📱 How It Works

1. **Page Load:** `auth.js` runs immediately in `<head>`
2. **Check Auth:** Verifies if user has valid session in localStorage
3. **Not Authenticated:** Shows login screen, hides page content
4. **Authenticated:** Shows page content, adds logout button
5. **Login Success:** Stores session with timestamp
6. **Session Expiry:** Auto-logout after 24 hours

---

## 🎨 Login Screen Features

- **Modern Design:** Glassmorphism effect with gradient background
- **Branded:** Shows RecallCheck UK branding
- **Secure Icon:** Lock icon indicates protected access
- **Error Handling:** Clear feedback on incorrect passwords
- **Attempt Counter:** Shows remaining attempts
- **Lockout Warning:** Displays lockout duration
- **Loading State:** Shows spinner during verification

---

## 🔓 User Instructions

**To share with authorized users:**

1. Visit the RecallCheck UK website
2. You'll see a "Protected Access" login screen
3. Enter the password (get this from the site administrator)
4. Click "Access Application"
5. You'll stay logged in for 24 hours
6. To logout manually, click the "Logout" button in the top navigation

**If you forget the password:**
- Contact the site administrator
- After 5 failed attempts, you'll be locked out for 15 minutes

---

## 🛠️ Advanced Customization

### Change Login Screen Colors

Edit `auth.js` around line 145-160 to modify the gradient:

```javascript
background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
```

### Add Multiple Passwords

Replace the `verifyPassword` function (line 109):

```javascript
function verifyPassword(inputPassword) {
  const validPasswords = [
    'Password1!',
    'Password2!',
    'AdminPass123!'
  ];
  return validPasswords.includes(inputPassword);
}
```

### Remove Logout Button

Comment out line 351 in `auth.js`:

```javascript
// addLogoutButton();
```

---

## ⚠️ Important Security Notes

### This is CLIENT-SIDE protection:
- ✅ **Good for:** Keeping casual visitors out
- ✅ **Good for:** Sharing with trusted users
- ✅ **Good for:** Free, simple protection
- ❌ **NOT for:** Highly sensitive data
- ❌ **NOT for:** Preventing determined attackers
- ❌ **NOT for:** Production-grade security

### Why?
- Password is visible in `auth.js` source code
- Anyone can view page source and find the password
- No server-side validation
- localStorage can be manipulated

### For Better Security:

If you need stronger protection, consider:

1. **Vercel Password Protection** (Paid plans)
   - Server-side authentication
   - Built into Vercel platform
   - No code changes needed

2. **Auth0 / Firebase Auth** (Free tier available)
   - Real user authentication
   - Email/password or social login
   - Server-side validation

3. **Cloudflare Access** (Free tier available)
   - Zero Trust security
   - Email-based authentication
   - Works with any hosting

4. **Basic Auth via Vercel Edge Functions**
   - Server-side protection
   - HTTP Basic Authentication
   - Requires Vercel Pro plan

---

## 🐛 Troubleshooting

### Login screen doesn't appear
- Check browser console for errors
- Verify `auth.js` is loaded in `<head>`
- Clear browser cache and reload

### Can't login with correct password
- Check for typos in `auth.js` password
- Passwords are case-sensitive
- Clear localStorage: `localStorage.clear()` in browser console

### Locked out after failed attempts
- Wait 15 minutes (or configured lockout duration)
- OR clear localStorage: `localStorage.clear()` in browser console
- OR change `maxAttempts` in `auth.js` and redeploy

### Session expires too quickly
- Increase `sessionDuration` in `auth.js`
- Example: `sessionDuration: 7 * 24 * 60 * 60 * 1000` for 7 days

### Logout button not showing
- Check if `addLogoutButton()` is called in `auth.js` (line 351)
- Verify navbar HTML structure matches expected selectors

---

## 📋 Files Modified

1. **`auth.js`** (NEW)
   - Main authentication logic
   - Login screen UI
   - Session management
   - Security features

2. **`index.html`** (MODIFIED)
   - Added `<script src="auth.js"></script>` in `<head>`
   - Ensures auth runs before page renders

3. **`vercel.json`** (NO CHANGES NEEDED)
   - Existing configuration works with auth.js
   - No server-side changes required

---

## ✅ Deployment Checklist

- [ ] Changed default password in `auth.js`
- [ ] Tested login locally
- [ ] Configured session duration
- [ ] Configured max attempts and lockout
- [ ] Committed changes to Git
- [ ] Pushed to repository
- [ ] Verified Vercel deployment
- [ ] Tested login on live site
- [ ] Shared password with authorized users
- [ ] Documented password securely

---

## 🎉 You're All Set!

Your RecallCheck UK application is now password-protected and ready to share with limited users.

**Next Steps:**
1. Change the password in `auth.js`
2. Deploy to Vercel
3. Test the login
4. Share the password with authorized users

**Need Help?**
- Check the troubleshooting section above
- Review the configuration options
- Test in incognito mode to simulate new users

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all files are deployed correctly
3. Clear browser cache and localStorage
4. Test in incognito/private browsing mode

**Common Commands:**
```javascript
// Clear authentication (run in browser console)
localStorage.clear();

// Check current auth status
localStorage.getItem('recallcheck_auth');

// Check lockout status
localStorage.getItem('recallcheck_auth_lockout');
```

---

**Setup Time:** ⏱️ ~5 minutes  
**Cost:** 💰 Free  
**Difficulty:** 🟢 Easy  
**Security Level:** 🔒 Basic (client-side)

Enjoy your password-protected RecallCheck UK application! 🚗✨