import fraudDB from './fraudDatabase';

// UPI ID Safety Checker Services - Now uses fraud database
export const checkUpiSafety = async (upiId) => {
  try {
    // Normalize the identifier
    let identifier = upiId;
    
    // Handle different types of identifiers
    if (upiId.startsWith('phone_')) {
      identifier = upiId; // Already formatted for phone
    } else if (upiId.startsWith('link_')) {
      identifier = upiId; // Already formatted for link
    } else {
      // Clean UPI ID
      identifier = upiId.replace(/[.#$[\]]/g, '_');
    }
    
    // Get data from fraud database
    return fraudDB.getFraudData(identifier);
  } catch (error) {
    console.error('Error checking safety:', error);
    // Return safe default on error
    return {
      safetyScore: 85,
      reportCount: 0,
      avgSeverity: 0,
      lastReported: null,
      riskLevel: 'safe',
      totalAmount: 0,
      reports: []
    };
  }
};

// Report Fraud Services - Now uses fraud database
export const reportFraud = async (upiId, reportData) => {
  try {
    // Normalize the identifier based on type
    let identifier = upiId;
    
    if (upiId.startsWith('phone_') || upiId.startsWith('link_')) {
      identifier = upiId; // Already formatted
    } else {
      // Clean UPI ID
      identifier = upiId.replace(/[.#$[\]]/g, '_');
    }
    
    // Add report to fraud database
    const report = fraudDB.addFraudReport(identifier, {
      ...reportData,
      reportedBy: reportData.reporterContact || 'Anonymous'
    });
    
    console.log('Fraud report submitted successfully:', report);
    return report;
  } catch (error) {
    console.error('Error reporting fraud:', error);
    // Return a basic report structure even on error
    return {
      ...reportData,
      timestamp: Date.now(),
      id: `error_report_${Date.now()}`,
      reportedBy: reportData.reporterContact || 'Anonymous'
    };
  }
};

// Recent Reports Feed Services - Now uses fraud database
export const getRecentReports = (callback, limit = 20) => {
  try {
    const reports = fraudDB.getRecentReports(limit);
    setTimeout(() => callback(reports), 100);
  } catch (error) {
    console.error('Error getting recent reports:', error);
    callback([]);
  }
  
  // Return a cleanup function
  return () => {};
};

// Chat Support Services
export const getChatBotResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Simple rule-based responses for demo
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return {
      text: "I'm here to help you with UPI fraud detection! Here are some ways I can assist:",
      options: [
        "Check UPI ID safety",
        "Report fraud",
        "Get helpline numbers",
        "Learn about UPI safety"
      ]
    };
  } else if (lowerMessage.includes('helpline') || lowerMessage.includes('number')) {
    return {
      text: "Here are important helpline numbers:",
      helplines: [
        { name: "Cyber Crime Helpline", number: "1930", clickToCall: true },
        { name: "Banking Fraud Helpline", number: "1800-425-3800", clickToCall: true },
        { name: "RBI Complaint", number: "14440", clickToCall: true }
      ]
    };
  } else if (lowerMessage.includes('safe') || lowerMessage.includes('security')) {
    return {
      text: "Here are UPI safety tips:",
      tips: [
        "Never share your UPI PIN with anyone",
        "Verify merchant details before payment", 
        "Check UPI IDs for suspicious characters",
        "Report suspicious activities immediately"
      ]
    };
  } else if (lowerMessage.includes('report')) {
    return {
      text: "To report fraud, you can:",
      actions: [
        "Use our 'Report Fraud' feature",
        "Contact cyber crime helpline: 1930",
        "Visit cybercrime.gov.in"
      ]
    };
  } else {
    return {
      text: "I understand you're asking about: " + message + ". Could you please be more specific? I can help you with UPI safety checks, fraud reporting, or provide helpline numbers.",
      quickReplies: ["Check UPI safety", "Report fraud", "Get help numbers"]
    };
  }
};

// Demo mode - no initialization needed
