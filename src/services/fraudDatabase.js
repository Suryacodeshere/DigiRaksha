// Fraud Database Service - Local Storage Implementation
class FraudDatabase {
  constructor() {
    this.dbKey = 'upi-fraud-database';
    this.reportsKey = 'upi-fraud-reports';
    this.initializeDatabase();
  }

  // Initialize database with demo data
  initializeDatabase() {
    if (!localStorage.getItem(this.dbKey)) {
      const initialData = {
        // UPI ID reports
        'fraud@paytm': {
          reports: [
            {
              id: 'rpt_001',
              reportedBy: 'user1@example.com',
              description: 'Impersonated bank customer service, asked for OTP and PIN',
              amount: 15000,
              severity: 5,
              category: 'phishing',
              timestamp: Date.now() - 86400000, // 1 day ago
              verified: true
            },
            {
              id: 'rpt_002',
              reportedBy: 'user2@example.com', 
              description: 'Fake payment request claiming to be from delivery service',
              amount: 2500,
              severity: 4,
              category: 'payment_fraud',
              timestamp: Date.now() - 172800000, // 2 days ago
              verified: true
            }
          ],
          safetyScore: 15,
          totalReports: 2,
          totalAmount: 17500,
          riskLevel: 'danger'
        },
        'scammer@phonepe': {
          reports: [
            {
              id: 'rpt_003',
              reportedBy: 'user3@example.com',
              description: 'QR code scam at fake grocery store, duplicate transaction',
              amount: 3200,
              severity: 3,
              category: 'fake_merchant',
              timestamp: Date.now() - 259200000, // 3 days ago
              verified: true
            }
          ],
          safetyScore: 25,
          totalReports: 1,
          totalAmount: 3200,
          riskLevel: 'danger'
        },
        'phone_9876543210': {
          reports: [
            {
              id: 'rpt_004',
              reportedBy: 'user4@example.com',
              description: 'Fake bank call asking for card details and UPI PIN',
              amount: 8500,
              severity: 5,
              category: 'phone_fraud',
              timestamp: Date.now() - 345600000, // 4 days ago
              verified: true
            },
            {
              id: 'rpt_005',
              reportedBy: 'user5@example.com',
              description: 'Pretended to be from insurance company, demanded instant payment',
              amount: 12000,
              severity: 4,
              category: 'phone_fraud',
              timestamp: Date.now() - 432000000, // 5 days ago
              verified: true
            }
          ],
          safetyScore: 20,
          totalReports: 2,
          totalAmount: 20500,
          riskLevel: 'danger'
        },
        'phone_8765432109': {
          reports: [
            {
              id: 'rpt_006',
              reportedBy: 'user6@example.com',
              description: 'Suspicious calls claiming lottery win, asked for processing fee',
              amount: 5000,
              severity: 3,
              category: 'phone_fraud',
              timestamp: Date.now() - 518400000, // 6 days ago
              verified: true
            }
          ],
          safetyScore: 40,
          totalReports: 1,
          totalAmount: 5000,
          riskLevel: 'moderate'
        },
        'link_aHR0cHM6Ly9mYWtlcGF5dG0uY29t': {
          reports: [
            {
              id: 'rpt_007',
              reportedBy: 'user7@example.com',
              description: 'Fake Paytm website link sent via SMS, collected card details',
              amount: 7500,
              severity: 4,
              category: 'link_fraud',
              timestamp: Date.now() - 604800000, // 7 days ago
              verified: true,
              originalLink: 'https://fakepaytm.com'
            }
          ],
          safetyScore: 30,
          totalReports: 1,
          totalAmount: 7500,
          riskLevel: 'moderate'
        },
        // Demo fraudulent links
        'link_aHR0cHM6Ly9mYWtlLWJhbmsuY29t': {
          reports: [
            {
              id: 'rpt_demo_001',
              reportedBy: 'demo@example.com',
              description: 'Phishing site mimicking a bank login',
              amount: 0,
              severity: 4,
              category: 'link_fraud',
              timestamp: Date.now() - 3600 * 1000 * 24 * 2, // 2 days ago
              verified: true,
              originalLink: 'https://fake-bank.com'
            }
          ],
          safetyScore: 45,
          totalReports: 1,
          totalAmount: 0,
          riskLevel: 'moderate'
        },
        'link_aHR0cHM6Ly9leGFtcGxlLmNvbS9wYXk=': {
          reports: [
            {
              id: 'rpt_demo_002',
              reportedBy: 'demo2@example.com',
              description: 'Suspicious payment page asking for card details',
              amount: 1200,
              severity: 3,
              category: 'link_fraud',
              timestamp: Date.now() - 3600 * 1000 * 24 * 1, // 1 day ago
              verified: true,
              originalLink: 'https://example.com/pay'
            }
          ],
          safetyScore: 60,
          totalReports: 1,
          totalAmount: 1200,
          riskLevel: 'moderate'
        },
        'link_dXBpOi8vcGF5P3BhPW1lcmNoYW50QHBheXRtJmFtPTUwMA==': {
          reports: [
            {
              id: 'rpt_demo_003',
              reportedBy: 'demo3@example.com',
              description: 'Fake UPI request link shared on social media',
              amount: 500,
              severity: 2,
              category: 'link_fraud',
              timestamp: Date.now() - 3600 * 1000 * 24 * 5, // 5 days ago
              verified: true,
              originalLink: 'upi://pay?pa=merchant@paytm&am=500'
            }
          ],
          safetyScore: 70,
          totalReports: 1,
          totalAmount: 500,
          riskLevel: 'safe'
        }
      };

      localStorage.setItem(this.dbKey, JSON.stringify(initialData));
    }

    // Initialize reports feed if it doesn't exist
    if (!localStorage.getItem(this.reportsKey)) {
      this.updateReportsFeed();
    }
  }

