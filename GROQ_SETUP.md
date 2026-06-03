# Groq AI Agent Setup Guide

## Overview
This guide explains how to integrate Groq's free LLM API into your AutoCare Vehicle Recall chatbot, replacing Azure OpenAI with a cost-effective alternative.

## Why Groq?

✅ **FREE API Access** - No credit card required for getting started
✅ **Fast Inference** - Powered by custom LPU hardware
✅ **Compatible Models** - Llama 3.3 70B, Mixtral, Gemma
✅ **OpenAI-Compatible API** - Easy migration from Azure OpenAI
✅ **No Flowise Required** - Direct API integration

## Step 1: Get Your Groq API Key

1. Visit: https://console.groq.com/
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy your API key (starts with `gsk_...`)

## Step 2: Update Your Chatbot

### Option A: Quick Integration (Recommended)

Add this to your `app.js` file:

```javascript
// Import Groq Agent
import GroqAgent from './groq-agent.js';

// Initialize agent with your API key
const agent = new GroqAgent('YOUR_GROQ_API_KEY_HERE');

// Replace existing chat handler
async function handleUserMessage(message) {
  const response = await agent.chat(message);
  
  // Execute tool calls if detected
  if (response.toolCall) {
    const toolResult = await agent.executeToolCall(response.toolCall);
    // Update UI with tool result
    displayToolResult(toolResult);
  }
  
  // Display assistant message
  displayMessage(response.message, 'assistant');
}
```

### Option B: Environment Variable (Production)

Create a `.env` file:
```
GROQ_API_KEY=gsk_your_actual_api_key_here
```

Update `app.js`:
```javascript
const agent = new GroqAgent(process.env.GROQ_API_KEY);
```

## Step 3: Test the Integration

### Test VIN Validation
```
User: 1HGBH41JXMN109186
Agent: [Validates VIN and asks for V5C]
```

### Test V5C Validation
```
User: AB12CDE3456
Agent: [Validates V5C and shows recall details]
```

### Test Dealer Search
```
User: SO50 9TS
Agent: [Shows nearby dealers with booking slots]
```

## Step 4: Deploy to Vercel

### Add Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `gsk_your_actual_api_key_here`
   - **Environment**: Production, Preview, Development
4. Click **Save**
5. Redeploy your project

### Update `vercel.json`

```json
{
  "env": {
    "GROQ_API_KEY": "@groq-api-key"
  }
}
```

## Architecture Overview

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Groq Agent     │ ◄── Groq API (Free)
│  (groq-agent.js)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Tool Detection │
│  & Execution    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Mock APIs                          │
│  • VIN Recall API                   │
│  • V5C Validation (local JSON)      │
│  • Dealer Lookup API                │
│  • User Info API                    │
│  • SendGrid Email API               │
└─────────────────────────────────────┘
```

## Features Implemented

### ✅ Conversational AI
- Natural language understanding
- Context-aware responses
- Workflow state management

### ✅ Tool Integration
- Automatic VIN detection and validation
- V5C certificate verification
- Dealer search by postcode
- OTP generation and verification
- Email confirmation via SendGrid

### ✅ Security Guardrails
- Prompt injection protection
- PII data masking
- Session isolation per VIN
- Rate limiting on failed attempts

## Model Configuration

**Current Model**: `llama-3.3-70b-versatile`

**Why This Model?**
- 70B parameters for high-quality responses
- Fast inference (< 1 second)
- Excellent instruction following
- Free tier: 30 requests/minute

**Alternative Models** (if needed):
- `mixtral-8x7b-32768` - Longer context window
- `gemma2-9b-it` - Faster, lighter model

## API Rate Limits (Free Tier)

| Model | Requests/Min | Requests/Day |
|-------|--------------|-------------|
| Llama 3.3 70B | 30 | 14,400 |
| Mixtral 8x7B | 30 | 14,400 |
| Gemma 2 9B | 30 | 14,400 |

**Upgrade**: For production with high traffic, consider Groq's paid tier for higher limits.

## Troubleshooting

### Error: "Invalid API Key"
**Solution**: Verify your API key starts with `gsk_` and is correctly set in environment variables.

### Error: "Rate Limit Exceeded"
**Solution**: 
- Implement request queuing
- Add retry logic with exponential backoff
- Consider upgrading to paid tier

### Error: "CORS Policy"
**Solution**: Groq API calls must be made from server-side code, not client-side JavaScript. Use Vercel Serverless Functions:

```javascript
// /api/chat.js
export default async function handler(req, res) {
  const agent = new GroqAgent(process.env.GROQ_API_KEY);
  const response = await agent.chat(req.body.message);
  res.json(response);
}
```

## Next Steps

1. ✅ Get Groq API key
2. ✅ Test locally with `groq-agent.js`
3. ✅ Add environment variables to Vercel
4. ✅ Deploy and test in production
5. 🔄 Monitor usage in Groq Console
6. 🔄 Optimize prompts for better responses

## Support

- **Groq Documentation**: https://console.groq.com/docs
- **Groq Discord**: https://discord.gg/groq
- **Customer Care**: Call 0800-123-4567 | Email support@autorecall.com

## Cost Comparison

| Service | Cost | Rate Limit |
|---------|------|------------|
| **Groq (Free)** | $0 | 30 req/min |
| Azure OpenAI | ~$0.03/1K tokens | Variable |
| OpenAI GPT-4 | ~$0.06/1K tokens | Variable |

**Estimated Savings**: ~$150-300/month for moderate traffic

---

**Implementation Status**: ✅ Ready to Deploy
**Estimated Setup Time**: 10-15 minutes
**Technical Difficulty**: Easy (No Flowise required)
