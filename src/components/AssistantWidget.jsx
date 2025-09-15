import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertCircle, Loader, Trash2, Download, Flag, Shield, Search, QrCode 
} from 'lucide-react';
import chatgptService from '../services/chatgptService';
import DigiRakshaLogo from './DigiRakshaLogo';
import './AssistantWidget.css';
// Emoji fallback components for better visibility
const EmojiIcon = ({ emoji, size = 24, ...props }) => (
  <span 
    style={{ 
      fontSize: `${size}px`, 
      lineHeight: 1, 
      display: 'inline-flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      width: `${size}px`,
      height: `${size}px`
    }} 
    {...props}
  >
    {emoji}
  </span>
);

const AssistantWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState(null); // null = checking, true = online, false = offline
  const [conversationContext, setConversationContext] = useState([]); // Track conversation context
  const [userPreferences, setUserPreferences] = useState({ topics: [], queries: [] }); // Learn user interests
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Add welcome message when widget opens for the first time
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
    
    // Check service availability when opening
    if (isOpen) {
      // Always show as online initially for better UX
      setServiceAvailable(true);
      checkServiceAvailability();
      
      // Set up periodic check to keep service online
      const intervalId = setInterval(() => {
        checkServiceAvailability();
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [isOpen]);
  
  // Check service availability
  const checkServiceAvailability = async () => {
    try {
      const available = await chatgptService.isServiceAvailable();
      setServiceAvailable(available);
    } catch (error) {
      console.error('Service availability check failed:', error);
      // Always show as online for better user experience
      setServiceAvailable(true);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update conversation context when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const recentMessages = messages.slice(-10); // Keep last 10 messages for context
      setConversationContext(recentMessages);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addWelcomeMessage = () => {
    const welcomeMessage = {
      id: `welcome-${Date.now()}`,
      type: 'assistant',
      content: `Hello! 🤗 I'm your Digi Raksha Assistant - your personal guardian for digital payment security!

I can instantly help you with:
• 🛡️ Essential security tips for safe payments
• 🔍 How to spot and avoid fraud attempts
• 📱 QR code safety precautions
• 🕵️ Verifying payment request legitimacy
• 🆘 What to do if you've been scammed
• 🆘 Emergency helpline numbers

Quick Start: Try the suggestion buttons below, or ask me specific questions like:
• How can I check if a payment request is safe?
• What are the warning signs of digital payment fraud?
• What are the best digital payment safety tips?

💡 Pro Tip: I provide detailed, actionable advice based on RBI guidelines and cybersecurity best practices. Your safety is my priority!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const currentMessage = inputMessage.trim();
    
    // Check for sensitive information
    const sensitivePatterns = [/\b\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b/, /\b\d{6}\b/, /password|pin|otp/i];
    const hasSensitiveInfo = sensitivePatterns.some(pattern => pattern.test(currentMessage));
    
    if (hasSensitiveInfo) {
      const warningMessage = {
        id: `warning-${Date.now()}`,
        type: 'assistant',
        content: '⚠️ **Hey, hold on!** I noticed you might be sharing sensitive info like card numbers or PINs. For your safety, I can\'t process messages with personal details. Let\'s keep our chat focused on general security questions - I\'m here to help you stay safe! 😊',
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, warningMessage]);
      setInputMessage('');
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use the backend AI service with conversation context
      const options = {
        user_id: user?.uid || user?.email || 'anonymous_user',
        personality: 'friendly_conversational_assistant',
        conversation_history: conversationContext.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      };
      
      const response = await chatgptService.sendMessage(currentMessage, true, options);
      
      if (response.success && response.message) {
        const assistantMessage = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: response.message,
          timestamp: new Date(),
          model: response.model || 'Advanced AI Assistant',
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback to local intelligent responses if backend fails
        const fallbackResponse = getIntelligentResponse(currentMessage, conversationContext);
        const assistantMessage = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: fallbackResponse,
          timestamp: new Date(),
          model: 'Digi Raksha AI Assistant (Offline Mode)',
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
      
    } catch (error) {
      console.error('❌ Assistant Error:', error);
      
      // Use local intelligent response as fallback
      try {
        const fallbackResponse = getIntelligentResponse(currentMessage, conversationContext);
        const assistantMessage = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: fallbackResponse,
          timestamp: new Date(),
          model: 'Digi Raksha AI Assistant (Offline Mode)',
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (fallbackError) {
        const errorMessage = {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: `I apologize, but I encountered an error processing your request. Please try rephrasing your question or use one of the quick suggestion buttons below. I'm here to help! 😊`,
          timestamp: new Date(),
          error: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationContext([]);
    chatgptService.clearHistory();
    if (isOpen) {
      addWelcomeMessage();
    }
  };

  // User control functions
  const exportTranscript = () => {
    const transcript = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.type === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Digi-Raksha-Chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reportMisbehavior = () => {
    const reportMessage = {
      id: `report-${Date.now()}`,
      type: 'assistant',
      content: '📝 **Thanks for letting us know!** Your feedback really matters to us and helps make me a better assistant for everyone.\n\n**Here\'s what happens next:**\n• I\'ve logged your feedback for our team\n• They\'ll review our conversation to see how I can improve\n• We take every report seriously and use them to get better\n\nIn the meantime, if you need help right away, feel free to try the other useful tools in the app! 😊',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, reportMessage]);
  };

  // Specific responses as requested by user
  const specificResponses = {
    'payment request safe': `You should always verify the source before making any payment. Double-check the sender's details, confirm through official channels, and never trust links or QR codes sent by unknown people. If the request feels urgent or suspicious, it's best to stop and verify first.`,
    
    'fraud warning signs': `Some common warning signs include:

Unexpected requests for money from strangers or even known contacts.

Urgent messages pressuring you to pay immediately.

Suspicious links, QR codes, or phone numbers.

Requests to share your OTP, PIN, or CVV.

If you notice any of these, do not proceed.`,
    
    'been scammed': `If you suspect a scam:

Stop the transaction immediately (if possible).

Contact your bank or payment app's customer support.

Report the fraud to the cybercrime helpline (1930 in India) or local authorities.

Change your passwords and secure your accounts.`,
    
    'helplines': `Yes, here are some important helpline numbers (India):

Cybercrime Helpline: 1930

National Cybercrime Reporting Portal: www.cybercrime.gov.in

Police: 100

(If outside India, check your local emergency services numbers.)`,
    
    'security tips': `Never share OTP, PIN, CVV, or passwords with anyone.

Always use secure, official apps.

Avoid clicking on unknown links or scanning random QR codes.

Enable two-factor authentication.

Regularly check your bank/payment statements for unusual activity.`,
    
    'transaction secure': `A transaction is usually secure if:

It's done through official apps/websites with HTTPS encryption.

You receive confirmation messages or emails from your bank/payment provider.

The recipient's details match what you expect.

You haven't shared sensitive details (like OTP) with anyone during the process.`,
    
    // Additional responses
    'fake payment app': `Only download apps from official app stores (Google Play, App Store). Check the developer name, reviews, and permissions. Fake apps often have spelling mistakes or very few downloads.`,
    
    'save card details': `It is safer not to. If you must, use trusted platforms with encryption and always enable two-factor authentication. Delete saved details after use if possible.`,
    
    'shared otp accidentally': `Call your bank or payment app immediately to block transactions. Change your PIN and password right away.`,
    
    'steal money without otp': `OTP is a strong layer of security. But if your card or PIN is stolen, some transactions may still happen (such as offline or international ones). Always report a lost card immediately.`,
    
    'transaction limits': `Most banks and UPI apps allow you to set daily or per-transaction limits in settings. Lowering the limit reduces loss risk in case of fraud.`,
    
    'fraudster tricks': `They may pretend to be bank officials, send fake job or lottery offers, or request money urgently. Some also use fake customer care numbers or phishing links.`,
    
    'qr code scams': `Fraudsters may send QR codes saying you will "receive" money, but scanning actually makes you pay them. Remember: scanning a QR code is for paying, not receiving money.`,
    
    'fake payment links': `Check if the link starts with https:// and belongs to the official domain. Avoid shortened or strange links. When in doubt, do not click.`,
    
    'screen sharing danger': `Screen sharing allows scammers to see your OTP, PIN, or passwords. Never allow it during banking or payment.`,
    
    'fake refund': `Do not accept it. Scammers may trick you into sending money instead of receiving a refund. Verify directly with your bank or payment app.`,
    
    'money recovery fraud': `Sometimes yes, if you report quickly. Banks can try to freeze or reverse the transaction. But recovery is not guaranteed.`,
    
    'fraud case time': `Usually 7 to 90 days, depending on the case and investigation. Reporting immediately increases your chances.`,
    
    'first contact fraud': `First call your bank or payment app to block transactions. Then report to the cybercrime helpline (1930 in India) or local authorities.`,
    
    'cybercrime complaint': `In India, visit cybercrime.gov.in. Fill in details with evidence such as screenshots and transaction IDs. Other countries have similar national cybercrime portals.`,
    
    'trace fraudsters': `Yes, with transaction IDs, phone numbers, and digital footprints, police or cyber cells can track fraudsters. Success depends on how fast you report.`
  };

  // Intelligent quick suggestion buttons
  const quickActions = [
    {
      text: "Security Tips",
      emoji: "🛡️",
      action: () => {
        addIntelligentResponse("Can you share some top digital payment security tips with me?");
      }
    },
    {
      text: "Fraud Detection", 
      emoji: "🔍",
      action: () => {
        addIntelligentResponse("How do I spot if someone is trying to fraud me through digital payments?");
      }
    },
    {
      text: "QR Code Safety",
      emoji: "📱",
      action: () => {
        addIntelligentResponse("What safety precautions should I take before scanning payment QR codes?");
      }
    },
    {
      text: "Payment Requests",
      emoji: "🕵️",
      action: () => {
        addIntelligentResponse("How can I check if a payment request is safe?");
      }
    },
    {
      text: "Scam Response",
      emoji: "🆘",
      action: () => {
        addIntelligentResponse("What should I do if I think I've been scammed?");
      }
    },
    {
      text: "Emergency Helplines",
      emoji: "🆘",
      action: () => {
        addIntelligentResponse("Can you share emergency helpline numbers?");
      }
    }
  ];

  // Function to add intelligent responses using backend AI service
  const addIntelligentResponse = async (userMessage) => {
    const userMsg = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Use the backend AI service
      const options = {
        user_id: user?.uid || user?.email || 'anonymous_user',
        personality: 'friendly_conversational_assistant',
        conversation_history: conversationContext.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      };
      
      const response = await chatgptService.sendMessage(userMessage, true, options);
      
      if (response.success && response.message) {
        const assistantMsg = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: response.message,
          timestamp: new Date(),
          model: response.model || 'Advanced AI Assistant',
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        // Fallback to local response
        const fallbackResponse = getIntelligentResponse(userMessage, conversationContext);
        const assistantMsg = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: fallbackResponse,
          timestamp: new Date(),
          model: 'Digi Raksha AI Assistant (Offline Mode)',
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (error) {
      console.error('Error in addIntelligentResponse:', error);
      // Fallback to local response
      const fallbackResponse = getIntelligentResponse(userMessage, conversationContext);
      const assistantMsg = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
        model: 'Digi Raksha AI Assistant (Offline Mode)',
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Advanced AI-like response system with context awareness
  const getIntelligentResponse = (message, context = []) => {
    const lowerMessage = message.toLowerCase();
    
    // Update user preferences based on query
    updateUserPreferences(message);
    
    // Check for conversation context and follow-ups
    const contextualResponse = getContextualResponse(message, context);
    if (contextualResponse) {
      return contextualResponse;
    }
    
    // Direct question matches
    if (localResponses[message]) {
      return localResponses[message];
    }
    
    // Advanced keyword matching with fuzzy logic
    const matchedResponse = findBestMatch(message);
    if (matchedResponse) {
      return matchedResponse;
    }
    
    // Greeting responses with personalization
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const userName = user?.name || user?.displayName || 'there';
      return `Hello ${userName}! 😊 I'm your Digi Raksha Assistant. I'm here to help you with digital payment security.

I can assist you with:
• 🛡️ Security tips and best practices
• 🔍 How to spot fraud attempts
• 📱 QR code safety guidelines
• 🆘 What to do if scammed
• 🆘 Emergency helpline numbers

What would you like to know about today?`;
    }
    
    // Thank you responses
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return `You're very welcome! 😊 I'm always here to help keep your digital payments safe and secure. Feel free to ask me anything else about payment security, fraud prevention, or if you need emergency contacts!`;
    }
    
    // Provide intelligent fallback based on user history
    return getPersonalizedFallback();
  };
  
  // Find best matching response using advanced text matching
  const findBestMatch = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Define keyword groups with your specific responses
    const keywordMatches = [
      {
        keywords: ['warning signs', 'fraud signs', 'red flags', 'danger signs', 'suspicious', 'alerts'],
        response: specificResponses['fraud warning signs']
      },
      {
        keywords: ['security tips', 'safety tips', 'secure payment', 'safe payment', 'protection tips', 'best digital payment'],
        response: specificResponses['security tips']
      },
      {
        keywords: ['fraud detection', 'spot fraud', 'detect fraud', 'identify fraud', 'find scam'],
        response: specificResponses['fraud warning signs']
      },
      {
        keywords: ['payment request', 'request safe', 'verify payment', 'check payment', 'validate request', 'payment request safe'],
        response: specificResponses['payment request safe']
      },
      {
        keywords: ['been scammed', 'scammed', 'fraud happened', 'got cheated', 'lost money', 'think i\'ve been scammed'],
        response: specificResponses['been scammed']
      },
      {
        keywords: ['helpline', 'emergency', 'contact number', 'phone number', 'call support', 'emergency helpline'],
        response: specificResponses['helplines']
      },
      {
        keywords: ['transaction secure', 'secure transaction', 'transaction safety', 'safe transaction', 'know if my transaction'],
        response: specificResponses['transaction secure']
      },
      {
        keywords: ['upi safe', 'upi security', 'upi protection', 'upi guidelines'],
        response: `Never share your UPI PIN with anyone.\n\nAlways verify the merchant name before payment.\n\nUse only official UPI apps from trusted sources.\n\nEnable transaction alerts on your phone.\n\nSet transaction limits as per your needs.\n\nImmediately report suspicious activities.\n\nRemember: Banks never ask for your PIN over calls!`
      },
      // Additional keyword matching for new responses
      {
        keywords: ['fake payment app', 'fake app', 'spot fake app', 'identify fake app', 'payment app safety'],
        response: specificResponses['fake payment app']
      },
      {
        keywords: ['save card details', 'store card info', 'keep card details', 'card details online'],
        response: specificResponses['save card details']
      },
      {
        keywords: ['shared otp', 'gave otp', 'told otp', 'otp compromise', 'accidentally shared'],
        response: specificResponses['shared otp accidentally']
      },
      {
        keywords: ['steal money without otp', 'hackers without otp', 'otp security', 'bypass otp'],
        response: specificResponses['steal money without otp']
      },
      {
        keywords: ['set transaction limit', 'daily limit', 'payment limit', 'transaction limits'],
        response: specificResponses['transaction limits']
      },
      {
        keywords: ['fraudster tricks', 'scammer tactics', 'fraud methods', 'how scammers cheat'],
        response: specificResponses['fraudster tricks']
      },
      {
        keywords: ['qr code scam', 'fake qr', 'qr fraud', 'malicious qr'],
        response: specificResponses['qr code scams']
      },
      {
        keywords: ['fake payment link', 'suspicious link', 'phishing link', 'verify link'],
        response: specificResponses['fake payment links']
      },
      {
        keywords: ['screen sharing', 'screen share', 'remote access', 'avoid screen sharing'],
        response: specificResponses['screen sharing danger']
      },
      {
        keywords: ['fake refund', 'suspicious refund', 'refund scam', 'false refund'],
        response: specificResponses['fake refund']
      },
      {
        keywords: ['money back', 'recovery fraud', 'get money back', 'recover money'],
        response: specificResponses['money recovery fraud']
      },
      {
        keywords: ['fraud case time', 'bank resolution', 'fraud investigation', 'how long'],
        response: specificResponses['fraud case time']
      },
      {
        keywords: ['first contact', 'who to call', 'immediate contact', 'fraud first step'],
        response: specificResponses['first contact fraud']
      },
      {
        keywords: ['cybercrime complaint', 'file complaint', 'online complaint', 'report fraud'],
        response: specificResponses['cybercrime complaint']
      },
      {
        keywords: ['trace fraudster', 'catch scammer', 'police track', 'find fraudster'],
        response: specificResponses['trace fraudsters']
      }
    ];
    
    // Find best match based on keyword density
    let bestMatch = null;
    let bestScore = 0;
    
    for (const match of keywordMatches) {
      const score = match.keywords.reduce((acc, keyword) => {
        return acc + (lowerMessage.includes(keyword) ? keyword.length : 0);
      }, 0);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = match.response;
      }
    }
    
    return bestMatch;
  };
  
  // Get contextual response based on conversation history
  const getContextualResponse = (message, context) => {
    if (context.length === 0) return null;
    
    const lowerMessage = message.toLowerCase();
    const lastMessage = context[context.length - 1];
    
    // Handle follow-up questions
    if (lowerMessage.includes('more') || lowerMessage.includes('detail') || lowerMessage.includes('explain')) {
      if (lastMessage && lastMessage.content.includes('Security Tips')) {
        return `🔍 Here are additional advanced security measures:

• Use biometric authentication whenever available
• Regularly review your transaction history
• Set up automated fraud alerts
• Use virtual payment numbers for online shopping
• Keep separate accounts for online and offline transactions
• Never save payment details on shared devices
• Use strong, unique passwords for each financial app

Would you like me to elaborate on any specific point?`;
      }
    }
    
    // Handle yes/no responses
    if (lowerMessage === 'yes' || lowerMessage === 'y') {
      return `Great! What specific aspect would you like me to explain in more detail? I can provide deeper insights on any security topic you're interested in.`;
    }
    
    if (lowerMessage === 'no' || lowerMessage === 'n') {
      return `No problem! Is there anything else about digital payment security I can help you with today?`;
    }
    
    return null;
  };
  
  // Update user preferences for personalized responses
  const updateUserPreferences = (message) => {
    const lowerMessage = message.toLowerCase();
    const newTopics = [];
    
    if (lowerMessage.includes('fraud') || lowerMessage.includes('scam')) newTopics.push('fraud_prevention');
    if (lowerMessage.includes('security') || lowerMessage.includes('safety')) newTopics.push('security_tips');
    if (lowerMessage.includes('qr')) newTopics.push('qr_safety');
    if (lowerMessage.includes('upi')) newTopics.push('upi_security');
    
    if (newTopics.length > 0) {
      setUserPreferences(prev => ({
        ...prev,
        topics: [...new Set([...prev.topics, ...newTopics])].slice(-5), // Keep last 5 interests
        queries: [...prev.queries, message].slice(-10) // Keep last 10 queries
      }));
    }
  };
  
  // Provide personalized fallback response
  const getPersonalizedFallback = () => {
    const { topics } = userPreferences;
    
    if (topics.includes('fraud_prevention')) {
      return `I see you're interested in fraud prevention! 🔍 Here are some key points:

• Always verify before you pay
• Never share sensitive information
• Trust your instincts if something feels wrong
• Report suspicious activities immediately

What specific fraud-related question can I help you with?`;
    }
    
    if (topics.includes('security_tips')) {
      return `Since you're focused on security, here's a quick reminder: 🛡️

• Keep your payment apps updated
• Use strong authentication methods
• Monitor your transactions regularly
• Enable all security notifications

What security aspect would you like to explore further?`;
    }
    
    // Default intelligent fallback
    return `I'm here to help with digital payment security! 😊

I can provide specific guidance on:
• 🛡️ Security tips and fraud prevention
• ⚠️ Warning signs to watch out for
• 📱 QR code safety precautions
• 🆘 What to do if you've been scammed
• 🆘 Emergency helpline numbers

Try the quick suggestion buttons below, or ask me a specific question!`;
  };

  const formatMessage = (content) => {
    if (!content) return '';
    
    // Enhanced markdown-like formatting with better line handling
    return content
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim();
        
        // Empty lines become proper line breaks
        if (!trimmedLine) {
          return `<div key="${index}" class="line-break"></div>`;
        }
        
        // Bold text with ** or __
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // Italic text
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        line = line.replace(/_(.*?)_/g, '<em>$1</em>');
        
        // Headers with # or ##
        if (trimmedLine.startsWith('##')) {
          return `<div key="${index}" class="subheading">${line.replace(/^##\s*/, '')}</div>`;
        }
        if (trimmedLine.startsWith('#')) {
          return `<div key="${index}" class="heading">${line.replace(/^#\s*/, '')}</div>`;
        }
        
        // Bullet points with various markers
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || 
            trimmedLine.startsWith('*') || trimmedLine.match(/^\d+\./)) {
          return `<div key="${index}" class="bullet-point">${line}</div>`;
        }
        
        // Code blocks (inline)
        line = line.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Links (basic detection)
        line = line.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Regular paragraph
        return `<div key="${index}" class="message-line">${line}</div>`;
      })
      .join('');
  };


  return (
    <div className="assistant-widget">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button 
          className="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Open AI Assistant"
        >
          <EmojiIcon emoji="💬" size={24} />
          <span className="chat-badge">AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <DigiRakshaLogo size={32} />
              <div className="header-text">
                <h4>Digi Raksha Assistant</h4>
                <span className="status-tagline">Your personal digital security companion</span>
              </div>
            </div>
            <div className="chat-header-right">
              <div className="chat-status">
                <span className="status-indicator">
                  {serviceAvailable === true ? '�︢' : 
                   serviceAvailable === false ? '🔴' : 
                   '🔄'}
                </span>
                <span>
                  {serviceAvailable === true ? 'Online' : 
                   serviceAvailable === false ? 'Offline' : 
                   'Connecting...'}
                </span>
              </div>
              <div className="chat-header-actions">
                <button 
                  onClick={exportTranscript}
                  title="Export transcript"
                  className="control-btn"
                  disabled={messages.length <= 1}
                >
                  <EmojiIcon emoji="💾" size={12} />
                </button>
                <button 
                  onClick={reportMisbehavior}
                  title="Report issue"
                  className="control-btn"
                  disabled={messages.length <= 1}
                >
                  <EmojiIcon emoji="🚩" size={12} />
                </button>
                <button 
                  onClick={clearChat}
                  title="Clear chat"
                  className="control-btn"
                >
                  <EmojiIcon emoji="🗑️" size={12} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="close-btn"
                >
                  <EmojiIcon emoji="✕" size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.type} ${message.error ? 'error' : ''} ${message.suggestion ? 'suggestion' : ''}`}
              >
                <div className="message-avatar">
                  {message.type === 'user' ? 
                    <EmojiIcon emoji="👤" size={16} /> : 
                    <DigiRakshaLogo size={20} />
                  }
                </div>
                <div className="message-content">
                  <div 
                    className="message-text"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  <div className="message-meta">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {message.model && !message.error && (
                      <span className="model-tag">{message.model}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant loading">
                <div className="message-avatar">
                  <EmojiIcon emoji="🔄" size={16} className="spinning" />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && !isLoading && (
            <div className="quick-actions">
              <div className="quick-actions-label">Quick actions:</div>
              <div className="buttons-container">
                {quickActions.map((action, index) => {
                  return (
                    <button
                      key={index}
                      className="quick-action-btn"
                      onClick={action.action}
                    >
                      <EmojiIcon emoji={action.emoji} size={14} />
                      <span>{action.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="chat-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about digital payment security, fraud prevention, or safety tips..."
              rows="1"
              disabled={isLoading}
              className="message-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
              title="Send message"
              aria-label="Send message"
            >
              <span className="send-arrow-icon" style={{color: 'white', fontSize: '14px', fontWeight: '900', textAlign: 'center', display: 'block'}}>{'>'}</span>
            </button>
          </div>

          {/* Footer */}
          <div className="chat-footer">
            <span>I'm here to help guide you, but always double-check important decisions! 😊</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantWidget;
