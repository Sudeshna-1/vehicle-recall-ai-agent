/**
 * Vehicle Recall AI Agent - Modular Architecture
 * Designed to work with mock APIs now and easily upgrade to LLM later
 * 
 * Architecture Pattern: State Machine + Tool Orchestrator
 * - Deterministic workflow for now (rule-based)
 * - Easy LLM integration later (replace decision logic)
 */

class VehicleRecallAgent {
    constructor(config = {}) {
        this.config = {
            apiEndpoints: {
                vinRecall: 'https://6901dcb0b208b24affe4006c.mockapi.io/recallstatus/vin2',
                dealerZipcode: 'https://69082f61b49bea95fbf2a042.mockapi.io/dealerinfo/zipcode/content',
                userInfo: 'https://6900a9cdff8d792314bae1f9.mockapi.io/getinfo',
                sendGrid: 'https://api.sendgrid.com/v3/mail/send'
            },
            sendGridConfig: {
                apiKey: process.env.SENDGRID_API_KEY || '',
                templateId: process.env.SENDGRID_TEMPLATE_ID || '',
                fromEmail: process.env.SENDGRID_FROM_EMAIL || ''
            },
            ...config
        };

        // Session state - mimics $flow.state from Flowise
        this.state = this.initializeState();
        
        // Conversation history
        this.conversationHistory = [];
        
        // Current workflow step
        this.currentStep = 'AWAIT_VIN';
        
        // Tool registry - makes it easy to add/remove tools
        this.tools = this.registerTools();
        
        // Validation counters
        this.vinAttempts = 0;
        this.v5cAttempts = 0;
        this.otpAttempts = 0;
    }

    /**
     * Initialize state - mirrors Flowise seqState_0 configuration
     */
    initializeState() {
        return {
            vin: '',
            v5c: '',
            vehicle_make: '',
            vehicle_desc: '',
            model_year: '',
            email: '',
            phone: '',
            imageUrl: '',
            otp: '',
            first_name: '',
            lastName: '',
            address: '',
            recall_number: '',
            agency_campaign_number: '',
            campaign_desc: '',
            condition_and_risk: '',
            repair_description: '',
            recall_status: '',
            type_of_campaign: '',
            appointment_date: '',
            appointment_time: '',
            dealerIframeHtml: '',
            embedUrl: '',
            dealerZipCode: '',
            dealerName: '',
            dealerAddress: '',
            service_hours: '',
            recall_summary: '',
            aggregate: []
        };
    }

    /**
     * Register all tools - mirrors customTool nodes in Flowise
     * This modular approach makes it easy to:
     * 1. Test tools independently
     * 2. Replace with LLM tool calling later
     * 3. Add new tools without changing core logic
     */
    registerTools() {
        return {
            validate_vin_recall_status: this.createTool(
                'validate_vin_recall_status',
                'Validates VIN and fetches recall status from API',
                async (vin) => await this.validateVINRecallStatus(vin)
            ),
            
            validate_v5c_certificate: this.createTool(
                'validate_v5c_certificate',
                'Validates V5C certificate against mock database',
                async (v5c, vin) => await this.validateV5CCertificate(v5c, vin)
            ),
            
            get_dealer_by_zipcode_with_slots: this.createTool(
                'get_dealer_by_zipcode_with_slots',
                'Fetches dealer information by UK postal code',
                async (zipcode) => await this.getDealerByZipcode(zipcode)
            ),
            
            fetch_user_email_tool: this.createTool(
                'fetch_user_email_tool',
                'Fetches user email and name for verification',
                async (vin) => await this.fetchUserEmail(vin)
            ),
            
            send_otp_tool: this.createTool(
                'send_otp_tool',
                'Sends OTP to user email via SendGrid',
                async (email, vin) => await this.sendOTP(email, vin)
            ),
            
            verify_otp_tool: this.createTool(
                'verify_otp_tool',
                'Verifies user-entered OTP',
                async (userOtp, vin) => await this.verifyOTP(userOtp, vin)
            ),
            
            send_booking_confirmation_tool: this.createTool(
                'send_booking_confirmation_tool',
                'Sends booking confirmation email via SendGrid',
                async (bookingDetails) => await this.sendBookingConfirmation(bookingDetails)
            )
        };
    }

