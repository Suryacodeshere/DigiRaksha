import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Phone, ExternalLink, HelpCircle } from 'lucide-react';
import { getChatBotResponse } from '../services/firebaseService';

const ChatSupport = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm UPI Guard AI Assistant. I'm here to help you with UPI fraud detection and safety. How can I assist you today?",
      sender: 'bot',
      timestamp: Date.now(),
      options: [
        "Check UPI ID safety",
        "Report fraud",
        "Get helpline numbers",
        "Learn about UPI safety"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

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
      // Simulate thinking time
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const botResponse = getChatBotResponse(messageText);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: Date.now(),
        options: botResponse.options,
        helplines: botResponse.helplines,
        tips: botResponse.tips,
        actions: botResponse.actions,
        quickReplies: botResponse.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble processing your request right now. Please try again or contact our helpline at 1930.",
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
    "How to check UPI ID safety?",
    "What is UPI fraud?",
    "How to report fraud?",
    "Emergency helpline numbers",
    "UPI safety tips",
    "Is my payment safe?"
  ];

  return (
    <div className="chat-support">
      <div className="card" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '1rem', 
          borderBottom: '1px solid #E5E7EB',
          background: 'rgba(59, 130, 246, 0.05)'
        }}>
          <Bot size={24} color="#3B82F6" />
          <div style={{ marginLeft: '0.75rem' }}>
            <h2 style={{ margin: 0, color: '#1F2937', fontSize: '1.125rem' }}>UPI Guard AI Assistant</h2>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>24/7 Fraud Prevention Support</p>
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          padding: '1rem', 
          overflowY: 'auto', 
          maxHeight: '50vh'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '1rem'
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                maxWidth: '80%'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: message.sender === 'user' ? '#3B82F6' : '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: message.sender === 'user' ? '0 0 0 0.5rem' : '0 0.5rem 0 0',
                  flexShrink: 0
                }}>
                  {message.sender === 'user' ? 
                    <User size={18} color="white" /> : 
                    <Bot size={18} color="white" />
                  }
                </div>

                <div>
                  <div style={{
                    background: message.sender === 'user' ? '#3B82F6' : 'rgba(255, 255, 255, 0.9)',
                    color: message.sender === 'user' ? 'white' : '#1F2937',
                    padding: '0.75rem 1rem',
                    borderRadius: message.sender === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: message.sender === 'bot' ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'
                  }}>
                    <p style={{ margin: 0, lineHeight: '1.5' }}>{message.text}</p>
                    
                    {/* Bot Options */}
                    {message.options && (
                      <div style={{ marginTop: '0.75rem' }}>
                        {message.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickReply(option)}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              margin: '0.25rem 0',
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                              borderRadius: '0.5rem',
                              color: '#3B82F6',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              textAlign: 'left'
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Helpline Numbers */}
                    {message.helplines && (
                      <div style={{ marginTop: '0.75rem' }}>
                        {message.helplines.map((helpline, index) => (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem',
                              margin: '0.25rem 0',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              borderRadius: '0.5rem'
                            }}
                          >
                            <span style={{ fontSize: '0.875rem', color: '#059669' }}>
                              {helpline.name}: {helpline.number}
                            </span>
                            {helpline.clickToCall && (
                              <button
                                onClick={() => handleCallHelpline(helpline.number)}
                                style={{
                                  background: '#059669',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <Phone size={12} />
                                Call
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Safety Tips */}
                    {message.tips && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <ul style={{ margin: 0, paddingLeft: '1rem', color: '#4B5563' }}>
                          {message.tips.map((tip, index) => (
                            <li key={index} style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items */}
                    {message.actions && (
                      <div style={{ marginTop: '0.75rem' }}>
                        {message.actions.map((action, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '0.5rem',
                              margin: '0.25rem 0',
                              background: 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.2)',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              color: '#D97706'
                            }}
                          >
                            • {action}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Replies */}
                    {message.quickReplies && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {message.quickReplies.map((reply, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickReply(reply)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(107, 114, 128, 0.1)',
                              border: '1px solid rgba(107, 114, 128, 0.2)',
                              borderRadius: '1rem',
                              color: '#4B5563',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9CA3AF',
                    marginTop: '0.25rem',
                    textAlign: message.sender === 'user' ? 'right' : 'left'
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.5rem'
                }}>
                  <Bot size={18} color="white" />
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '0.75rem 1rem',
                  borderRadius: '1rem 1rem 1rem 0.25rem',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div className="loading-spinner" style={{ marginRight: '0.5rem' }}></div>
                  <span style={{ color: '#6B7280' }}>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div style={{ padding: '0 1rem', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ padding: '0.5rem 0', fontSize: '0.8rem', color: '#6B7280' }}>
            Quick suggestions:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.5rem' }}>
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(suggestion)}
                disabled={loading}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '1rem',
                  color: '#3B82F6',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: '1rem', 
          borderTop: '1px solid #E5E7EB',
          background: 'rgba(249, 250, 251, 0.5)'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
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
              placeholder="Ask me about UPI safety, fraud reporting, or get help..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '2px solid #E5E7EB',
                borderRadius: '0.75rem',
                resize: 'none',
                minHeight: '44px',
                maxHeight: '100px',
                fontSize: '1rem',
                background: 'white',
                opacity: loading ? 0.5 : 1
              }}
              rows={1}
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={loading || !inputMessage.trim()}
              className="btn btn-primary"
              style={{
                padding: '0.75rem',
                minWidth: '44px',
                opacity: loading || !inputMessage.trim() ? 0.5 : 1
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>
          <HelpCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Emergency Contacts
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '0.5rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#DC2626' }}>Cyber Crime Helpline</h4>
            <p style={{ margin: '0 0 0.5rem 0', color: '#4B5563', fontSize: '0.9rem' }}>
              Report cyber crimes and UPI fraud
            </p>
            <button
              onClick={() => handleCallHelpline('1930')}
              style={{
                background: '#DC2626',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Phone size={16} />
              Call 1930
            </button>
          </div>

          <div style={{ 
            padding: '1rem', 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '0.5rem',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#3B82F6' }}>Banking Fraud</h4>
            <p style={{ margin: '0 0 0.5rem 0', color: '#4B5563', fontSize: '0.9rem' }}>
              Report banking and payment frauds
            </p>
            <button
              onClick={() => handleCallHelpline('1800-425-3800')}
              style={{
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Phone size={16} />
              Call Now
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#3B82F6',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}
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
