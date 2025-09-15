/**
 * Offline Q&A Service for Digi Raksha
 * Provides trained responses when backend is offline
 */

// Trained Q&A data - copied from backend training_data.json
const OFFLINE_QA_DATABASE = [
  {
    "question": "How can I make my UPI account more secure?",
    "answer": "Use a strong UPI PIN, never share it, enable app lock or biometric login, and regularly check your linked bank statements.",
    "keywords": ["UPI security", "secure account", "UPI PIN", "biometric", "app lock", "bank statements"],
    "category": "security"
  },
  {
    "question": "Should I log out of my payment app after every transaction?",
    "answer": "Most apps are secured with PIN/biometric, so logging out each time is not necessary. However, always secure your phone with a lock screen.",
    "keywords": ["log out", "payment app", "transaction", "PIN", "biometric", "lock screen"],
    "category": "usage"
  },
  {
    "question": "How do I know if my phone has been hacked for payments?",
    "answer": "Signs include unknown apps installed, unusual SMS about transactions, faster battery drain, or money deductions you didn't authorize.",
    "keywords": ["phone hacked", "hacking signs", "unknown apps", "unusual SMS", "battery drain", "unauthorized deductions"],
    "category": "security_threats"
  },
  {
    "question": "What should I do if I lose my SIM card linked to my bank?",
    "answer": "Block your SIM immediately by calling the telecom provider. Then inform your bank to prevent misuse.",
    "keywords": ["lost SIM", "SIM card", "telecom provider", "block SIM", "inform bank", "prevent misuse"],
    "category": "emergency"
  },
  {
    "question": "Is it safe to use public Wi-Fi for online payments?",
    "answer": "No. Public Wi-Fi can be unsafe. Use mobile data or a secured private network for financial transactions.",
    "keywords": ["public Wi-Fi", "online payments", "unsafe", "mobile data", "secured network", "financial transactions"],
    "category": "network_security"
  },
  {
    "question": "Why did my digital payment fail even though money was deducted?",
    "answer": "This happens due to network or server issues. The amount is usually reversed to your account within 3–5 working days.",
    "keywords": ["payment failed", "money deducted", "network issues", "server issues", "amount reversed", "3-5 working days"],
    "category": "troubleshooting"
  },
  {
    "question": "How can I confirm if the money has reached the right person?",
    "answer": "Check the transaction status in your payment app. You should also confirm with the recipient directly.",
    "keywords": ["confirm money reached", "transaction status", "payment app", "recipient", "confirm directly"],
    "category": "verification"
  },
  {
    "question": "What details should I check before sending money online?",
    "answer": "Always verify the recipient's name, phone number, or UPI ID before confirming payment.",
    "keywords": ["check details", "sending money", "verify recipient", "name", "phone number", "UPI ID", "confirm payment"],
    "category": "verification"
  },
  {
    "question": "How long does it take for a failed transaction to be refunded?",
    "answer": "Generally within 3–5 working days, depending on your bank and payment app.",
    "keywords": ["failed transaction", "refund", "3-5 working days", "bank", "payment app"],
    "category": "troubleshooting"
  },
  {
    "question": "Can I cancel a UPI payment after sending it?",
    "answer": "No. Once a UPI payment is successful, it cannot be cancelled. You must request the recipient to refund if sent by mistake.",
    "keywords": ["cancel UPI payment", "cannot cancel", "successful payment", "request refund", "sent by mistake"],
    "category": "transactions"
  },
  {
    "question": "What are common social media payment scams?",
    "answer": "Scams include fake shopping offers, lottery/prize claims, job offers requiring a 'registration fee,' or impersonation of friends asking for money.",
    "keywords": ["social media scams", "fake shopping", "lottery scams", "prize claims", "job offers", "registration fee", "impersonation", "friends asking money"],
    "category": "fraud_types"
  },
  {
    "question": "Why should I not share screenshots of my payment online?",
    "answer": "Screenshots may contain sensitive details like transaction ID, phone number, or partial account details that fraudsters can misuse.",
    "keywords": ["share screenshots", "payment screenshots", "sensitive details", "transaction ID", "phone number", "account details", "fraudsters misuse"],
    "category": "privacy"
  },
  {
    "question": "Can someone misuse my bank account number if I share it?",
    "answer": "Sharing only an account number is usually safe for receiving money. But fraudsters may use it for phishing attempts. Avoid sharing additional details like OTP or PIN.",
    "keywords": ["bank account number", "share account number", "receiving money", "phishing attempts", "OTP", "PIN", "additional details"],
    "category": "privacy"
  },
  {
    "question": "What are fake job or part-time work scams involving payments?",
    "answer": "Fraudsters offer fake jobs and ask for advance fees, deposits, or 'training charges.' Once paid, they disappear.",
    "keywords": ["fake job scams", "part-time work scams", "advance fees", "deposits", "training charges", "fraudsters disappear"],
    "category": "fraud_types"
  },
  {
    "question": "How can I avoid investment scams online?",
    "answer": "Invest only through licensed platforms. Avoid schemes promising unusually high returns. Always verify the company's authenticity.",
    "keywords": ["investment scams", "licensed platforms", "high returns", "verify authenticity", "company verification"],
    "category": "fraud_types"
  },
  {
    "question": "What documents should I keep ready while reporting payment fraud?",
    "answer": "Keep transaction ID, bank/payment app statement, screenshots, fraudster's contact details, and your ID proof.",
    "keywords": ["documents", "reporting fraud", "transaction ID", "bank statement", "payment app statement", "screenshots", "fraudster contact", "ID proof"],
    "category": "reporting"
  },
  {
    "question": "Can I report digital payment fraud without going to the police station?",
    "answer": "Yes. In India, you can report online at cybercrime.gov.in or call 1930. Other countries have their own online complaint portals.",
    "keywords": ["report fraud", "digital payment fraud", "police station", "cybercrime.gov.in", "1930", "online complaint", "complaint portals"],
    "category": "reporting"
  },
  {
    "question": "What should I do if someone threatens me for online payment?",
    "answer": "Do not pay. Collect proof (messages, calls) and immediately report to police and the cybercrime helpline.",
    "keywords": ["threatens", "online payment", "do not pay", "collect proof", "messages", "calls", "report police", "cybercrime helpline"],
    "category": "emergency"
  },
  {
    "question": "Is there insurance coverage for online payment fraud?",
    "answer": "Some banks and digital wallets provide fraud protection or cyber insurance. Check with your bank or insurer for details.",
    "keywords": ["insurance coverage", "payment fraud", "fraud protection", "cyber insurance", "banks", "digital wallets", "insurer"],
    "category": "protection"
  },
  {
    "question": "How do I freeze my bank account in case of fraud?",
    "answer": "Call your bank's customer care or visit the nearest branch to request an immediate freeze. This stops further unauthorized transactions.",
    "keywords": ["freeze bank account", "fraud", "bank customer care", "nearest branch", "immediate freeze", "unauthorized transactions"],
    "category": "emergency"
  }
];

