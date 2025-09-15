import cloudFraudDB from './cloudFraudDatabase';
import { userStatsService } from './userStatsService';

// UPI ID Safety Checker Services - Now uses cloud fraud database
export const checkUpiSafety = async (upiId, userId = null) => {
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
    
    // Get data from cloud fraud database (async)
    const result = await cloudFraudDB.getFraudData(identifier);
    
    // Track user stats if userId provided
    if (userId) {
      try {
        userStatsService.incrementSafetyChecks(userId);
        console.log('✅ Safety check tracked for user:', userId);
      } catch (statsError) {
        console.warn('Could not track safety check:', statsError);
      }
    }
    
    return result;
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

// Report Fraud Services - Now uses cloud fraud database
export const reportFraud = async (upiId, reportData, userId = null) => {
  try {
    // Normalize the identifier based on type
    let identifier = upiId;
    
    if (upiId.startsWith('phone_') || upiId.startsWith('link_')) {
      identifier = upiId; // Already formatted
    } else {
      // Clean UPI ID
      identifier = upiId.replace(/[.#$[\]]/g, '_');
    }
    
    // Add report to cloud fraud database (async)
    const report = await cloudFraudDB.addFraudReport(identifier, {
      ...reportData,
      reportedBy: reportData.reporterContact || 'Anonymous'
    });
    
    // Track user stats if userId provided
    if (userId) {
      try {
        userStatsService.incrementFraudReports(userId);
        console.log('✅ Fraud report tracked for user:', userId);
      } catch (statsError) {
        console.warn('Could not track fraud report:', statsError);
      }
    }
    
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

// Recent Reports Feed Services - Now uses cloud fraud database
export const getRecentReports = async (callback, limit = 20) => {
  try {
    const reports = await cloudFraudDB.getRecentReports(limit);
    callback(reports);
  } catch (error) {
    console.error('Error getting recent reports:', error);
    callback([]);
  }
  
  // Return a cleanup function
  return () => {};
};

// Demo mode - no initialization needed
