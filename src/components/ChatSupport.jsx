import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Phone, ExternalLink, HelpCircle } from 'lucide-react';
import chatgptService from '../services/chatgptService';
import DigiRakshaLogo from './DigiRakshaLogo';
import './ChatSupport.css';

const ChatSupport = ({ user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello there! \ud83d\udc4b I'm your dedicated digital security assistant. I'm passionate about helping you stay safe with your online payments and transactions. What's on your mind today?",
      sender: 'bot',
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState(null); // null = checking, true = online, false = offline
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkServiceAvailability = async () => {
    try {
      const available = await chatgptService.isServiceAvailable();
      setServiceAvailable(available);
    } catch (error) {
      setServiceAvailable(false);
    }
  };

  useEffect(() => {
    // Check service availability on mount
    checkServiceAvailability();
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Check for sensitive information
    const sensitivePatterns = [/\b\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b/, /\b\d{6}\b/, /password|pin|otp/i];
    const hasSensitiveInfo = sensitivePatterns.some(pattern => pattern.test(messageText.trim()));
    
    if (hasSensitiveInfo) {
      const warningMessage = {
        id: Date.now() + 1,
        text: '⚠️ **Hey, hold on!** I noticed you might be sharing sensitive info like card numbers or PINs. For your safety, I can\'t process messages with personal details. Let\'s keep our chat focused on general security questions - I\'m here to help you stay safe! 😊',
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, warningMessage]);
      setInputMessage('');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: messageText.trim(),
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Use real backend service
      const options = {
        user_id: user?.uid || user?.email || 'anonymous_user',
        personality: 'friendly_conversational_assistant'
      };
      
      const response = await chatgptService.sendMessage(messageText.trim(), true, options);
      
      if (response.success && response.message) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.message,
          sender: 'bot',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: `Oops! 😅 I'm having a bit of trouble connecting right now. This happens sometimes - technology, right?\n\n**Here's what might help:**\n• Check if you're connected to the internet\n• Give it another try in a few seconds\n• Meanwhile, feel free to explore the other helpful tools in the app!\n\nI'll be back to my helpful self in no time! 🚀`,
          sender: 'bot',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Oh no! 😰 I seem to be having some technical hiccups right now. Don't worry though - these things happen!\n\n**Let's try to fix this:**\n• Try refreshing the page\n• Wait a moment and try again\n• If I'm still acting up, please reach out to our support team\n\nSorry for the inconvenience! I really want to help you with your security questions. 🙏`,
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const handleCallHelpline = (number) => {
    window.location.href = `tel:${number}`;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickSuggestions = [
    "How can I check if a payment request is safe?",
    "What are the warning signs of digital payment fraud?",
    "What should I do if I think I've been scammed?",
    "Can you share emergency helpline numbers?",
    "What are the best digital payment safety tips?",
    "How do I know if my transaction is secure?"
  ];

  return (
    <div className="chat-support">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-header-icon">
              <DigiRakshaLogo size={32} />
            </div>
            <div className="header-text">
              <h2>Digi Raksha Assistant</h2>
              <span className="status-tagline">Your personal digital security companion</span>
            </div>
          </div>
          <div className="chat-header-right">
            <div className="chat-status">
              <span className="status-indicator">
                {serviceAvailable === true ? '🟢' : 
                 serviceAvailable === false ? '🔴' : 
                 '🔄'}
              </span>
              <span>
                {serviceAvailable === true ? 'Online' : 
                 serviceAvailable === false ? 'Offline' : 
                 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        <div className="chat-messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.sender}`}
            >
              <div className={`message-bubble ${message.sender}`}>
                <div className={`message-avatar ${message.sender}`}>
                  {message.sender === 'user' ? 
                    <User size={18} /> : 
                    <DigiRakshaLogo size={22} />
                  }
                </div>

                <div className="message-content">
                  <div className={`message-text ${message.sender}`}>
                    {message.text}
                  </div>
                  
                  <div className={`message-timestamp ${message.sender}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="loading-message">
              <div className="loading-bubble">
                <div className="loading-avatar">
                  <DigiRakshaLogo size={22} />
                </div>
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="quick-suggestions-section">
          <div className="suggestions-label">
            Quick suggestions:
          </div>
          <div className="suggestions-grid">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(suggestion)}
                disabled={loading}
                className="suggestion-btn"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="chat-input-section">
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }
              }}
              placeholder="Ask me anything about digital payment security, fraud prevention, or safety tips..."
              disabled={loading}
              className="message-textarea"
              rows={1}
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={loading || !inputMessage.trim()}
              className="send-button"
            >
              <span className="send-arrow-icon" style={{color: 'white', fontSize: '16px', fontWeight: '900', textAlign: 'center', display: 'block'}}>{'>'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="emergency-contacts">
        <div className="emergency-header">
          <HelpCircle size={20} />
          <h3>Emergency Contacts</h3>
        </div>
        <div className="contacts-grid">
          <div className="contact-card emergency">
            <h4>Cyber Crime Helpline</h4>
            <p>
              Report cyber crimes and UPI fraud
            </p>
            <button
              onClick={() => handleCallHelpline('1930')}
              className="contact-button emergency"
            >
              <Phone size={16} />
              Call 1930
            </button>
          </div>

          <div className="contact-card banking">
            <h4>Banking Fraud</h4>
            <p>
              Report banking and payment frauds
            </p>
            <button
              onClick={() => handleCallHelpline('1800-425-3800')}
              className="contact-button banking"
            >
              <Phone size={16} />
              Call Now
            </button>
          </div>
        </div>

        <div className="portal-link">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
            Visit National Cybercrime Portal
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