    /**
     * Tool wrapper - standardizes tool interface
     * Later: Replace with LangChain StructuredTool or similar
     */
    createTool(name, description, func) {
        return {
            name,
            description,
            execute: func
        };
    }

    /**
     * Main conversation handler - processes user input
     * 
     * CURRENT: Rule-based state machine
     * FUTURE: LLM decides which tool to call based on conversation context
     */
    async processMessage(userInput) {
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: userInput,
            timestamp: new Date().toISOString()
        });

        let response;

        try {
            // DETERMINISTIC WORKFLOW (for now)
            // Later: Replace with LLM-based intent classification
            response = await this.executeWorkflowStep(userInput);
        } catch (error) {
            response = this.handleError(error);
        }

        // Add agent response to history
        this.conversationHistory.push({
            role: 'assistant',
            content: response.message,
            step: this.currentStep,
            timestamp: new Date().toISOString()
        });

        return response;
    }

    /**
     * Execute current workflow step based on state machine
     * 
     * UPGRADE PATH TO LLM:
     * Replace this entire method with:
     * - LLM prompt with system message (from systemMessagePrompt in agent config)
     * - Conversation history
     * - Available tools
     * - Current state
     * - Let LLM decide next action
     */
    async executeWorkflowStep(userInput) {
        switch (this.currentStep) {
            case 'AWAIT_VIN':
                return await this.handleVINInput(userInput);
            
            case 'AWAIT_V5C':
                return await this.handleV5CInput(userInput);
            
            case 'DISPLAY_RECALL_INFO':
                return await this.handleRecallInfoDisplay();
            
            case 'AWAIT_ZIPCODE':
                return await this.handleZipcodeInput(userInput);
            
            case 'DISPLAY_DEALER_INFO':
                return await this.handleDealerDisplay();
            
            case 'AWAIT_APPOINTMENT_DETAILS':
                return await this.handleAppointmentInput(userInput);
            
            case 'AWAIT_EMAIL_CONFIRMATION':
                return await this.handleEmailConfirmation(userInput);
            
            case 'AWAIT_OTP':
                return await this.handleOTPInput(userInput);
            
            case 'CONFIRM_BOOKING':
                return await this.handleBookingConfirmation(userInput);
            
            case 'COMPLETED':
                return this.handleNewVINRequest(userInput);
            
            default:
                return {
                    message: "I'm here to help you check your vehicle recall status. Please provide your 17-character Vehicle Identification Number (VIN).",
                    step: 'AWAIT_VIN'
                };
        }
    }

    /**
     * STEP 1: Handle VIN input
     */
    async handleVINInput(userInput) {
        const vin = this.extractVIN(userInput);
        
        if (!vin) {
            this.vinAttempts++;
            
            if (this.vinAttempts >= 3) {
                return {
                    message: "Please contact Customer Care. <br>Call: 0800-123-4567 <br>Email: support@autorecall.com (quote your VIN).",
                    step: 'AWAIT_VIN',
                    error: true
                };
            }
            
            return {
                message: "Please enter a valid 17-character Vehicle Identification Number (VIN). You can find it on your Vehicle Registration Document, driver-side door, or windshield.",
                step: 'AWAIT_VIN'
            };
        }

        // Call tool: validate_vin_recall_status
        const recallResult = await this.tools.validate_vin_recall_status.execute(vin);
        
        if (!recallResult.success) {
            return {
                message: recallResult.message || "Unable to validate VIN. Please try again or contact customer care.",
                step: 'AWAIT_VIN'
            };
        }

        // Store VIN in state
        this.state.vin = vin;
        this.vinAttempts = 0;

        if (recallResult.hasRecall) {
            // Store recall data
            Object.assign(this.state, recallResult.data);
            
            this.currentStep = 'AWAIT_V5C';
            return {
                message: "Your vehicle has an active Safety Recall. Please provide your V5C certificate number for further verification.",
                step: 'AWAIT_V5C',
                data: recallResult.data
            };
        } else {
            this.currentStep = 'COMPLETED';
            return {
                message: "Good news! There are currently no outstanding recalls for your vehicle. We recommend checking again in a few months.",
                step: 'COMPLETED'
            };
        }
    }

    /**
     * STEP 2: Handle V5C input
     */
    async handleV5CInput(userInput) {
        const v5c = this.extractV5C(userInput);
        
        if (!v5c) {
            return {
                message: "Please provide your V5C certificate number. You can find it on your vehicle registration certificate.",
                step: 'AWAIT_V5C'
            };
        }

        // Call tool: validate_v5c_certificate
        const v5cResult = await this.tools.validate_v5c_certificate.execute(v5c, this.state.vin);
        
        if (!v5cResult.success) {
            this.v5cAttempts++;
            
            if (this.v5cAttempts >= 3) {
                return {
                    message: "V5C validation failed multiple times. Please contact Customer Care. <br>Call: 0800-123-4567 <br>Email: support@autorecall.com",
                    step: 'AWAIT_V5C',
                    error: true
                };
            }
            
            return {
                message: "V5C details were incorrect. You can find your V5C on the vehicle registration certificate. Please try again or contact customer care for help.",
                step: 'AWAIT_V5C'
            };
        }

        // Store V5C and vehicle details
        this.state.v5c = v5c;
        Object.assign(this.state, v5cResult.vehicleData);
        this.v5cAttempts = 0;

        this.currentStep = 'DISPLAY_RECALL_INFO';
        return {
            message: `Your VIN and V5C are successfully validated. You own a <b>${this.state.vehicle_desc} ${this.state.model_year}</b>.<br><img src="${this.state.imageUrl}" alt="Vehicle Image" width="400" style="border-radius:10px;"/><br><br>${this.state.recall_summary}`,
            step: 'DISPLAY_RECALL_INFO',
            data: v5cResult.vehicleData
        };
    }

    /**
     * STEP 3: Display recall info and ask for zipcode
     */
    async handleRecallInfoDisplay() {
        this.currentStep = 'AWAIT_ZIPCODE';
        return {
            message: "Let's find a dealer near you. Please enter your UK postcode (e.g., SO50 9TS) so I can show you the closest repair centers. We will use this only to find dealers — no marketing.",
            step: 'AWAIT_ZIPCODE'
        };
    }

    /**
     * STEP 4: Handle zipcode input
     */
    async handleZipcodeInput(userInput) {
        const zipcode = this.extractZipcode(userInput);
        
        if (!zipcode) {
            return {
                message: "Please enter a valid UK postcode (e.g., SO50 9TS).",
                step: 'AWAIT_ZIPCODE'
            };
        }

        // Call tool: get_dealer_by_zipcode_with_slots
        const dealerResult = await this.tools.get_dealer_by_zipcode_with_slots.execute(zipcode);
        
        if (!dealerResult.success) {
            return {
                message: "Unable to find dealers for this postcode. Please try another postcode or contact customer care.",
                step: 'AWAIT_ZIPCODE'
            };
        }

        // Store dealer info
        this.state.dealerZipCode = zipcode;
        Object.assign(this.state, dealerResult.dealerData);

        this.currentStep = 'DISPLAY_DEALER_INFO';
        return {
            message: this.formatDealerInfo(dealerResult.dealerData),
            step: 'DISPLAY_DEALER_INFO',
            data: dealerResult.dealerData
        };
    }

    /**
     * STEP 5: Display dealer info and ask for appointment
     */
    async handleDealerDisplay() {
        this.currentStep = 'AWAIT_APPOINTMENT_DETAILS';
        return {
            message: "Please provide your preferred date and time for the appointment. To proceed with booking, we'll need to verify your identity.",
            step: 'AWAIT_APPOINTMENT_DETAILS'
        };
    }

    /**
     * STEP 6: Handle appointment details
     */
    async handleAppointmentInput(userInput) {
        const appointmentDetails = this.extractAppointmentDetails(userInput);
        
        if (!appointmentDetails) {
            return {
                message: "Please provide your preferred date and time for the appointment.",
                step: 'AWAIT_APPOINTMENT_DETAILS'
            };
        }

        this.state.appointment_date = appointmentDetails.date;
        this.state.appointment_time = appointmentDetails.time;

        // Call tool: fetch_user_email_tool
        const userResult = await this.tools.fetch_user_email_tool.execute(this.state.vin);
        
        if (!userResult.success) {
            return {
                message: "Unable to fetch your registered email. Please contact customer care.",
                step: 'AWAIT_APPOINTMENT_DETAILS',
                error: true
            };
        }

        this.state.email = userResult.email;
        this.state.first_name = userResult.first_name;

        this.currentStep = 'AWAIT_EMAIL_CONFIRMATION';
        return {
            message: `We found your registered email: ${this.maskEmail(userResult.email)}. Is this correct? (Reply 'Yes' to use this email, or provide a new email address)`,
            step: 'AWAIT_EMAIL_CONFIRMATION',
            data: userResult
        };
    }

    /**
     * STEP 7: Handle email confirmation
     */
    async handleEmailConfirmation(userInput) {
        const input = userInput.toLowerCase().trim();
        
        if (input === 'yes') {
            // Use existing email
        } else if (this.isValidEmail(userInput)) {
            this.state.email = userInput;
        } else {
            return {
                message: "Please reply 'Yes' to use the registered email, or provide a valid email address.",
                step: 'AWAIT_EMAIL_CONFIRMATION'
            };
        }

        // Call tool: send_otp_tool
        const otpResult = await this.tools.send_otp_tool.execute(this.state.email, this.state.vin);
        
        if (!otpResult.success) {
            return {
                message: "Unable to send OTP. Please try again or contact customer care.",
                step: 'AWAIT_EMAIL_CONFIRMATION',
                error: true
            };
        }

        this.state.otp = otpResult.otp; // Store for verification

        this.currentStep = 'AWAIT_OTP';
        return {
            message: `For your security, a 6-digit verification code has been sent to ${this.maskEmail(this.state.email)}. Please enter it below to continue.`,
            step: 'AWAIT_OTP'
        };
    }

    /**
     * STEP 8: Handle OTP input
     */
    async handleOTPInput(userInput) {
        const otp = this.extractOTP(userInput);
        
        if (!otp) {
            return {
                message: "Please enter the 6-digit verification code sent to your email.",
                step: 'AWAIT_OTP'
            };
        }

        // Call tool: verify_otp_tool
        const verifyResult = await this.tools.verify_otp_tool.execute(otp, this.state.vin);
        
        if (!verifyResult.success) {
            this.otpAttempts++;
            
            if (this.otpAttempts >= 3) {
                return {
                    message: "OTP verification failed multiple times. Please request a new OTP or contact customer care.",
                    step: 'AWAIT_EMAIL_CONFIRMATION',
                    error: true
                };
            }
            
            return {
                message: "Invalid OTP. Please try again or request a new OTP.",
                step: 'AWAIT_OTP'
            };
        }

        this.otpAttempts = 0;
        this.currentStep = 'CONFIRM_BOOKING';
        return {
            message: `OTP verified successfully! Please confirm your appointment details:<br>Date: ${this.state.appointment_date}<br>Time: ${this.state.appointment_time}<br>Dealer: ${this.state.dealerName}<br><br>Reply 'Confirm' to finalize your booking.`,
            step: 'CONFIRM_BOOKING'
        };
    }

    /**
     * STEP 9: Handle booking confirmation
     */
    async handleBookingConfirmation(userInput) {
        const input = userInput.toLowerCase().trim();
        
        if (input !== 'confirm') {
            return {
                message: "Please reply 'Confirm' to finalize your booking, or provide updated appointment details.",
                step: 'CONFIRM_BOOKING'
            };
        }

        // Call tool: send_booking_confirmation_tool
        const confirmResult = await this.tools.send_booking_confirmation_tool.execute({
            email: this.state.email,
            vin: this.state.vin,
            vehicle_desc: this.state.vehicle_desc,
            model_year: this.state.model_year,
            recall_summary: this.state.recall_summary,
            appointment_date: this.state.appointment_date,
            appointment_time: this.state.appointment_time,
            dealerName: this.state.dealerName,
            dealerAddress: this.state.dealerAddress
        });
        
        if (!confirmResult.success) {
            return {
                message: "Unable to send confirmation email. Please contact customer care.",
                step: 'CONFIRM_BOOKING',
                error: true
            };
        }

        this.currentStep = 'COMPLETED';
        return {
            message: `📧 Your vehicle recall appointment is all set! I've sent a confirmation email to ${this.maskEmail(this.state.email)} with the date, time, and dealership details. Please check your inbox for the next steps before your visit.`,
            step: 'COMPLETED'
        };
    }

    /**
     * Handle new VIN request after completion
     */
    handleNewVINRequest(userInput) {
        if (this.containsVIN(userInput)) {
            // Reset state for new VIN
            this.state = this.initializeState();
            this.currentStep = 'AWAIT_VIN';
            this.vinAttempts = 0;
            this.v5cAttempts = 0;
            this.otpAttempts = 0;
            
            return this.handleVINInput(userInput);
        }
        
        return {
            message: "Would you like to check another vehicle's recall status? Please provide the 17-character VIN.",
            step: 'COMPLETED'
        };
    }

    // ==================== TOOL IMPLEMENTATIONS ====================

    /**
     * Tool: validate_vin_recall_status
     */
    async validateVINRecallStatus(vin) {
        try {
            const response = await fetch(`${this.config.apiEndpoints.vinRecall}?vin=${vin}`);
            const data = await response.json();
            
            if (!data || data.length === 0) {
                return {
                    success: true,
                    hasRecall: false,
                    message: "No recall found for this VIN"
                };
            }

            const recallData = data[0];
            
            return {
                success: true,
                hasRecall: recallData.vin_campaign_status === 'ACTIVE',
                data: {
                    recall_number: recallData.recall_number,
                    agency_campaign_number: recallData.agency_campaign_number,
                    campaign_desc: recallData.campaign_desc,
                    condition_and_risk: recallData.condition_and_risk,
                    repair_description: recallData.repair_description,
                    recall_status: recallData.vin_campaign_status,
                    type_of_campaign: recallData.type_of_campaign,
                    recall_summary: this.generateRecallSummary(recallData)
                }
            };
        } catch (error) {
            return {
                success: false,
                message: "Error validating VIN. Please try again."
            };
        }
    }

    /**
     * Tool: validate_v5c_certificate
     */
    async validateV5CCertificate(v5c, vin) {
        try {
            // Load V5C mock database
            const response = await fetch('/v5c-mock-db.json');
            const v5cDatabase = await response.json();
            
            const record = v5cDatabase.v5c_records.find(r => r.v5c === v5c && r.vin === vin);
            
            if (!record) {
                return {
                    success: false,
                    message: "V5C certificate does not match our records"
                };
            }

            return {
                success: true,
                vehicleData: {
                    vehicle_make: record.vehicle_make,
                    vehicle_desc: record.vehicle_desc,
                    model_year: record.model_year,
                    imageUrl: record.imageUrl
                }
            };
        } catch (error) {
            return {
                success: false,
                message: "Error validating V5C certificate"
            };
        }
    }

    /**
     * Tool: get_dealer_by_zipcode_with_slots
     */
    async getDealerByZipcode(zipcode) {
        try {
            const response = await fetch(`${this.config.apiEndpoints.dealerZipcode}?zipcode=${zipcode}`);
            const data = await response.json();
            
            if (!data || data.length === 0) {
                return {
                    success: false,
                    message: "No dealers found for this postcode"
                };
            }

            const dealer = data[0];
            
            return {
                success: true,
                dealerData: {
                    dealerName: dealer.name,
                    dealerAddress: dealer.address,
                    service_hours: dealer.service_hours,
                    dealerIframeHtml: dealer.map_embed_html,
                    embedUrl: dealer.map_url
                }
            };
        } catch (error) {
            return {
                success: false,
                message: "Error fetching dealer information"
            };
        }
    }

    /**
     * Tool: fetch_user_email_tool
     */
    async fetchUserEmail(vin) {
        try {
            const response = await fetch(`${this.config.apiEndpoints.userInfo}?vin=${vin}`);
            const data = await response.json();
            
            if (!data || data.length === 0) {
                return {
                    success: false,
                    message: "User information not found"
                };
            }

            const user = data[0];
            
            return {
                success: true,
                email: user.email,
                first_name: user.first_name,
                phone: user.phone
            };
        } catch (error) {
            return {
                success: false,
                message: "Error fetching user information"
            };
        }
    }

    /**
     * Tool: send_otp_tool
     */
    async sendOTP(email, vin) {
        try {
            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Send via SendGrid (simplified - in production use proper template)
            const response = await fetch(this.config.apiEndpoints.sendGrid, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.sendGridConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    personalizations: [{
                        to: [{ email }],
                        dynamic_template_data: {
                            otp,
                            vin
                        }
                    }],
                    from: { email: this.config.sendGridConfig.fromEmail },
                    template_id: this.config.sendGridConfig.templateId
                })
            });

            return {
                success: response.ok,
                otp // Store for verification
            };
        } catch (error) {
            return {
                success: false,
                message: "Error sending OTP"
            };
        }
    }

    /**
     * Tool: verify_otp_tool
     */
    async verifyOTP(userOtp, vin) {
        // Simple verification - compare with stored OTP
        if (userOtp === this.state.otp) {
            return {
                success: true
            };
        }
        
        return {
            success: false,
            message: "Invalid OTP"
        };
    }

    /**
     * Tool: send_booking_confirmation_tool
     */
    async sendBookingConfirmation(bookingDetails) {
        try {
            const response = await fetch(this.config.apiEndpoints.sendGrid, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.sendGridConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    personalizations: [{
                        to: [{ email: bookingDetails.email }],
                        dynamic_template_data: bookingDetails
                    }],
                    from: { email: this.config.sendGridConfig.fromEmail },
                    template_id: this.config.sendGridConfig.templateId
                })
            });

            return {
                success: response.ok
            };
        } catch (error) {
            return {
                success: false,
                message: "Error sending booking confirmation"
            };
        }
    }

    // ==================== HELPER METHODS ====================

    extractVIN(input) {
        const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/i;
        const match = input.match(vinPattern);
        return match ? match[0].toUpperCase() : null;
    }

    extractV5C(input) {
        // V5C format varies - simplified extraction
        const v5cPattern = /\b[A-Z0-9]{11,12}\b/i;
        const match = input.match(v5cPattern);
        return match ? match[0].toUpperCase() : null;
    }

    extractZipcode(input) {
        // UK postcode pattern
        const postcodePattern = /\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}\b/i;
        const match = input.match(postcodePattern);
        return match ? match[0].toUpperCase() : null;
    }

    extractOTP(input) {
        const otpPattern = /\b\d{6}\b/;
        const match = input.match(otpPattern);
        return match ? match[0] : null;
    }

    extractAppointmentDetails(input) {
        // Simplified - in production use NLP or structured input
        return {
            date: new Date().toISOString().split('T')[0],
            time: '10:00 AM'
        };
    }

    containsVIN(input) {
        return /\b[A-HJ-NPR-Z0-9]{17}\b/i.test(input);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    maskEmail(email) {
        const [username, domain] = email.split('@');
        const maskedUsername = username[0] + '*****' + username[username.length - 1];
        return `${maskedUsername}@${domain}`;
    }

    generateRecallSummary(recallData) {
        return `<b>Recall Summary:</b><br>
                <b>Condition:</b> ${recallData.campaign_desc}<br>
                <b>Risk:</b> ${recallData.condition_and_risk}<br>
                <b>Recommended Action:</b> ${recallData.repair_description}`;
    }

    formatDealerInfo(dealerData) {
        return `<b>Dealer Information:</b><br>
                <b>Name:</b> ${dealerData.dealerName}<br>
                <b>Address:</b> ${dealerData.dealerAddress}<br>
                <b>Service Hours:</b> ${dealerData.service_hours}<br>
                <b>Location:</b> ${dealerData.dealerIframeHtml}`;
    }

    handleError(error) {
        console.error('Agent error:', error);
        return {
            message: "I encountered an error. Please contact Customer Care. <br>Call: 0800-123-4567 <br>Email: support@autorecall.com",
            error: true
        };
    }

    /**
     * Get conversation history - useful for LLM context later
     */
    getConversationHistory() {
        return this.conversationHistory;
    }

    /**
     * Reset agent state
     */
    reset() {
        this.state = this.initializeState();
        this.conversationHistory = [];
        this.currentStep = 'AWAIT_VIN';
        this.vinAttempts = 0;
        this.v5cAttempts = 0;
        this.otpAttempts = 0;
    }
}

// Export for use in UI
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VehicleRecallAgent;
}
