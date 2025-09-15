import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle, DollarSign, User, MessageSquare } from 'lucide-react';
import { reportFraud } from '../services/firebaseService';
import Alert from './Alert';

const FraudReporting = () => {
  const [formData, setFormData] = useState({
    fraudType: 'upi_fraud',
    fraudTarget: '',
    description: '',
    amount: '',
    severity: 3,
    reporterContact: '',
    category: 'payment_fraud',
    additionalDetails: {
      platform: '',
      contactMethod: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [error, setError] = useState('');

  const fraudTypes = [
    { value: 'upi_fraud', label: 'Fraudulent UPI ID', icon: '💳', placeholder: 'fraudulent@paytm' },
    { value: 'phone_fraud', label: 'Payment Phone Scam', icon: '📞', placeholder: '+91 9876543210' },
    { value: 'link_fraud', label: 'Fake Payment Link', icon: '🔗', placeholder: 'https://fake-payment-site.com' }
  ];

  const categories = [
    { value: 'payment_fraud', label: 'Direct Payment Fraud', desc: 'Unauthorized UPI transactions, fake payment requests' },
    { value: 'payment_phishing', label: 'Payment Phishing', desc: 'Fake payment messages, calls, websites to steal payment info' },
    { value: 'fake_merchant', label: 'Fake Merchant', desc: 'Fraudulent online stores, fake payment gateways' },
    { value: 'payment_redirect', label: 'Payment Redirection', desc: 'Redirecting payments to wrong accounts through fake links or misleading instructions' }
  ];

  const platforms = [
    { value: '', label: 'Select Platform' },
    { value: 'upi_app', label: 'UPI Payment App' },
    { value: 'sms', label: 'SMS/Text Message' },
    { value: 'phone_call', label: 'Phone Call' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
    { value: 'website', label: 'Fake Payment Website' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'other_platform', label: 'Other Platform' }
  ];

  const severityLevels = [
    { value: 1, label: 'Low Risk', color: '#10B981', desc: 'Suspicious activity' },
    { value: 2, label: 'Minor', color: '#F59E0B', desc: 'Small amount lost' },
    { value: 3, label: 'Moderate', color: '#F59E0B', desc: 'Moderate loss' },
    { value: 4, label: 'High Risk', color: '#EF4444', desc: 'Significant loss' },
    { value: 5, label: 'Critical', color: '#DC2626', desc: 'Major fraud/identity theft' }
  ];

  const validateForm = () => {
    if (!formData.fraudTarget.trim()) {
      const fraudTypeObj = fraudTypes.find(ft => ft.value === formData.fraudType);
      setError(`${fraudTypeObj?.label} is required`);
      return false;
    }

    const target = formData.fraudTarget.trim();
    if (formData.fraudType === 'upi_fraud') {
      const upiPattern = /^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiPattern.test(target)) {
        setError('Please enter a valid UPI ID (e.g., fraud@paytm)');
        return false;
      }
    } else if (formData.fraudType === 'phone_fraud') {
      const phonePattern = /^[\\+]?[1-9][\\d]{0,15}$/;
      const cleanPhone = target.replace(/[\\s\\-\\(\\)]/g, '');
      if (!phonePattern.test(cleanPhone) || cleanPhone.length < 10) {
        setError('Please enter a valid phone number');
        return false;
      }
    } else if (formData.fraudType === 'link_fraud') {
      try {
        new URL(target.startsWith('http') ? target : 'https://' + target);
      } catch {
        setError('Please enter a valid URL');
        return false;
      }
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }

    if (formData.description.trim().length < 15) {
      setError('Description must be at least 15 characters long for proper investigation');
      return false;
    }

    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      setError('Amount must be a valid number');
      return false;
    }

    return true;
  };

  const getCurrentFraudType = () => {
    return fraudTypes.find(ft => ft.value === formData.fraudType) || fraudTypes[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAlert({ ...alert, isOpen: false });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const reportData = {
        fraudType: formData.fraudType,
        description: formData.description.trim(),
        amount: formData.amount ? parseFloat(formData.amount) : null,
        severity: formData.severity,
        reporterContact: formData.reporterContact.trim(),
        category: formData.category,
        platform: formData.additionalDetails.platform,
        contactMethod: formData.additionalDetails.contactMethod,
        userAgent: navigator.userAgent,
        reportedFrom: 'web_app',
        timestamp: new Date().toISOString()
      };

      await reportFraud(formData.fraudTarget.trim(), reportData);
      
      const currentFraudType = getCurrentFraudType();
      setAlert({
        isOpen: true,
        type: 'success',
        title: '🛡️ Payment Fraud Report Submitted Successfully!',
        message: `Thank you for helping protect the community! Your report about "${formData.fraudTarget.trim()}" (${currentFraudType.label}) has been recorded and will help prevent others from falling victim to this payment fraud. Our security team will review the information you provided.`
      });
      
      // Reset form
      setFormData({
        fraudType: 'upi_fraud',
        fraudTarget: '',
        description: '',
        amount: '',
        severity: 3,
        reporterContact: '',
        category: 'payment_fraud',
        additionalDetails: {
          platform: '',
          contactMethod: ''
        }
      });

    } catch (err) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: '❌ Failed to Submit Report',
        message: 'We encountered an error while submitting your payment fraud report. Please check your internet connection and try again. If the problem persists, you can also report this fraud directly to your bank or the cyber crime helpline at 1930.'
      });
      console.error('Error submitting fraud report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

  return (
    <div className="fraud-reporting">
      <div className="card">
        <h2><AlertTriangle size={24} /> Report Payment Fraud</h2>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
          Help protect the community by reporting payment-related fraud including fraudulent UPI IDs, fake payment links, and payment scams
        </p>

        {error && (
          <div className="error-message">
            <AlertTriangle size={16} />
            <span style={{ marginLeft: '0.5rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Fraud Type Selection */}
          <div className="form-group">
            <label className="form-label">
              <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              What type of payment fraud are you reporting? *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
              {fraudTypes.map(type => (
                <label
                  key={type.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    border: `2px solid ${formData.fraudType === type.value ? '#3B82F6' : '#E5E7EB'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: formData.fraudType === type.value ? '#EFF6FF' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="fraudType"
                    value={type.value}
                    checked={formData.fraudType === type.value}
                    onChange={(e) => handleChange('fraudType', e.target.value)}
                    disabled={loading}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '1.2rem' }}>{type.icon}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fraud Target Input */}
          <div className="form-group">
            <label className="form-label">
              <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {getCurrentFraudType().label} *
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.fraudTarget}
              onChange={(e) => handleChange('fraudTarget', e.target.value)}
              placeholder={getCurrentFraudType().placeholder}
              disabled={loading}
              required
            />
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Enter the {getCurrentFraudType().label.toLowerCase()} that was involved in payment fraud
              {formData.fraudType === 'upi_fraud' && ' (e.g., scammer@paytm, fraud@phonepe)'}
              {formData.fraudType === 'phone_fraud' && ' (include country code, e.g., +91 9876543210)'}
              {formData.fraudType === 'link_fraud' && ' (e.g., https://fake-payment-website.com)'}
            </p>
          </div>

          {/* Fraud Category */}
          <div className="form-group">
            <label className="form-label">Payment Fraud Category *</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              disabled={loading}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
              {categories.find(c => c.value === formData.category)?.desc}
            </p>
          </div>

          {/* Platform/Contact Method */}
          <div className="form-group">
            <label className="form-label">How was the payment fraud attempted? *</label>
            <select
              className="form-select"
              value={formData.additionalDetails.platform}
              onChange={(e) => handleChange('additionalDetails.platform', e.target.value)}
              disabled={loading}
              required
            >
              {platforms.map(platform => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Select the platform or method used for the payment fraud attempt
            </p>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <MessageSquare size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Detailed Description *
            </label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide a detailed description: What payment fraud occurred? What did they ask you to pay for? What payment method did they request? Include any messages, calls, or payment requests you received. The more details you provide, the better we can help protect others."
              disabled={loading}
              required
              rows="5"
            />
            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Include: payment requests, fake merchant details, suspicious UPI IDs, fraudulent links, amounts requested, etc.
            </p>
          </div>

          {/* Amount Lost */}
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

          {/* Severity Level */}
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

          {/* Reporter Contact */}
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
                Submit Payment Fraud Report
              </>
            )}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>🚨 Before Reporting Payment Fraud</h3>
        <div style={{ color: '#4B5563', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Please ensure:</strong>
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li>You have actually experienced or witnessed payment fraud</li>
            <li>The payment details (UPI ID, phone number, link, etc.) are correct</li>
            <li>This involves fraudulent payment requests or unauthorized transactions</li>
            <li>You provide accurate and honest information about the payment fraud</li>
            <li>You're not reporting legitimate payment disputes</li>
          </ul>
          <p style={{ fontSize: '0.9rem', color: '#DC2626', fontWeight: '500' }}>
            ⚠️ False reports may harm innocent users and could result in your access being restricted.
          </p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>💡 Additional Payment Fraud Actions</h3>
        <div style={{ color: '#4B5563' }}>
          <p style={{ marginBottom: '1rem' }}>
            After reporting payment fraud here, consider these additional steps:
          </p>
          <ul style={{ paddingLeft: '1.25rem' }}>
            <li>Immediately contact your bank's fraud helpline to block transactions</li>
            <li>File a complaint with Cyber Crime: <strong>cybercrime.gov.in</strong></li>
            <li>Call National Cyber Crime Helpline: <strong>1930</strong></li>
            <li>Report to RBI (Reserve Bank of India): <strong>rbi.org.in</strong></li>
            <li>If money was transferred, file an FIR at your local police station</li>
            <li>Change your UPI PIN and banking passwords immediately</li>
          </ul>
        </div>
      </div>
      
      {/* Alert Popup */}
      <Alert
        isOpen={alert.isOpen}
        onClose={handleCloseAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        autoClose={true}
        autoCloseDelay={8000}
        showCloseButton={true}
      />
    </div>
  );
};

export default FraudReporting;