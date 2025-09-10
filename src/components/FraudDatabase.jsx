import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  AlertTriangle, 
  Phone, 
  Link as LinkIcon, 
  CreditCard, 
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';
import fraudDB from '../services/fraudDatabase';

const FraudDatabase = () => {
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    loadData();
  }, [searchQuery, categoryFilter, riskFilter]);

  const loadData = () => {
    setLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      let filteredReports;
      
      if (searchQuery || categoryFilter || riskFilter) {
        filteredReports = fraudDB.searchReports(searchQuery, categoryFilter || null, riskFilter || null);
      } else {
        filteredReports = fraudDB.getRecentReports(100);
      }
      
      setReports(filteredReports);
      setStatistics(fraudDB.getStatistics());
      setLoading(false);
    }, 300);
  };

  const refreshData = () => {
    fraudDB.updateReportsFeed();
    loadData();
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getIdentifierIcon = (type) => {
    switch (type) {
      case 'phone': return <Phone size={16} />;
      case 'link': return <LinkIcon size={16} />;
      default: return <CreditCard size={16} />;
    }
  };

  const getSeverityColor = (severity) => {
    if (severity >= 4) return '#EF4444';
    if (severity === 3) return '#F59E0B';
    return '#10B981';
  };

  const getSeverityLabel = (severity) => {
    if (severity >= 4) return 'High Risk';
    if (severity === 3) return 'Moderate';
    return 'Low Risk';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'phishing': 'Phishing',
      'payment_fraud': 'Payment Fraud',
      'phone_fraud': 'Phone Scam',
      'fake_merchant': 'Fake Merchant',
      'link_fraud': 'Malicious Link',
      'other': 'Other Fraud'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'phishing': '🎣',
      'payment_fraud': '💳',
      'phone_fraud': '📞',
      'fake_merchant': '🏪',
      'link_fraud': '🔗',
      'other': '⚠️'
    };
    return icons[category] || '⚠️';
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'payment_fraud', label: 'Payment Fraud' },
    { value: 'phone_fraud', label: 'Phone Scam' },
    { value: 'fake_merchant', label: 'Fake Merchant' },
    { value: 'link_fraud', label: 'Malicious Link' },
    { value: 'other', label: 'Other' }
  ];

  const riskLevels = [
    { value: '', label: 'All Risk Levels' },
    { value: 'high', label: 'High Risk (4-5)' },
    { value: 'medium', label: 'Moderate Risk (3)' },
    { value: 'low', label: 'Low Risk (1-2)' }
  ];

  return (
    <div className="fraud-database">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2><Database size={24} /> Fraud Database</h2>
            <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>
              Community-driven fraud reports and statistics
            </p>
          </div>
          <button
            onClick={refreshData}
            className="btn btn-secondary"
            disabled={loading}
            style={{ padding: '0.5rem' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <AlertTriangle size={18} />
            Recent Reports
          </button>
          <button
            className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <TrendingUp size={18} />
            Statistics
          </button>
        </div>

        {activeTab === 'reports' && (
          <>
            {/* Search and Filters */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#6B7280'
                }} />
                <input
                  type="text"
                  className="form-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports..."
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                {riskLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div style={{ marginBottom: '1rem', color: '#6B7280', fontSize: '0.9rem' }}>
              {loading ? 'Loading...' : `${reports.length} reports found`}
            </div>

            {/* Reports List */}
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                Loading fraud reports...
              </div>
            ) : reports.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#6B7280',
                background: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '0.5rem'
              }}>
                <Database size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>No reports match your current filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('');
                    setRiskFilter('');
                  }}
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reports.map((report) => (
                  <div key={report.id} className="card" style={{ padding: '1rem', margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {getCategoryIcon(report.category)}
                        </span>
                        <div>
                          <h4 style={{ margin: 0, color: '#1F2937', fontSize: '1rem' }}>
                            {getCategoryLabel(report.category)}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <Clock size={14} color="#6B7280" />
                            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                              {formatTimeAgo(report.timestamp)}
                            </span>
                            {report.verified && (
                              <span style={{ 
                                fontSize: '0.7rem', 
                                background: '#10B981', 
                                color: 'white',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '0.25rem'
                              }}>
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ 
                        padding: '0.25rem 0.5rem',
                        background: `${getSeverityColor(report.severity)}20`,
                        color: getSeverityColor(report.severity),
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {getSeverityLabel(report.severity)} ({report.severity}/5)
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      padding: '0.5rem',
                      background: 'rgba(59, 130, 246, 0.05)',
                      borderRadius: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      {getIdentifierIcon(report.identifierType)}
                      <span style={{ fontWeight: '600', color: '#1F2937', fontSize: '0.9rem' }}>
                        Target:
                      </span>
                      <span style={{ 
                        color: '#3B82F6', 
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                      }}>
                        {report.displayIdentifier}
                      </span>
                    </div>

                    <p style={{ 
                      margin: 0, 
                      color: '#4B5563', 
                      lineHeight: '1.5',
                      fontSize: '0.9rem',
                      marginBottom: '1rem'
                    }}>
                      {report.description}
                    </p>

                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '1rem'
                    }}>
                      {report.amount && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem'
                        }}>
                          <DollarSign size={16} color="#DC2626" />
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Amount Lost</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#DC2626' }}>
                              {formatCurrency(report.amount)}
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem'
                      }}>
                        <Users size={16} color="#6B7280" />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Reported By</div>
                          <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                            {report.reportedBy || 'Anonymous'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                      fontSize: '0.75rem',
                      color: '#9CA3AF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>ID: {report.id}</span>
                      <span>
                        {new Date(report.timestamp).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'statistics' && (
          <div className="statistics-tab">
            {/* Overall Statistics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <Database size={32} color="#3B82F6" />
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', marginTop: '0.5rem' }}>
                  {statistics.totalIdentifiers}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Total Entities</div>
              </div>

              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <AlertTriangle size={32} color="#EF4444" />
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', marginTop: '0.5rem' }}>
                  {statistics.totalReports}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Total Reports</div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <DollarSign size={32} color="#10B981" />
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', marginTop: '0.5rem' }}>
                  ₹{Math.round(statistics.totalAmount / 1000)}K
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Total Loss Reported</div>
              </div>
            </div>

            {/* Risk Level Distribution */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>Risk Level Distribution</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#EF4444',
                    marginBottom: '0.25rem'
                  }}>
                    {statistics.highRiskCount}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>High Risk</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#F59E0B',
                    marginBottom: '0.25rem'
                  }}>
                    {statistics.moderateRiskCount}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Moderate Risk</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#10B981',
                    marginBottom: '0.25rem'
                  }}>
                    {statistics.lowRiskCount}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Low Risk</div>
                </div>
              </div>
            </div>

            {/* Category Statistics */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>Fraud Categories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(statistics.categories || {}).map(([category, data]) => (
                  <div key={category} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{getCategoryIcon(category)}</span>
                      <span style={{ fontWeight: '500', color: '#1F2937' }}>
                        {getCategoryLabel(category)}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', color: '#1F2937' }}>
                        {data.count} reports
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                        ₹{data.amount.toLocaleString('en-IN')} lost
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safety Tips */}
      <div className="card">
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>
          <Shield size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Community Safety
        </h3>
        <div style={{ color: '#4B5563', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1rem' }}>
            This database is powered by community reports. Help keep everyone safe by:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li>Reporting any fraud attempts you encounter</li>
            <li>Verifying identities before making payments</li>
            <li>Checking this database before engaging with unknown entities</li>
            <li>Sharing safety awareness with friends and family</li>
          </ul>
          <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
            💡 Remember: Always verify independently and report to authorities for legal action.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FraudDatabase;
