import axios from 'axios';
import offlineQAService from './offlineQAService.js';

class ChatGPTService {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.conversationHistory = [];
  }

  /**
   * Send a message to ChatGPT and get a response
   * @param {string} message - User message
   * @param {boolean} includeHistory - Whether to include conversation history
   * @param {Object} options - Additional options like user_id, personality
   * @returns {Promise<Object>} ChatGPT response
   */
  async sendMessage(message, includeHistory = true, options = {}) {
    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        success: false,
        error: 'Please provide a valid message.',
        details: 'Message is required and cannot be empty.'
      };
    }

    const startTime = Date.now();
    
    try {
      const payload = {
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      // Include conversation history if requested
      if (includeHistory && this.conversationHistory.length > 0) {
        // Limit history to last 10 messages to avoid token limits
        payload.conversation_history = this.conversationHistory.slice(-10);
      }

      // Add enhanced AI features
      if (options.user_id) {
        payload.user_id = options.user_id;
      }
      
      if (options.personality) {
        payload.personality = options.personality;
      }

      // Add request timeout and retry logic
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Digi-Raksha-Frontend/1.0'
        },
        timeout: 25000, // 25 second timeout
        validateStatus: function (status) {
          // Accept status codes in the 2xx range and some specific error codes
          return (status >= 200 && status < 300) || status === 503;
        }
      };

      const response = await axios.post(`${this.baseURL}/chat`, payload, axiosConfig);
      const responseTime = Date.now() - startTime;

      // Handle different response scenarios
      if (response.status === 503) {
        return {
          success: false,
          error: '🤖 AI assistant is temporarily unavailable. This usually means the API service is offline or overloaded.',
          details: 'Service temporarily unavailable (503)',
          responseTime
        };
      }

      const aiResponse = response.data;

      // Validate response structure
      if (!aiResponse || typeof aiResponse !== 'object') {
        return {
          success: false,
          error: 'Invalid response format from AI service.',
          details: 'Response data is malformed',
          responseTime
        };
      }

      // Extract response content with fallbacks
      const responseContent = aiResponse.response || aiResponse.message || aiResponse.answer;
      
      if (!responseContent) {
        return {
          success: false,
          error: 'AI assistant returned an empty response.',
          details: 'No content in response',
          responseTime
        };
      }

      // Update conversation history
      if (includeHistory) {
        this.conversationHistory.push(
          { role: 'user', content: message.trim() },
          { role: 'assistant', content: responseContent }
        );
        
        // Keep history manageable (max 20 messages)
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }
      }

      return {
        success: true,
        message: responseContent,
        model: aiResponse.model || aiResponse.engine || 'Enhanced AI',
        usage: aiResponse.usage,
        timestamp: aiResponse.timestamp || new Date().toISOString(),
        enhanced_features: aiResponse.enhanced_features,
        responseTime
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('ChatGPT Service Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        responseTime
      });
      
      let errorMessage = 'Failed to get response from AI assistant';
      let errorDetails = error.message;
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = '⏱️ Request timed out. The AI service is taking too long to respond.';
        errorDetails = `Timeout after ${responseTime}ms`;
      } else if (error.response) {
        // Server responded with an error
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMessage = '🚨 Invalid request format. Please try rephrasing your message.';
            break;
          case 401:
            errorMessage = '🔐 Authentication failed. API key may be invalid or expired.';
            break;
          case 403:
            errorMessage = '🚫 Access forbidden. Check API permissions.';
            break;
          case 429:
            errorMessage = '🚀 Rate limit exceeded. Please wait a moment before trying again.';
            break;
          case 500:
            errorMessage = '🛠️ Internal server error. The AI service is experiencing issues.';
            break;
          case 503:
            errorMessage = '🔧 AI service is temporarily unavailable. Please try again in a few minutes.';
            break;
          default:
            errorMessage = `⚠️ AI service error (${status}). Please try again.`;
        }
        
        if (data && (data.error || data.message)) {
          errorDetails = data.error || data.message;
        }
      } else if (error.request) {
        // Network error - try offline response
        if (error.code === 'ECONNREFUSED') {
          errorMessage = '🔌 Cannot connect to AI service. Trying offline mode...';
          errorDetails = `Connection refused to ${this.baseURL}`;
        } else if (error.code === 'ENOTFOUND') {
          errorMessage = '🌐 Network error. Trying offline mode...';
          errorDetails = 'DNS resolution failed';
        } else {
          errorMessage = '📶 Network error. Trying offline mode...';
        }
        
        // Try to get offline response
        console.log('Backend unavailable, attempting offline response...');
        const offlineResponse = offlineQAService.getOfflineResponse(message);
        if (offlineResponse.success) {
          return {
            success: true,
            message: offlineResponse.message,
            model: 'Offline Mode',
            offline: true,
            matchType: offlineResponse.matchType,
            confidence: offlineResponse.confidence,
            category: offlineResponse.category,
            timestamp: offlineResponse.timestamp,
            responseTime
          };
        }
      } else {
        errorMessage = '😵 Unexpected error occurred while contacting AI service.';
      }

      // If offline response also fails, try one more time
      console.log('Trying offline response as final fallback...');
      const finalOfflineResponse = offlineQAService.getOfflineResponse(message);
      if (finalOfflineResponse.success) {
        return {
          success: true,
          message: finalOfflineResponse.message + '\n\n⚠️ Note: I\'m currently working in offline mode with limited capabilities.',
          model: 'Offline Mode',
          offline: true,
          matchType: finalOfflineResponse.matchType,
          confidence: finalOfflineResponse.confidence,
          timestamp: finalOfflineResponse.timestamp,
          responseTime
        };
      }

      return {
        success: false,
        error: errorMessage,
        details: errorDetails,
        responseTime,
        errorType: error.code || 'UNKNOWN'
      };
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   * @returns {Array} Conversation history
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Check if ChatGPT service is available
   * @returns {Promise<boolean>} Service availability status
   */
  async isServiceAvailable() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 8000, // Increased timeout for health check
        headers: {
          'User-Agent': 'Digi-Raksha-Frontend/1.0'
        },
        validateStatus: function (status) {
          // Accept 2xx and specific error codes that might indicate partial availability
          return (status >= 200 && status < 300) || status === 503;
        }
      });
      
      // Handle partial availability (503 with some services working)
      if (response.status === 503) {
        console.warn('Service partially available (503)');
        return false; // Conservative approach - treat as unavailable
      }
      
      // Check for enhanced AI availability or fallback to chatgpt_available
      const data = response.data;
      const available = data.advanced_ai_available === true || 
                       data.chatgpt_available === true || 
                       data.enhanced_ai_available === true ||
                       data.ai_available === true ||
                       data.status === 'healthy' ||
                       data.status === 'online';
                       
      console.log('Service availability check:', {
        available,
        status: data.status,
        features: {
          advanced_ai: data.advanced_ai_available,
          chatgpt: data.chatgpt_available,
          enhanced_ai: data.enhanced_ai_available,
          ai_general: data.ai_available
        }
      });
      
      return available;
    } catch (error) {
      // More detailed error logging
      const errorInfo = {
        code: error.code,
        status: error.response?.status,
        message: error.message
      };
      
      console.warn('Health check failed:', errorInfo);
      
      // Don't log as error for expected network failures
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.info('Backend server appears to be offline');
      }
      
      return false;
    }
  }

  /**
   * Get service status information
   * @returns {Promise<Object>} Service status details
   */
  async getServiceStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000,
      });
      
      return {
        available: response.data.chatgpt_available === true,
        modelLoaded: response.data.model_loaded === true,
        status: response.data.status,
        timestamp: response.data.timestamp,
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Send a quick UPI-related query
   * @param {string} upiId - UPI ID to analyze
   * @returns {Promise<Object>} Analysis response
   */
  async analyzeUPI(upiId) {
    const message = `Please analyze this UPI ID for potential fraud indicators: ${upiId}

Please provide:
1. Risk level assessment
2. Any suspicious patterns you notice
3. Safety recommendations`;

    return this.sendMessage(message, false); // Don't include history for analysis
  }

  /**
   * Ask about QR code safety
   * @param {string} context - Context about the QR code
   * @returns {Promise<Object>} Safety advice response
   */
  async checkQRSafety(context) {
    const message = `I need advice about QR code safety. Context: ${context}

Please provide safety guidelines and red flags to watch out for.`;

    return this.sendMessage(message, false);
  }

  /**
   * Get general UPI security tips
   * @returns {Promise<Object>} Security tips response
   */
  async getSecurityTips() {
    const message = `Please provide the top 10 essential UPI security tips to prevent fraud. 
Make them practical and easy to follow for everyday users.`;

    return this.sendMessage(message, false);
  }
}

// Export a singleton instance
export default new ChatGPTService();