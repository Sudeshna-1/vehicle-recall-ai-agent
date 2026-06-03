// ══════════════════════════════════════
//  API CONFIGURATION
//  IMPORTANT: This file contains API endpoints and keys
//  For production, use environment variables on your hosting platform
// ══════════════════════════════════════

const API_CONFIG = {
  // Mock API Endpoints
  VIN_RECALL_API: 'https://6901dcb0b208b24affe4006c.mockapi.io/recallstatus/vin2',
  DEALER_API: 'https://69082f61b49bea95fbf2a042.mockapi.io/dealerinfo/zipcode/content',
  USER_INFO_API: 'https://6900a9cdff8d792314bae1f9.mockapi.io/getinfo',
  
  // Groq API Configuration
  GROQ_API_KEY: 'YOUR_GROQ_API_KEY_HERE',
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  GROQ_MODEL: 'mixtral-8x7b-32768',
  
  // SendGrid Configuration
  SENDGRID_API_KEY: 'YOUR_SENDGRID_API_KEY_HERE',
  SENDGRID_TEMPLATE_ID: 'd-006bc0e0fd3945e683d71fe39101ca33',
  SENDGRID_FROM_EMAIL: 'neenusanu27@gmail.com'
};

// Make config available globally
window.API_CONFIG = API_CONFIG;
