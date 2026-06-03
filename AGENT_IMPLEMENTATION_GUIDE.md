# Vehicle Recall AI Agent - Implementation Guide

## 🎯 Architecture Overview

This implementation creates a **flexible AI agent architecture** that:
- ✅ Works with mock APIs NOW (deterministic workflow)
- ✅ Can be upgraded to LLM-based conversational AI LATER
- ✅ Follows the exact workflow from Flowise agent configuration
- ✅ Modular, testable, and maintainable

---

## 📁 Project Structure

```
/
├── agent-architecture.js          # Core agent logic (state machine + tools)
├── agent-ui-integration.js        # UI integration layer
├── v5c-mock-db.json              # V5C certificate mock database
├── index.html                     # Chatbot UI (existing)
├── app.js                         # Chatbot UI logic (to be updated)
├── styles.css                     # Chatbot styles (existing)
└── AGENT_IMPLEMENTATION_GUIDE.md  # This file
```

---

## 🏗️ Architecture Pattern

### Current Implementation: **State Machine + Tool Orchestrator**

```
User Input → State Machine → Tool Selection → API Call → State Update → Response
```

**Key Components:**

1. **State Management** (`this.state`)
   - Mirrors Flowise `$flow.state` configuration
   - Stores VIN, V5C, user info, recall data, dealer info, etc.

2. **Tool Registry** (`this.tools`)
   - 7 custom tools matching Flowise configuration:
     - `validate_vin_recall_status`
     - `validate_v5c_certificate`
     - `get_dealer_by_zipcode_with_slots`
     - `fetch_user_email_tool`
     - `send_otp_tool`
     - `verify_otp_tool`
     - `send_booking_confirmation_tool`

3. **Workflow State Machine** (`executeWorkflowStep`)
   - 9 workflow steps:
     1. `AWAIT_VIN` → Collect VIN
     2. `AWAIT_V5C` → Validate V5C certificate
     3. `DISPLAY_RECALL_INFO` → Show recall summary
     4. `AWAIT_ZIPCODE` → Get UK postcode
     5. `DISPLAY_DEALER_INFO` → Show dealer details
     6. `AWAIT_APPOINTMENT_DETAILS` → Collect appointment preferences
     7. `AWAIT_EMAIL_CONFIRMATION` → Verify email
     8. `AWAIT_OTP` → Validate OTP
     9. `CONFIRM_BOOKING` → Finalize appointment
     10. `COMPLETED` → Allow new VIN check

4. **Conversation History** (`this.conversationHistory`)
   - Stores all user/assistant messages
   - Ready for LLM context injection

---

## 🔄 Upgrade Path to LLM

### Phase 1: Current (Deterministic)
```javascript
// Rule-based decision making
switch (this.currentStep) {
    case 'AWAIT_VIN':
        return await this.handleVINInput(userInput);
    // ...
}
```

### Phase 2: LLM Integration (Future)
```javascript
// LLM-based decision making
const llmResponse = await this.callLLM({
    systemPrompt: this.config.systemPrompt,
    conversationHistory: this.conversationHistory,
    availableTools: Object.keys(this.tools),
    currentState: this.state,
    userInput: userInput
});

// LLM decides which tool to call
if (llmResponse.toolCall) {
    const result = await this.tools[llmResponse.toolCall.name].execute(
        ...llmResponse.toolCall.arguments
    );
    return this.formatLLMResponse(result);
}
```

**What needs to change:**
1. Replace `executeWorkflowStep()` with LLM prompt
2. Add LLM API integration (OpenAI, Azure, etc.)
3. Convert tools to LangChain `StructuredTool` format
4. Add function calling support
5. Keep everything else the same!

---

## 🔌 API Integration

### Mock APIs Used