// Additional custom responses for common patterns
const CUSTOM_RESPONSES = {
  "payment_request_safety": {
    "triggers": [
      "how can i check if a payment request is safe",
      "payment request safe",
      "verify payment request", 
      "check payment request",
      "is payment request safe"
    ],
    "response": "You should always verify the source before making any payment. Double-check the sender's details, confirm through official channels, and never trust links or QR codes sent by unknown people. If the request feels urgent or suspicious, it's best to stop and verify first."
  },
  
  "fraud_warning_signs": {
    "triggers": [
      "what are the warning signs of digital payment fraud",
      "warning signs of fraud",
      "fraud warning signs", 
      "signs of fraud",
      "how to detect fraud"
    ],
    "response": `Some common warning signs include:

• Unexpected requests for money from strangers or even known contacts
• Urgent messages pressuring you to pay immediately  
• Suspicious links, QR codes, or phone numbers
• Requests to share your OTP, PIN, or CVV

If you notice any of these, do not proceed.`
  },

  "security_tips": {
    "triggers": [
      "what are the best digital payment safety tips",
      "digital payment safety tips",
      "payment security tips",
      "safety tips",
      "security tips"
    ],
    "response": `Essential UPI Security Tips:

• Never share OTP, PIN, CVV, or passwords with anyone
• Always use secure, official apps
• Avoid clicking on unknown links or scanning random QR codes  
• Enable two-factor authentication
• Regularly check your bank/payment statements for unusual activity`
  },

  "emergency_helplines": {
    "triggers": [
      "can you share emergency helpline numbers",
      "emergency helpline",
      "helpline numbers",
      "emergency numbers", 
      "contact numbers"
    ],
    "response": `Important helpline numbers (India):

• Cybercrime Helpline: 1930
• National Cybercrime Reporting Portal: www.cybercrime.gov.in  
• Police: 100

(If outside India, check your local emergency services numbers.)`
  }
};

