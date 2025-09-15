// Cloud Fraud Database Service - Firebase Firestore Implementation
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

class CloudFraudDatabase {
  constructor() {
    this.fraudReportsCollection = 'fraudReports';
    this.fraudDataCollection = 'fraudData';
    this.statisticsDoc = 'statistics';
    
    // Fallback to local storage if Firebase is not available
    this.fallbackToLocal = false;
    this.localDB = null;
  }

  // Initialize with fallback handling
  async initialize() {
    try {
      // Test Firebase connection
      await this.testFirebaseConnection();
      console.log('✅ Cloud fraud database connected');
      return true;
    } catch (error) {
      console.warn('⚠️ Firebase not available, using local storage fallback');
      this.fallbackToLocal = true;
      // Initialize local fallback
      this.localDB = await import('./fraudDatabase.js');
      return false;
    }
  }

  // Test Firebase connection
  async testFirebaseConnection() {
    if (!db) throw new Error('Firebase not configured');
    
    // Try to read from statistics document
    const statsRef = doc(db, 'meta', this.statisticsDoc);
    await getDoc(statsRef);
  }

  // Get fraud data for a specific identifier
  async getFraudData(identifier) {
    if (this.fallbackToLocal && this.localDB) {
      return this.localDB.default.getFraudData(identifier);
    }

    try {
      const docRef = doc(db, this.fraudDataCollection, identifier);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return this.getDefaultSafeData();
      }
      
      const data = docSnap.data();
      return this.processFraudData(data);
    } catch (error) {
      console.error('Error getting fraud data:', error);
      return this.getDefaultSafeData();
    }
  }

  // Get default safe data structure
  getDefaultSafeData() {
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

  // Process fraud data and calculate metrics
  processFraudData(data) {
    if (!data.reports || data.reports.length === 0) {
      return this.getDefaultSafeData();
    }

    const reportCount = data.reports.length;
    const totalSeverity = data.reports.reduce((sum, report) => sum + report.severity, 0);
    const avgSeverity = totalSeverity / reportCount;
    const lastReported = Math.max(...data.reports.map(r => r.timestamp));
    
    // Calculate safety score based on reports, severity, and recency
    const daysSinceLastReport = (Date.now() - lastReported) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0.5, 1 - daysSinceLastReport / 30);
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
  async addFraudReport(identifier, reportData) {
    if (this.fallbackToLocal && this.localDB) {
      return this.localDB.default.addFraudReport(identifier, reportData);
    }

    try {
      const newReport = {
        id: `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...reportData,
        timestamp: Date.now(),
        serverTimestamp: serverTimestamp(),
        verified: false,
        identifier: identifier,
        identifierType: this.getIdentifierType(identifier)
      };

      // Add to reports collection
      await addDoc(collection(db, this.fraudReportsCollection), newReport);

      // Update fraud data document
      await this.updateFraudDataDocument(identifier, newReport);

      // Update statistics
      await this.updateStatistics(reportData);

      return newReport;
    } catch (error) {
      console.error('Error adding fraud report:', error);
      throw error;
    }
  }

  // Update fraud data document
  async updateFraudDataDocument(identifier, newReport) {
    const docRef = doc(db, this.fraudDataCollection, identifier);
    const docSnap = await getDoc(docRef);
    
    let reports = [];
    let totalAmount = 0;
    
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      reports = existingData.reports || [];
      totalAmount = existingData.totalAmount || 0;
    }
    
    reports.push({
      id: newReport.id,
      reportedBy: newReport.reportedBy,
      description: newReport.description,
      amount: newReport.amount || 0,
      severity: newReport.severity,
      category: newReport.category,
      timestamp: newReport.timestamp,
      verified: newReport.verified
    });
    
    totalAmount += (newReport.amount || 0);
    
    const updatedData = {
      identifier,
      identifierType: this.getIdentifierType(identifier),
      reports,
      totalReports: reports.length,
      totalAmount,
      lastUpdated: serverTimestamp(),
      ...this.calculateSafetyMetrics(reports)
    };
    
    await setDoc(docRef, updatedData, { merge: true });
  }

  // Calculate safety metrics
  calculateSafetyMetrics(reports) {
    if (!reports || reports.length === 0) {
      return { safetyScore: 85, riskLevel: 'safe' };
    }

    const reportCount = reports.length;
    const totalSeverity = reports.reduce((sum, report) => sum + report.severity, 0);
    const avgSeverity = totalSeverity / reportCount;
    const lastReported = Math.max(...reports.map(r => r.timestamp));
    
    const daysSinceLastReport = (Date.now() - lastReported) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0.5, 1 - daysSinceLastReport / 30);
    const safetyScore = Math.max(0, 100 - (reportCount * 15 + avgSeverity * 15) * recencyFactor);
    
    const riskLevel = safetyScore > 70 ? 'safe' : safetyScore > 40 ? 'moderate' : 'danger';

    return {
      safetyScore: Math.round(safetyScore),
      riskLevel,
      avgSeverity: Math.round(avgSeverity * 10) / 10
    };
  }

  // Get recent reports for the feed
  async getRecentReports(limitCount = 50) {
    if (this.fallbackToLocal && this.localDB) {
      return this.localDB.default.getRecentReports(limitCount);
    }

    try {
      const q = query(
        collection(db, this.fraudReportsCollection),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const reports = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          ...data,
          displayIdentifier: this.getDisplayIdentifier(data.identifier),
          id: doc.id
        });
      });
      
      return reports;
    } catch (error) {
      console.error('Error getting recent reports:', error);
      return [];
    }
  }

  // Get identifier type
  getIdentifierType(identifier) {
    if (identifier.startsWith('phone_')) return 'phone';
    if (identifier.startsWith('link_')) return 'link';
    if (identifier.includes('@')) return 'upi';
    return 'unknown';
  }

  // Get display-friendly identifier
  getDisplayIdentifier(identifier) {
    if (identifier.startsWith('phone_')) {
      return '+91 ' + identifier.replace('phone_', '');
    }
    if (identifier.startsWith('link_')) {
      try {
        const decoded = atob(identifier.replace('link_', ''));
        return decoded.substring(0, 50) + (decoded.length > 50 ? '...' : '');
      } catch {
        return 'Payment Link';
      }
    }
    return identifier;
  }

  // Update global statistics
  async updateStatistics(reportData) {
    try {
      const statsRef = doc(db, 'meta', this.statisticsDoc);
      
      await setDoc(statsRef, {
        totalReports: increment(1),
        totalAmount: increment(reportData.amount || 0),
        lastUpdated: serverTimestamp(),
        [`categories.${reportData.category}`]: increment(1)
      }, { merge: true });
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  // Get database statistics
  async getStatistics() {
    if (this.fallbackToLocal && this.localDB) {
      return this.localDB.default.getStatistics();
    }

    try {
      const statsRef = doc(db, 'meta', this.statisticsDoc);
      const statsSnap = await getDoc(statsRef);
      
      if (statsSnap.exists()) {
        return statsSnap.data();
      }
      
      return {
        totalIdentifiers: 0,
        totalReports: 0,
        totalAmount: 0,
        categories: {}
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalIdentifiers: 0,
        totalReports: 0,
        totalAmount: 0,
        categories: {}
      };
    }
  }

  // Search reports
  async searchReports(searchQuery, category = null, riskLevel = null) {
    if (this.fallbackToLocal && this.localDB) {
      return this.localDB.default.searchReports(searchQuery, category, riskLevel);
    }

    try {
      let q = collection(db, this.fraudReportsCollection);
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      if (riskLevel) {
        const severityMap = { low: [1, 2], medium: [3], high: [4, 5] };
        const severities = severityMap[riskLevel] || [];
        if (severities.length > 0) {
          q = query(q, where('severity', 'in', severities));
        }
      }
      
      q = query(q, orderBy('timestamp', 'desc'), limit(100));
      
      const querySnapshot = await getDocs(q);
      const reports = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const matchesQuery = !searchQuery || 
          data.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          data.identifier.toLowerCase().includes(searchQuery.toLowerCase());
          
        if (matchesQuery) {
          reports.push({
            ...data,
            displayIdentifier: this.getDisplayIdentifier(data.identifier),
            id: doc.id
          });
        }
      });
      
      return reports;
    } catch (error) {
      console.error('Error searching reports:', error);
      return [];
    }
  }

  // Initialize cloud database with demo data (run once)
  async initializeDemoData() {
    try {
      const demoData = this.getDemoData();
      
      for (const [identifier, data] of Object.entries(demoData)) {
        // Add fraud data document
        const docRef = doc(db, this.fraudDataCollection, identifier);
        await setDoc(docRef, {
          identifier,
          identifierType: this.getIdentifierType(identifier),
          ...data,
          lastUpdated: serverTimestamp()
        });
        
        // Add individual reports
        for (const report of data.reports) {
          await addDoc(collection(db, this.fraudReportsCollection), {
            ...report,
            identifier,
            identifierType: this.getIdentifierType(identifier),
            serverTimestamp: serverTimestamp()
          });
        }
      }
      
      console.log('✅ Demo data initialized in cloud database');
    } catch (error) {
      console.error('Error initializing demo data:', error);
    }
  }

  // Get demo data structure
  getDemoData() {
    return {
      'fraud@paytm': {
        reports: [
          {
            id: 'rpt_001',
            reportedBy: 'user1@example.com',
            description: 'Impersonated bank customer service, asked for OTP and PIN',
            amount: 15000,
            severity: 5,
            category: 'phishing',
            timestamp: Date.now() - 86400000,
            verified: true
          }
        ],
        safetyScore: 15,
        totalReports: 1,
        totalAmount: 15000,
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
            timestamp: Date.now() - 259200000,
            verified: true
          }
        ],
        safetyScore: 25,
        totalReports: 1,
        totalAmount: 3200,
        riskLevel: 'danger'
      }
    };
  }
}

// Export singleton instance
export const cloudFraudDB = new CloudFraudDatabase();
export default cloudFraudDB;