| Tool | API Endpoint | Purpose |
|------|-------------|----------|
| VIN Recall | `https://6901dcb0b208b24affe4006c.mockapi.io/recallstatus/vin2` | Fetch recall status |
| Dealer Lookup | `https://69082f61b49bea95fbf2a042.mockapi.io/dealerinfo/zipcode/content` | Find dealers by postcode |
| User Info | `https://6900a9cdff8d792314bae1f9.mockapi.io/getinfo` | Get user email/name |
| SendGrid Email | `https://api.sendgrid.com/v3/mail/send` | Send OTP & confirmations |
| V5C Database | `/v5c-mock-db.json` | Validate V5C certificate |

### SendGrid Configuration
- **API Key:** Set in `.env` file as `SENDGRID_API_KEY`
- **Template ID:** Set in `.env` file as `SENDGRID_TEMPLATE_ID`
- **From Email:** Set in `.env` file as `SENDGRID_FROM_EMAIL`

---

## 🚀 Integration Steps

### Step 1: Update `app.js` to use the agent

```javascript
// Import agent
const agent = new VehicleRecallAgent();

// Replace existing message handler
async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    
    // Display user message
    displayMessage(userInput, 'user');
    
    // Process with agent
    const response = await agent.processMessage(userInput);
    
    // Display agent response
    displayMessage(response.message, 'assistant');
    
    // Clear input
    document.getElementById('user-input').value = '';
}
```

### Step 2: Add agent script to `index.html`

```html
<script src="agent-architecture.js"></script>
<script src="agent-ui-integration.js"></script>
```

### Step 3: Deploy V5C mock database

- Ensure `v5c-mock-db.json` is accessible at `/v5c-mock-db.json`
- Update Vercel configuration if needed

---

## 🧪 Testing Workflow

### Test Case 1: Happy Path

1. **User:** `1HGBH41JXMN109186` (VIN)
2. **Agent:** "Your vehicle has an active Safety Recall. Please provide your V5C certificate number..."
3. **User:** `ABC12345678` (V5C)
4. **Agent:** "Your VIN and V5C are successfully validated. You own a Honda Accord 2021..."
5. **User:** `SO50 9TS` (Postcode)
6. **Agent:** "Dealer Information: Name: ABC Motors..."
7. **User:** `Tomorrow at 10 AM`
8. **Agent:** "We found your registered email: s*****ai@gmail.com. Is this correct?"
9. **User:** `Yes`
10. **Agent:** "For your security, a 6-digit verification code has been sent..."
11. **User:** `123456` (OTP)
12. **Agent:** "OTP verified successfully! Please confirm your appointment..."
13. **User:** `Confirm`
14. **Agent:** "📧 Your vehicle recall appointment is all set!..."

### Test Case 2: No Recall

1. **User:** `5YJSA1E14HF000001` (VIN with no recall)
2. **Agent:** "Good news! There are currently no outstanding recalls for your vehicle."

### Test Case 3: Invalid VIN (3 attempts)

1. **User:** `INVALID`
2. **Agent:** "Please enter a valid 17-character VIN..."
3. **User:** `STILL_INVALID`
4. **Agent:** "Please enter a valid 17-character VIN..."
5. **User:** `WRONG_AGAIN`
6. **Agent:** "Please contact Customer Care. Call: 0800-123-4567..."

---

## 🎨 UI Enhancements

### Recommended Updates to `index.html`

1. **Add loading indicator** during API calls
2. **Display vehicle image** when V5C validated
3. **Render dealer map** using iframe HTML
4. **Format recall summary** with proper HTML
5. **Add "New VIN" button** after completion

### Example HTML for vehicle image:

```html
<div class="vehicle-info">
    <img src="${imageUrl}" alt="Vehicle" width="400" style="border-radius:10px;"/>
    <p><b>${vehicle_desc} ${model_year}</b></p>
</div>
```

---

## 📊 State Management

### State Schema (mirrors Flowise)