  // Get fraud data for a specific identifier
  getFraudData(identifier) {
    const database = JSON.parse(localStorage.getItem(this.dbKey) || '{}');
    const data = database[identifier];
    
    if (!data || !data.reports || data.reports.length === 0) {
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

    const totalSeverity = data.reports.reduce((sum, report) => sum + report.severity, 0);
    const avgSeverity = totalSeverity / data.reports.length;
    const lastReported = Math.max(...data.reports.map(r => r.timestamp));
    
    // Calculate safety score based on reports, severity, and recency
    const reportCount = data.reports.length;
    const daysSinceLastReport = (Date.now() - lastReported) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0.5, 1 - daysSinceLastReport / 30); // Less penalty after 30 days
    const safetyScore = Math.max(0, 100 - (reportCount * 15 + avgSeverity * 15) * recencyFactor);
    
    const riskLevel = safetyScore > 70 ? 'safe' : safetyScore > 40 ? 'moderate' : 'danger';

    return {
      safetyScore: Math.round(safetyScore),
      reportCount,
      avgSeverity,
      lastReported,
      riskLevel,
      totalAmount: data.totalAmount || 0,
      reports: data.reports || []
    };
  }

  // Add a new fraud report
  addFraudReport(identifier, reportData) {
    const database = JSON.parse(localStorage.getItem(this.dbKey) || '{}');
    
    if (!database[identifier]) {
      database[identifier] = {
        reports: [],
        totalReports: 0,
        totalAmount: 0,
        safetyScore: 85,
        riskLevel: 'safe'
      };
    }

    const newReport = {
      id: `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...reportData,
      timestamp: Date.now(),
      verified: false // New reports need verification
    };

    database[identifier].reports.push(newReport);
    database[identifier].totalReports = database[identifier].reports.length;
    database[identifier].totalAmount = database[identifier].reports.reduce((sum, report) => sum + (report.amount || 0), 0);

    // Update safety metrics
    const updatedData = this.calculateSafetyMetrics(database[identifier]);
    database[identifier] = { ...database[identifier], ...updatedData };

    localStorage.setItem(this.dbKey, JSON.stringify(database));
    this.updateReportsFeed();
    
    return newReport;
  }

  // Calculate safety metrics for an identifier
  calculateSafetyMetrics(data) {
    if (!data.reports || data.reports.length === 0) {
      return { safetyScore: 85, riskLevel: 'safe' };
    }

    const reportCount = data.reports.length;
    const totalSeverity = data.reports.reduce((sum, report) => sum + report.severity, 0);
    const avgSeverity = totalSeverity / reportCount;
    const lastReported = Math.max(...data.reports.map(r => r.timestamp));
    
    const daysSinceLastReport = (Date.now() - lastReported) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0.5, 1 - daysSinceLastReport / 30);
    const safetyScore = Math.max(0, 100 - (reportCount * 15 + avgSeverity * 15) * recencyFactor);
    
    const riskLevel = safetyScore > 70 ? 'safe' : safetyScore > 40 ? 'moderate' : 'danger';

    return {
      safetyScore: Math.round(safetyScore),
      riskLevel
    };
  }

  // Get all recent reports for the feed
  getRecentReports(limit = 50) {
    const reports = JSON.parse(localStorage.getItem(this.reportsKey) || '[]');
    return reports
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Update the reports feed with latest data
  updateReportsFeed() {
    const database = JSON.parse(localStorage.getItem(this.dbKey) || '{}');
    const allReports = [];

    Object.entries(database).forEach(([identifier, data]) => {
      if (data.reports) {
        data.reports.forEach(report => {
          allReports.push({
            ...report,
            identifier,
            identifierType: this.getIdentifierType(identifier),
            displayIdentifier: this.getDisplayIdentifier(identifier)
          });
        });
      }
    });

    localStorage.setItem(this.reportsKey, JSON.stringify(allReports));
  }

  // Get identifier type (upi, phone, link)
  getIdentifierType(identifier) {
    if (identifier.startsWith('phone_')) return 'phone';
    if (identifier.startsWith('link_')) return 'link';
    return 'upi';
  }

  // Get display-friendly identifier
  getDisplayIdentifier(identifier) {
    if (identifier.startsWith('phone_')) {
      return '+91 ' + identifier.replace('phone_', '');
    }
    if (identifier.startsWith('link_')) {
      const database = JSON.parse(localStorage.getItem(this.dbKey) || '{}');
      const linkData = database[identifier];
      if (linkData && linkData.reports && linkData.reports[0] && linkData.reports[0].originalLink) {
        return linkData.reports[0].originalLink;
      }
      return 'Payment Link';
    }
    return identifier;
  }

  // Get statistics for the database
  getStatistics() {
    const database = JSON.parse(localStorage.getItem(this.dbKey) || '{}');
    const reports = JSON.parse(localStorage.getItem(this.reportsKey) || '[]');
    
    const totalIdentifiers = Object.keys(database).length;
    const totalReports = reports.length;
    const totalAmount = reports.reduce((sum, report) => sum + (report.amount || 0), 0);
    
    const highRiskCount = Object.values(database).filter(data => data.riskLevel === 'danger').length;
    const moderateRiskCount = Object.values(database).filter(data => data.riskLevel === 'moderate').length;
    const lowRiskCount = totalIdentifiers - highRiskCount - moderateRiskCount;

    return {
      totalIdentifiers,
      totalReports,
      totalAmount,
      highRiskCount,
      moderateRiskCount,
      lowRiskCount,
      categories: this.getCategoryStats(reports)
    };
  }

  // Get category-wise statistics
  getCategoryStats(reports) {
    const categories = {};
    reports.forEach(report => {
      const category = report.category || 'other';
      if (!categories[category]) {
        categories[category] = { count: 0, amount: 0 };
      }
      categories[category].count++;
      categories[category].amount += report.amount || 0;
    });
    return categories;
  }

  // Search reports by various criteria
  searchReports(query, category = null, riskLevel = null) {
    const reports = this.getRecentReports(1000);
    
    return reports.filter(report => {
      const matchesQuery = !query || 
        report.description.toLowerCase().includes(query.toLowerCase()) ||
        report.displayIdentifier.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !category || report.category === category;
      
      const matchesRiskLevel = !riskLevel || 
        (riskLevel === 'high' && report.severity >= 4) ||
        (riskLevel === 'medium' && report.severity === 3) ||
        (riskLevel === 'low' && report.severity <= 2);
      
      return matchesQuery && matchesCategory && matchesRiskLevel;
    });
  }

  // Clear all data (for testing)
  clearDatabase() {
    localStorage.removeItem(this.dbKey);
    localStorage.removeItem(this.reportsKey);
    this.initializeDatabase();
  }
}

// Export singleton instance
export const fraudDB = new FraudDatabase();
export default fraudDB;
