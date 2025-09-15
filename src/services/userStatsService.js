// User Statistics Service - Track user actions and stats
class UserStatsService {
  constructor() {
    this.statsKey = 'digi-raksha-user-stats';
    this.initializeStats();
  }

  // Initialize user stats
  initializeStats() {
    if (!localStorage.getItem(this.statsKey)) {
      localStorage.setItem(this.statsKey, JSON.stringify({}));
    }
  }

  // Get user stats
  getUserStats(userId) {
    const allStats = JSON.parse(localStorage.getItem(this.statsKey) || '{}');
    return allStats[userId] || {
      checksPerformed: 0,
      reportsSubmitted: 0,
      lastCheckDate: null,
      lastReportDate: null,
      createdAt: Date.now()
    };
  }

  // Update user stats
  updateUserStats(userId, updates) {
    const allStats = JSON.parse(localStorage.getItem(this.statsKey) || '{}');
    
    if (!allStats[userId]) {
      allStats[userId] = {
        checksPerformed: 0,
        reportsSubmitted: 0,
        lastCheckDate: null,
        lastReportDate: null,
        createdAt: Date.now()
      };
    }

    // Merge updates
    allStats[userId] = {
      ...allStats[userId],
      ...updates
    };

    localStorage.setItem(this.statsKey, JSON.stringify(allStats));
    return allStats[userId];
  }

  // Increment safety checks
  incrementSafetyChecks(userId) {
    const currentStats = this.getUserStats(userId);
    return this.updateUserStats(userId, {
      checksPerformed: currentStats.checksPerformed + 1,
      lastCheckDate: Date.now()
    });
  }

  // Increment fraud reports
  incrementFraudReports(userId) {
    const currentStats = this.getUserStats(userId);
    return this.updateUserStats(userId, {
      reportsSubmitted: currentStats.reportsSubmitted + 1,
      lastReportDate: Date.now()
    });
  }

  // Get all user statistics
  getAllUserStats() {
    return JSON.parse(localStorage.getItem(this.statsKey) || '{}');
  }

  // Get summary stats for admin
  getSummaryStats() {
    const allStats = this.getAllUserStats();
    const users = Object.values(allStats);
    
    return {
      totalUsers: users.length,
      totalChecks: users.reduce((sum, user) => sum + user.checksPerformed, 0),
      totalReports: users.reduce((sum, user) => sum + user.reportsSubmitted, 0),
      averageChecksPerUser: users.length > 0 ? 
        Math.round(users.reduce((sum, user) => sum + user.checksPerformed, 0) / users.length) : 0,
      averageReportsPerUser: users.length > 0 ? 
        Math.round(users.reduce((sum, user) => sum + user.reportsSubmitted, 0) / users.length) : 0
    };
  }

  // Clear all stats (for testing)
  clearAllStats() {
    localStorage.removeItem(this.statsKey);
    this.initializeStats();
  }
}

// Export singleton instance
export const userStatsService = new UserStatsService();
export default userStatsService;
