import React, { useState } from 'react';
import { Phone, Shield, AlertTriangle, CheckCircle, Users, Clock } from 'lucide-react';
import { checkUpiSafety } from '../services/firebaseService';

const PhoneChecker = ({ user }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validatePhoneNumber = (phone) => {
    const phonePattern = /^(\+91|91|0)?[6-9]\d{9}$/;
    return phonePattern.test(phone.replace(/\s+/g, ''));
  };

  const normalizePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.startsWith('+91')) return cleaned.slice(3);
    if (cleaned.startsWith('91')) return cleaned.slice(2);
    if (cleaned.startsWith('0')) return cleaned.slice(1);
    return cleaned;
  };

  const handleCheck = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Indian phone number');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const userId = user?.uid || user?.email;
      const safetyResult = await checkUpiSafety(`phone_${normalizedPhone}`, userId);
      setResult({
        ...safetyResult,
        phoneNumber: normalizedPhone,
        displayNumber: phoneNumber
      });
    } catch (err) {
      setError('Failed to check phone number. Please try again.');
      console.error('Error checking phone:', err);
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

  return (
    <div className="phone-checker">
      <div className="card">
        <h2><Phone size={24} /> Phone Number Safety</h2>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
          Check phone numbers for fraud reports to protect yourself from scams
        </p>

        {error && (
          <div className="error-message" style={{ margin: '1rem 0' }}>
            <AlertTriangle size={16} />
            <span style={{ marginLeft: '0.5rem' }}>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number (e.g., 9876543210)"
            disabled={loading}
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
                <p>For +91 {result.phoneNumber}</p>
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
                  "This phone number appears safe with no significant fraud reports."}
                {result.riskLevel === 'moderate' && 
                  "This phone number has some fraud reports. Exercise caution when receiving calls."}
                {result.riskLevel === 'danger' && 
                  "⚠️ This phone number has multiple fraud reports. Avoid engaging and block if necessary."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>📞 Phone Fraud Prevention</h3>
        <ul style={{ color: '#4B5563', paddingLeft: '1.25rem' }}>
          <li>Never share OTPs, PINs, or passwords over phone calls</li>
          <li>Banks never ask for sensitive information via phone</li>
          <li>Be wary of calls claiming urgent account issues</li>
          <li>Block and report suspicious numbers immediately</li>
          <li>Use caller ID apps to identify potential spam calls</li>
        </ul>
      </div>
    </div>
  );
};

export default PhoneChecker;
