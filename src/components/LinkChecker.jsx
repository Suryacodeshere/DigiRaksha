import React, { useState } from 'react';
import { Link as LinkIcon, Shield, AlertTriangle, CheckCircle, Users, Clock, ExternalLink } from 'lucide-react';
import { checkUpiSafety } from '../services/firebaseService';

const LinkChecker = ({ user }) => {
  const [paymentLink, setPaymentLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validatePaymentLink = (link) => {
    try {
      const url = new URL(link);
      // Accept any valid URL format
      return true;
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
      setError('Please enter a valid URL or UPI scheme');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const normalizedLink = normalizePaymentLink(paymentLink);
      const linkHash = btoa(normalizedLink).replace(/[^a-zA-Z0-9]/g, '_');
      const userId = user?.uid || user?.email;
      const safetyResult = await checkUpiSafety(`link_${linkHash}`, userId);
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
          Check payment links for fraud reports to protect yourself from scams
        </p>

        {error && (
          <div className="error-message" style={{ margin: '1rem 0' }}>
            <AlertTriangle size={16} />
            <span style={{ marginLeft: '0.5rem' }}>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Payment Link or UPI URL</label>
          <textarea
            className="form-textarea"
            value={paymentLink}
            onChange={(e) => setPaymentLink(e.target.value)}
            placeholder="Paste any suspicious link here (e.g., https://example.com/pay, https://fake-bank.com, or upi://pay?pa=merchant@paytm)"
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