```javascript
{
  // Vehicle Info
  vin: '',
  v5c: '',
  vehicle_make: '',
  vehicle_desc: '',
  model_year: '',
  imageUrl: '',
  
  // User Info
  email: '',
  phone: '',
  first_name: '',
  lastName: '',
  address: '',
  
  // Recall Info
  recall_number: '',
  agency_campaign_number: '',
  campaign_desc: '',
  condition_and_risk: '',
  repair_description: '',
  recall_status: '',
  type_of_campaign: '',
  recall_summary: '',
  
  // Appointment Info
  appointment_date: '',
  appointment_time: '',
  
  // Dealer Info
  dealerZipCode: '',
  dealerName: '',
  dealerAddress: '',
  service_hours: '',
  dealerIframeHtml: '',
  embedUrl: '',
  
  // Aggregate (for LLM context)
  aggregate: []
}
```

---

## 🛡️ Guardrails Implementation

### From Flowise System Prompt

✅ **Implemented:**
- VIN validation (17 characters, alphanumeric)
- V5C validation (against mock database)
- UK postcode validation
- Email validation
- OTP validation (6 digits)
- Retry limits (3 attempts for VIN, V5C, OTP)
- Customer care fallback
- Session state management
- Email masking for privacy

✅ **Ready for LLM:**
- System prompt injection
- Conversation history context
- Tool calling guardrails
- PII protection rules
- Out-of-scope query handling

---

## 🔐 Security Considerations

1. **API Keys:**
   - ⚠️ SendGrid API key is hardcoded (move to environment variables)
   - Use Vercel environment variables for production

2. **OTP Storage:**
   - Currently stored in agent state (in-memory)
   - For production: Use Redis or database with expiration

3. **Email Masking:**
   - Implemented: `s*****ai@gmail.com`
   - Never log full email addresses

4. **CORS:**
   - Ensure mock APIs allow cross-origin requests
   - Configure Vercel CORS headers if needed

---

## 📈 Performance Optimization

1. **API Caching:**
   - Cache VIN recall results (24 hours)
   - Cache dealer lookups by postcode

2. **Lazy Loading:**
   - Load V5C database only when needed
   - Defer SendGrid calls until OTP step

3. **Error Handling:**
   - Retry failed API calls (3 attempts)
   - Graceful degradation to customer care

---

## 🧩 Modular Design Benefits

### Easy to Test
```javascript
// Unit test individual tools
const result = await agent.tools.validate_vin_recall_status.execute('1HGBH41JXMN109186');
assert(result.success === true);
```

### Easy to Extend
```javascript
// Add new tool
agent.tools.check_warranty = agent.createTool(
    'check_warranty',
    'Check vehicle warranty status',
    async (vin) => await this.checkWarranty(vin)
);
```

### Easy to Replace
```javascript
// Replace with LLM
agent.executeWorkflowStep = async (userInput) => {
    return await this.callLLM(userInput);
};
```

---

## 🎓 Learning Resources

### For LLM Integration Later:
- [LangChain.js](https://js.langchain.com/docs/get_started/introduction)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/)

### For State Management:
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [Flowise Documentation](https://docs.flowiseai.com/)

---

## 🚦 Next Steps

### Immediate (Deterministic Agent)
1. ✅ Review agent architecture
2. ⬜ Update `app.js` to integrate agent
3. ⬜ Test with mock APIs
4. ⬜ Deploy to Vercel
5. ⬜ Test end-to-end workflow

### Future (LLM Integration)
1. ⬜ Add OpenAI/Azure API key
2. ⬜ Convert tools to LangChain format
3. ⬜ Implement function calling
4. ⬜ Add conversation memory
5. ⬜ Test LLM-based routing

---

## 💡 Key Takeaways

✅ **Modular:** Each tool is independent and testable
✅ **Flexible:** Easy to switch from rules to LLM
✅ **Maintainable:** Clear separation of concerns
✅ **Production-Ready:** Error handling, retries, fallbacks
✅ **Scalable:** Add new tools without changing core logic

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify mock API responses
3. Test individual tools in isolation
4. Review conversation history: `agent.getConversationHistory()`

---

**Ready to proceed with UI integration?** Let me know if you need any clarifications!