class OfflineQAService {
  constructor() {
    this.qaDatabase = OFFLINE_QA_DATABASE;
    this.customResponses = CUSTOM_RESPONSES;
    this.similarityThreshold = 0.6; // Lower threshold for offline matching
  }

  /**
   * Calculate simple text similarity between two strings
   */
  calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    // Exact match
    if (s1 === s2) return 1.0;
    
    // Word-based similarity
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    
    let matchCount = 0;
    let totalWords = Math.max(words1.length, words2.length);
    
    words1.forEach(word1 => {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        matchCount++;
      }
    });
    
    return matchCount / totalWords;
  }

  /**
   * Check custom responses first
   */
  checkCustomResponses(userQuestion) {
    const questionLower = userQuestion.toLowerCase().trim();
    
    for (const [category, data] of Object.entries(this.customResponses)) {
      for (const trigger of data.triggers) {
        if (questionLower.includes(trigger.toLowerCase()) || 
            this.calculateSimilarity(questionLower, trigger) > 0.7) {
          return {
            answer: data.response,
            matchType: 'custom',
            category: category,
            confidence: 'high'
          };
        }
      }
    }
    return null;
  }

  /**
   * Find best matching answer from offline database
   */
  findBestAnswer(userQuestion) {
    // Check custom responses first
    const customMatch = this.checkCustomResponses(userQuestion);
    if (customMatch) {
      return customMatch;
    }

    let bestMatch = null;
    let highestSimilarity = 0;

    // Check against trained Q&A database
    this.qaDatabase.forEach((qa, index) => {
      const similarity = this.calculateSimilarity(userQuestion, qa.question);
      
      // Also check keywords
      let keywordMatch = 0;
      const userWords = userQuestion.toLowerCase().split(/\s+/);
      qa.keywords.forEach(keyword => {
        if (userWords.some(word => word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word))) {
          keywordMatch += 0.1;
        }
      });
      
      const totalSimilarity = similarity + keywordMatch;
      
      if (totalSimilarity > highestSimilarity && totalSimilarity > this.similarityThreshold) {
        highestSimilarity = totalSimilarity;
        bestMatch = {
          answer: qa.answer,
          matchedQuestion: qa.question,
          similarity: totalSimilarity,
          matchType: 'semantic',
          category: qa.category,
          confidence: totalSimilarity > 0.8 ? 'high' : totalSimilarity > 0.65 ? 'medium' : 'low',
          qaId: index
        };
      }
    });

    return bestMatch;
  }

  /**
   * Get offline response for user question
   */
  getOfflineResponse(userQuestion) {
    if (!userQuestion || userQuestion.trim().length === 0) {
      return {
        success: false,
        error: 'Please ask a question about UPI security.'
      };
    }

    const match = this.findBestAnswer(userQuestion.trim());
    
    if (match) {
      return {
        success: true,
        message: match.answer,
        offline: true,
        matchType: match.matchType,
        confidence: match.confidence,
        category: match.category,
        timestamp: new Date().toISOString()
      };
    } else {
      // Fallback response for unmatched questions
      return {
        success: true,
        message: `I'm working offline right now and can only answer questions about UPI security, fraud prevention, and digital payment safety. 

Here are some topics I can help with:
• Making UPI accounts more secure
• Identifying payment fraud signs  
• What to do if you lose your SIM card
• Reporting digital fraud
• Safe practices for online payments

Please ask me something related to UPI security! 🛡️`,
        offline: true,
        matchType: 'fallback',
        confidence: 'low',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check if a question is related to UPI/payment security
   */
  isSecurityRelated(question) {
    const securityKeywords = [
      'upi', 'payment', 'fraud', 'security', 'scam', 'safe', 'bank', 
      'transaction', 'money', 'otp', 'pin', 'account', 'card', 'cyber',
      'phishing', 'sim', 'mobile', 'app', 'qr', 'code', 'transfer'
    ];
    
    const questionLower = question.toLowerCase();
    return securityKeywords.some(keyword => questionLower.includes(keyword));
  }

  /**
   * Get available categories
   */
  getCategories() {
    const categories = new Set();
    this.qaDatabase.forEach(qa => categories.add(qa.category));
    return Array.from(categories);
  }

  /**
   * Get questions by category
   */
  getQuestionsByCategory(category) {
    return this.qaDatabase.filter(qa => qa.category === category);
  }
}

export default new OfflineQAService();