import React, { useState } from 'react';
import { Link as LinkIcon, Shield, AlertTriangle, CheckCircle, Send, Users, Clock, ExternalLink } from 'lucide-react';
import { reportFraud, checkUpiSafety } from '../services/firebaseService';

const LinkChecker = () => {
  const [activeTab, setActiveTab] = useState('check');
  const [paymentLink, setPaymentLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState({
    link: '',
    description: '',
    amount: '',
    severity: 3,
    category: 'link_fraud'
  });
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const validatePaymentLink = (link) => {
    try {
      const url = new URL(link);
      // Check for common payment domains
      const paymentDomains = [
        'gpay.app.goo.gl',
        'paytm.me',
        'phonepe.com',
        'razorpay.com',
        'instamojo.com',
        'cashfree.com',
        'ccavenue.com',
        'billdesk.com',
        'pay.amazon.in',
        'payments.google.com'
      ];
      
      // Check if it's a known payment domain or UPI URL
      return link.startsWith('upi://') || 
             paymentDomains.some(domain => url.hostname.includes(domain)) ||
             url.href.includes('upi') ||
             url.href.includes('payment') ||
             url.href.includes('pay');
    } catch {
      // If it's not a valid URL, check if it's a UPI scheme
      return link.startsWith('upi://');
    }
  };

  const normalizePaymentLink = (link) => {
    // Create a hash of the link for database storage
    return link.toLowerCase().trim();
  };

  const getDomainFromLink = (link) => {
    try {
      const url = new URL(link);
      return url.hostname;
    } catch {
      if (link.startsWith('upi://')) {
        return 'UPI Protocol';
      }
      return 'Unknown';
    }
  };

  const handleCheck = async () => {
    if (!paymentLink.trim()) {
      setError('Please enter a payment link');
      return;
    }

    if (!validatePaymentLink(paymentLink)) {
      setError('Please enter a valid payment link or UPI URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const normalizedLink = normalizePaymentLink(paymentLink);
      const linkHash = btoa(normalizedLink).replace(/[^a-zA-Z0-9]/g, '_');
      const safetyResult = await checkUpiSafety(`link_${linkHash}`);
      setResult({
        ...safetyResult,
        originalLink: paymentLink,
        domain: getDomainFromLink(paymentLink)
      });
    } catch (err) {
      setError('Failed to check payment link. Please try again.');
      console.error('Error checking link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportData.link.trim() || !reportData.description.trim()) {
      setError('Payment link and description are required');
      return;
    }

    if (!validatePaymentLink(reportData.link)) {
      setError('Please enter a valid payment link or UPI URL');
      return;
    }

    setReportLoading(true);
    setError('');

    try {
      const normalizedLink = normalizePaymentLink(reportData.link);
      const linkHash = btoa(normalizedLink).replace(/[^a-zA-Z0-9]/g, '_');
      const fraudData = {
        description: reportData.description.trim(),
        amount: reportData.amount ? parseFloat(reportData.amount) : null,
        severity: reportData.severity,
        category: 'link_fraud',
        originalLink: reportData.link,
        domain: getDomainFromLink(reportData.link),
        reportedFrom: 'link_checker'
      };

      await reportFraud(`link_${linkHash}`, fraudData);
      setReportSuccess(true);
      setReportData({
        link: '',
        description: '',
        amount: '',
        severity: 3,
        category: 'link_fraud'
      });
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error('Error reporting link fraud:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'safe': return 'score-safe';
      case 'moderate': return 'score-moderate';
      case 'danger': return 'score-danger';
      default: return 'score-safe';
    }
  };

  const getRiskBadgeClass = (riskLevel) => {
    switch (riskLevel) {
      case 'safe': return 'risk-safe';
      case 'moderate': return 'risk-moderate';
      case 'danger': return 'risk-danger';
      default: return 'risk-safe';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString();
  };

  const truncateLink = (link, maxLength = 50) => {
    if (link.length <= maxLength) return link;
    return link.substring(0, maxLength) + '...';
  };

  return (
    <div className="link-checker">
      <div className="card">
        <h2><LinkIcon size={24} /> Payment Link Safety</h2>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
          Check and report fraudulent payment links to protect the community
        </p>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'check' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('check');
              setError('');
              setReportSuccess(false);
            }}
          >
            <Shield size={18} />
            Check Link
          </button>
          <button
            className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('report');
              setError('');
              setResult(null);
            }}
          >
            <AlertTriangle size={18} />
            Report Fraud
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ margin: '1rem 0' }}>
            <AlertTriangle size={16} />
            <span style={{ marginLeft: '0.5rem' }}>{error}</span>
          </div>
        )}

        {reportSuccess && (
          <div className="success-message" style={{ margin: '1rem 0' }}>
            <CheckCircle size={16} />
            <span style={{ marginLeft: '0.5rem' }}>
              Thank you! Your fraud report has been submitted successfully.
            </span>
          </div>
        )}

        {/* Check Tab */}
        {activeTab === 'check' && (
          <div className="tab-content">
            <div className="form-group">
              <label className="form-label">Payment Link or UPI URL</label>
              <textarea
                className="form-textarea"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="Paste the payment link here (e.g., https://paytm.me/abc123 or upi://pay?pa=merchant@paytm)"
                disabled={loading}
                rows={3}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleCheck}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Checking...
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Check Safety
                </>
              )}
            </button>

            {result && (
              <div style={{ marginTop: '1.5rem' }}>
                <div className="safety-score">
                  <div className={`score-circle ${getRiskColor(result.riskLevel)}`}>
                    {result.safetyScore}
                  </div>
                  <div className="score-info">
                    <h3>Safety Score</h3>
                    <p>Domain: {result.domain}</p>
                    <div className={`risk-badge ${getRiskBadgeClass(result.riskLevel)}`} style={{ marginTop: '0.5rem' }}>
                      {result.riskLevel === 'safe' && <CheckCircle size={14} />}
                      {result.riskLevel === 'moderate' && <AlertTriangle size={14} />}
                      {result.riskLevel === 'danger' && <AlertTriangle size={14} />}
                      <span style={{ marginLeft: '0.25rem' }}>
                        {result.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Link Preview */}
                <div style={{
                  background: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginTop: '1rem',
                  wordBreak: 'break-all'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <ExternalLink size={16} color="#3B82F6" />
                    <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#1F2937' }}>
                      Checked Link:
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#4B5563', fontSize: '0.9rem' }}>
                    {truncateLink(result.originalLink, 80)}
                  </p>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '1rem',
                  marginTop: '1.5rem'
                }}>
                  <div style={{ 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    padding: '1rem', 
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <Users size={20} color="#3B82F6" />
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1F2937' }}>
                        {result.reportCount}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                        Reports
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    background: 'rgba(245, 158, 11, 0.1)', 
                    padding: '1rem', 
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <AlertTriangle size={20} color="#F59E0B" />
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1F2937' }}>
                        {result.avgSeverity.toFixed(1)}/5
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                        Avg. Risk
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    background: 'rgba(107, 114, 128, 0.1)', 
                    padding: '1rem', 
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <Clock size={20} color="#6B7280" />
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1F2937' }}>
                        {formatDate(result.lastReported)}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                        Last Report
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  background: result.riskLevel === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 
                              result.riskLevel === 'moderate' ? 'rgba(245, 158, 11, 0.1)' : 
                              'rgba(16, 185, 129, 0.1)',
                  borderRadius: '0.5rem'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#1F2937' }}>
                    Safety Recommendation
                  </h4>
                  <p style={{ margin: 0, color: '#4B5563' }}>
                    {result.riskLevel === 'safe' && 
                      "This payment link appears safe with no significant fraud reports."}
                    {result.riskLevel === 'moderate' && 
                      "This payment link has some fraud reports. Exercise caution and verify the merchant."}
                    {result.riskLevel === 'danger' && 
                      "⚠️ This payment link has multiple fraud reports. Do not make any payments!"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && (
          <div className="tab-content">
            <form onSubmit={handleReport}>
              <div className="form-group">
                <label className="form-label">Fraudulent Payment Link *</label>
                <textarea
                  className="form-textarea"
                  value={reportData.link}
                  onChange={(e) => setReportData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="Paste the fraudulent payment link here"
                  disabled={reportLoading}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  value={reportData.description}
                  onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe how you encountered this link, what happened when you used it, any suspicious behavior..."
                  disabled={reportLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount Lost (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={reportData.amount}
                  onChange={(e) => setReportData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0"
                  min="0"
                  disabled={reportLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Risk Level</label>
                <select
                  className="form-select"
                  value={reportData.severity}
                  onChange={(e) => setReportData(prev => ({ ...prev, severity: parseInt(e.target.value) }))}
                  disabled={reportLoading}
                >
                  <option value={1}>Low Risk - Suspicious link</option>
                  <option value={2}>Minor - Small scam attempts</option>
                  <option value={3}>Moderate - Clear fraud attempt</option>
                  <option value={4}>High Risk - Significant loss</option>
                  <option value={5}>Critical - Major fraud/data theft</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-danger"
                disabled={reportLoading}
                style={{ width: '100%' }}
              >
                {reportLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Fraud Report
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>🔗 Payment Link Safety Tips</h3>
        <ul style={{ color: '#4B5563', paddingLeft: '1.25rem' }}>
          <li>Always verify the merchant/sender before clicking payment links</li>
          <li>Check the domain name carefully for typos or suspicious URLs</li>
          <li>Be cautious of links received via SMS, email, or social media</li>
          <li>Use official apps instead of web links when possible</li>
          <li>Never enter sensitive information on suspicious websites</li>
          <li>Report suspicious payment links to help protect others</li>
        </ul>
      </div>
    </div>
  );
};

export default LinkChecker;
