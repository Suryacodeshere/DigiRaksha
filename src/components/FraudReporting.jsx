import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle, DollarSign, User, MessageSquare } from 'lucide-react';
import { reportFraud } from '../services/firebaseService';

const FraudReporting = () => {
  const [formData, setFormData] = useState({
    upiId: '',
    description: '',
    amount: '',
    severity: 3,
    reporterContact: '',
    category: 'payment_fraud'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'payment_fraud', label: 'Payment Fraud' },
    { value: 'fake_qr', label: 'Fake QR Code' },
    { value: 'phishing', label: 'Phishing/Impersonation' },
    { value: 'fake_merchant', label: 'Fake Merchant' },
    { value: 'other', label: 'Other Fraud' }
  ];

  const severityLevels = [
    { value: 1, label: 'Low Risk', color: '#10B981', desc: 'Suspicious activity' },
    { value: 2, label: 'Minor', color: '#F59E0B', desc: 'Small amount lost' },
    { value: 3, label: 'Moderate', color: '#F59E0B', desc: 'Moderate loss' },
    { value: 4, label: 'High Risk', color: '#EF4444', desc: 'Significant loss' },
    { value: 5, label: 'Critical', color: '#DC2626', desc: 'Major fraud/identity theft' }
  ];

  const validateForm = () => {
    if (!formData.upiId.trim()) {
      setError('UPI ID is required');
      return false;
    }

    // Basic UPI ID validation
    const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiPattern.test(formData.upiId.trim())) {
      setError('Please enter a valid UPI ID (e.g., fraud@paytm)');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }

    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }

    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      setError('Amount must be a valid number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const reportData = {
        description: formData.description.trim(),
        amount: formData.amount ? parseFloat(formData.amount) : null,
        severity: formData.severity,
        reporterContact: formData.reporterContact.trim(),
        category: formData.category,
        userAgent: navigator.userAgent,
        reportedFrom: 'web_app'
      };

      await reportFraud(formData.upiId.trim(), reportData);
      setSuccess(true);
      
      // Reset form
      setFormData({
        upiId: '',
        description: '',
        amount: '',
        severity: 3,
        reporterContact: '',
        category: 'payment_fraud'
      });

    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error('Error submitting fraud report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSeverityColor = (severity) => {
    const level = severityLevels.find(s => s.value === severity);
    return level ? level.color : '#6B7280';
  };

  return (
    <div className="fraud-reporting">
      <div className="card">
        <h2><AlertTriangle size={24} /> Report Fraud</h2>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
          Help protect the community by reporting fraudulent UPI IDs and suspicious activities
        </p>

        {success && (
          <div className="success-message">
            <CheckCircle size={16} />
            <span style={{ marginLeft: '0.5rem' }}>
              Thank you! Your fraud report has been submitted successfully and will help protect other users.
            </span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertTriangle size={16} />
            <span style={{ marginLeft: '0.5rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Fraudulent UPI ID *
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.upiId}
              onChange={(e) => handleChange('upiId', e.target.value)}
              placeholder="e.g., scammer@paytm"
              disabled={loading}
              required
            />
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Enter the UPI ID that was involved in fraudulent activity
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Fraud Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              disabled={loading}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <MessageSquare size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Description *
            </label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what happened, how the fraud occurred, any messages received, etc."
              disabled={loading}
              required
            />
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Provide as much detail as possible to help others identify this fraud
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              <DollarSign size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Amount Lost (₹)
            </label>
            <input
              type="number"
              className="form-input"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              disabled={loading}
            />
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Enter the amount of money lost (optional)
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Severity Level</label>
            <div style={{ marginBottom: '1rem' }}>
              {severityLevels.map(level => (
                <label
                  key={level.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    margin: '0.5rem 0',
                    background: formData.severity === level.value ? 
                      `${level.color}20` : 'rgba(107, 114, 128, 0.05)',
                    border: `2px solid ${formData.severity === level.value ? 
                      level.color : 'transparent'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={formData.severity === level.value}
                    onChange={(e) => handleChange('severity', parseInt(e.target.value))}
                    style={{ marginRight: '0.75rem' }}
                    disabled={loading}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: formData.severity === level.value ? level.color : '#1F2937',
                      marginBottom: '0.25rem'
                    }}>
                      {level.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      {level.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Contact (Optional)</label>
            <input
              type="email"
              className="form-input"
              value={formData.reporterContact}
              onChange={(e) => handleChange('reporterContact', e.target.value)}
              placeholder="your.email@example.com"
              disabled={loading}
            />
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
              We may contact you for additional information (completely optional and confidential)
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-danger"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
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

      <div className="card">
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>🚨 Before Reporting</h3>
        <div style={{ color: '#4B5563', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Please ensure:</strong>
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li>You have actually experienced or witnessed fraud</li>
            <li>The UPI ID is correct and you've double-checked it</li>
            <li>You provide accurate and honest information</li>
            <li>You're not reporting due to personal disputes</li>
          </ul>
          <p style={{ fontSize: '0.9rem', color: '#DC2626', fontWeight: '500' }}>
            ⚠️ False reports may harm innocent users and could result in your access being restricted.
          </p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>💡 Additional Actions</h3>
        <div style={{ color: '#4B5563' }}>
          <p style={{ marginBottom: '1rem' }}>
            After reporting here, consider these additional steps:
          </p>
          <ul style={{ paddingLeft: '1.25rem' }}>
            <li>File a complaint with Cyber Crime: <strong>cybercrime.gov.in</strong></li>
            <li>Report to your bank's fraud helpline</li>
            <li>Call Cyber Crime Helpline: <strong>1930</strong></li>
            <li>Report to RBI: <strong>rbi.org.in</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FraudReporting;
