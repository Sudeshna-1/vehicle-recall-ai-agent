/**
 * Simple JavaScript-based Password Protection
 * Free, client-side authentication for Vercel deployment
 * Setup time: ~5 minutes
 */

// Configuration
const AUTH_CONFIG = {
  // Change this password to your desired password
  // For better security, use a strong password
  password: 'MyS3cur3P@ssw0rd!2026',
  
  // Session duration in milliseconds (default: 24 hours)
  sessionDuration: 24 * 60 * 60 * 1000,
  
  // Storage key for authentication
  storageKey: 'recallcheck_auth',
  
  // Maximum login attempts before temporary lockout
  maxAttempts: 5,
  
  // Lockout duration in milliseconds (default: 15 minutes)
  lockoutDuration: 15 * 60 * 1000
};

// Check if user is authenticated
function isAuthenticated() {
  try {
    const authData = localStorage.getItem(AUTH_CONFIG.storageKey);
    if (!authData) return false;
    
    const { timestamp, authenticated } = JSON.parse(authData);
    const now = Date.now();
    
    // Check if session is still valid
    if (authenticated && (now - timestamp) < AUTH_CONFIG.sessionDuration) {
      return true;
    }
    
    // Session expired, clear storage
    localStorage.removeItem(AUTH_CONFIG.storageKey);
    return false;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

// Check if user is locked out
function isLockedOut() {
  try {
    const lockoutData = localStorage.getItem(AUTH_CONFIG.storageKey + '_lockout');
    if (!lockoutData) return false;
    
    const { timestamp, attempts } = JSON.parse(lockoutData);
    const now = Date.now();
    
    if (attempts >= AUTH_CONFIG.maxAttempts) {
      if ((now - timestamp) < AUTH_CONFIG.lockoutDuration) {
        return true;
      } else {
        // Lockout expired, clear it
        localStorage.removeItem(AUTH_CONFIG.storageKey + '_lockout');
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Lockout check failed:', error);
    return false;
  }
}

// Record failed login attempt
function recordFailedAttempt() {
  try {
    const lockoutData = localStorage.getItem(AUTH_CONFIG.storageKey + '_lockout');
    let attempts = 0;
    
    if (lockoutData) {
      const data = JSON.parse(lockoutData);
      attempts = data.attempts || 0;
    }
    
    attempts++;
    localStorage.setItem(AUTH_CONFIG.storageKey + '_lockout', JSON.stringify({
      timestamp: Date.now(),
      attempts: attempts
    }));
    
    return attempts;
  } catch (error) {
    console.error('Failed to record attempt:', error);
    return 0;
  }
}

// Clear failed attempts
function clearFailedAttempts() {
  localStorage.removeItem(AUTH_CONFIG.storageKey + '_lockout');
}

// Verify password
function verifyPassword(inputPassword) {
  // Simple comparison - for production, consider using bcrypt or similar
  return inputPassword === AUTH_CONFIG.password;
}

// Set authenticated session
function setAuthenticated() {
  localStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify({
    timestamp: Date.now(),
    authenticated: true
  }));
  clearFailedAttempts();
}

// Logout user
function logout() {
  localStorage.removeItem(AUTH_CONFIG.storageKey);
  window.location.reload();
}

// Show login screen
function showLoginScreen() {
  const loginHTML = `
    <div id="authOverlay" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 48px;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      ">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #4f8ef7 0%, #7b5ea7 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 8px 24px rgba(79, 142, 247, 0.3);
          ">
            <i class="fa fa-lock" style="font-size: 32px; color: white;"></i>
          </div>
          <h2 style="
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px;
          ">Protected Access</h2>
          <p style="
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            margin: 0;
          ">Enter password to access RecallCheck UK</p>
        </div>
        
        <form id="authForm" onsubmit="handleLogin(event)" style="margin-bottom: 20px;">
          <div style="margin-bottom: 24px;">
            <label for="authPassword" style="
              display: block;
              color: rgba(255, 255, 255, 0.8);
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 8px;
            ">Password</label>
            <input 
              type="password" 
              id="authPassword" 
              placeholder="Enter your password"
              required
              style="
                width: 100%;
                padding: 14px 16px;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                color: white;
                font-size: 15px;
                outline: none;
                transition: all 0.3s ease;
                box-sizing: border-box;
              "
              onfocus="this.style.background='rgba(255, 255, 255, 0.12)'; this.style.borderColor='#4f8ef7';"
              onblur="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='rgba(255, 255, 255, 0.15)';"
            />
          </div>
          
          <div id="authError" style="
            display: none;
            padding: 12px 16px;
            background: rgba(248, 113, 113, 0.1);
            border: 1px solid rgba(248, 113, 113, 0.3);
            border-radius: 8px;
            color: #fca5a5;
            font-size: 13px;
            margin-bottom: 20px;
          "></div>
          
          <button type="submit" id="authSubmit" style="
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #4f8ef7 0%, #7b5ea7 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(79, 142, 247, 0.3);
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(79, 142, 247, 0.4)';"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(79, 142, 247, 0.3)';"
          >
            <i class="fa fa-arrow-right" style="margin-right: 8px;"></i>
            Access Application
          </button>
        </form>
        
        <div style="
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        ">
          <p style="
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
            margin: 0;
          ">
            <i class="fa fa-shield" style="margin-right: 4px;"></i>
            Secured with client-side authentication
          </p>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', loginHTML);
  document.getElementById('authPassword').focus();
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();
  
  const errorDiv = document.getElementById('authError');
  const passwordInput = document.getElementById('authPassword');
  const submitBtn = document.getElementById('authSubmit');
  
  // Check if locked out
  if (isLockedOut()) {
    errorDiv.textContent = `Too many failed attempts. Please try again in ${Math.ceil(AUTH_CONFIG.lockoutDuration / 60000)} minutes.`;
    errorDiv.style.display = 'block';
    return;
  }
  
  const password = passwordInput.value;
  
  // Disable submit button during verification
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin" style="margin-right: 8px;"></i>Verifying...';
  
  // Simulate a small delay for better UX
  setTimeout(() => {
    if (verifyPassword(password)) {
      // Success
      setAuthenticated();
      errorDiv.style.display = 'none';
      
      // Fade out login screen
      const overlay = document.getElementById('authOverlay');
      overlay.style.transition = 'opacity 0.5s ease';
      overlay.style.opacity = '0';
      
      setTimeout(() => {
        overlay.remove();
        // Ensure body is visible after login
        if (document.body) {
          document.body.style.visibility = 'visible';
        }
        // Show main content after successful login
        const mainContent = document.querySelector('.container, main, #app, .app');
        if (mainContent) {
          mainContent.style.display = '';
        }
      }, 500);
    } else {
      // Failed attempt
      const attempts = recordFailedAttempt();
      const remaining = AUTH_CONFIG.maxAttempts - attempts;
      
      if (remaining > 0) {
        errorDiv.textContent = `Incorrect password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`;
      } else {
        errorDiv.textContent = `Too many failed attempts. Locked out for ${Math.ceil(AUTH_CONFIG.lockoutDuration / 60000)} minutes.`;
      }
      
      errorDiv.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
      
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa fa-arrow-right" style="margin-right: 8px;"></i>Access Application';
    }
  }, 800);
}

// Add logout button to navbar (optional)
function addLogoutButton() {
  const navbar = document.querySelector('.navbar-ai .container .d-flex');
  if (navbar) {
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn-ai-outline py-2 px-3';
    logoutBtn.style.fontSize = '.82rem';
    logoutBtn.innerHTML = '<i class="fa fa-sign-out me-2"></i>Logout';
    logoutBtn.onclick = logout;
    navbar.appendChild(logoutBtn);
  }
}

// Initialize authentication
function initAuth() {
  // Ensure document.body exists before accessing it
  if (!document.body) {
    // Body not ready yet, wait for DOM to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAuth);
    } else {
      // Use setTimeout as fallback
      setTimeout(initAuth, 10);
    }
    return;
  }
  
  if (!isAuthenticated()) {
    // Hide main content but keep body visible for the auth overlay
    const mainContent = document.querySelector('.container, main, #app, .app');
    if (mainContent) {
      mainContent.style.display = 'none';
    }
    
    // Ensure body is visible so auth overlay can be seen
    if (document.body) {
      document.body.style.visibility = 'visible';
    }
    
    // Show login screen
    showLoginScreen();
  } else {
    // User is authenticated, show content - safely check body exists
    if (document.body) {
      document.body.style.visibility = 'visible';
    }
    
    // Show main content
    const mainContent = document.querySelector('.container, main, #app, .app');
    if (mainContent) {
      mainContent.style.display = '';
    }
    
    // Add logout button when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addLogoutButton);
    } else {
      addLogoutButton();
    }
  }
}

// Run authentication check when safe - ensure DOM is fully loaded
if (document.readyState === 'loading') {
  // DOM still loading, wait for it
  document.addEventListener('DOMContentLoaded', initAuth);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
  // DOM is ready, but double-check body exists
  if (document.body) {
    initAuth();
  } else {
    // Fallback: wait a bit and try again
    setTimeout(initAuth, 50);
  }
}