import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, Users, ExternalLink } from 'lucide-react';
import { checkUpiSafety } from '../services/firebaseService';

const UpiChecker = () => {
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateUpiId = (id) => {
    const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiPattern.test(id);
  };

  const handleCheck = async () => {
    if (!upiId.trim()) {
      setError('Please enter a UPI ID');
      return;
    }

    if (!validateUpiId(upiId.trim())) {
      setError('Please enter a valid UPI ID (e.g., user@paytm)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const safetyResult = await checkUpiSafety(upiId.trim());
      setResult(safetyResult);
    } catch (err) {
      setError('Failed to check UPI safety. Please try again.');
      console.error('Error checking UPI:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCheck();
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

  const getUpiApps = () => {
    return [
      { name: 'Google Pay', scheme: 'tez://upi/pay', package: 'com.google.android.apps.nbu.paisa.user' },
      { name: 'PhonePe', scheme: 'phonepe://pay', package: 'com.phonepe.app' },
      { name: 'Paytm', scheme: 'paytmmp://pay', package: 'net.one97.paytm' },
      { name: 'Amazon Pay', scheme: 'amazonpay://pay', package: 'in.amazon.mShop.android.shopping' },
      { name: 'BHIM', scheme: 'bhim://pay', package: 'in.org.npci.upiapp' }
    ];
  };

  const handleUpiAppRedirect = (app) => {
    const upiUrl = `${app.scheme}?pa=${upiId}&pn=Merchant&cu=INR`;
    
    // Try to open the specific app
    window.location.href = upiUrl;
    
    // Fallback to generic UPI URL after a delay
    setTimeout(() => {
      window.location.href = `upi://pay?pa=${upiId}&pn=Merchant&cu=INR`;
    }, 1000);
  };

  return (
    <div className="upi-checker">
      <div className="card">
        <h2><Shield size={24} /> UPI ID Safety Checker</h2>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
          Check if a UPI ID has been reported for fraudulent activities
        </p>
        
        <div className="form-group">
          <label className="form-label">Enter UPI ID</label>
          <input
            type="text"
            className="form-input"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., merchant@paytm"
            disabled={loading}
          />
          {error && <p style={{ color: '#DC2626', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>}
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
              Checking Safety...
            </>
          ) : (
            <>
              <Shield size={20} />
              Check Safety
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="card">
          <div className="safety-score">
            <div className={`score-circle ${getRiskColor(result.riskLevel)}`}>
              {result.safetyScore}
            </div>
            <div className="score-info">
              <h3>Safety Score</h3>
              <p>Out of 100 points</p>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Users size={20} color="#3B82F6" />
              <div style={{ marginLeft: '0.75rem' }}>
                <p style={{ margin: 0, fontWeight: '600', color: '#1F2937' }}>
                  {result.reportCount}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                  Total Reports
                </p>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <AlertTriangle size={20} color="#F59E0B" />
              <div style={{ marginLeft: '0.75rem' }}>
                <p style={{ margin: 0, fontWeight: '600', color: '#1F2937' }}>
                  {result.avgSeverity.toFixed(1)}/5
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                  Avg. Severity
                </p>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(107, 114, 128, 0.1)', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Clock size={20} color="#6B7280" />
              <div style={{ marginLeft: '0.75rem' }}>
                <p style={{ margin: 0, fontWeight: '600', color: '#1F2937' }}>
                  {formatDate(result.lastReported)}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                  Last Reported
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
                "This UPI ID appears to be safe with no significant fraud reports. You can proceed with payment using your preferred UPI app."}
              {result.riskLevel === 'moderate' && 
                "This UPI ID has some fraud reports. Exercise caution and verify the merchant before making payments."}
              {result.riskLevel === 'danger' && 
                "⚠️ This UPI ID has multiple fraud reports. Avoid making payments to this ID and report if you encounter fraud."}
            </p>
            
            {result.riskLevel === 'safe' && (
              <div style={{ marginTop: '1rem' }}>
                <h5 style={{ margin: '0 0 0.75rem 0', color: '#1F2937' }}>Pay using UPI Apps:</h5>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {getUpiApps().map((app) => (
                    <button
                      key={app.name}
                      onClick={() => handleUpiAppRedirect(app)}
                      className="btn btn-success"
                      style={{ 
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <ExternalLink size={14} />
                      {app.name}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.5rem', margin: 0 }}>
                  💡 These buttons will redirect you to your installed UPI apps for payment
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>💡 Safety Tips</h3>
        <ul style={{ color: '#4B5563', paddingLeft: '1.25rem' }}>
          <li>Always verify merchant details before payment</li>
          <li>Check for spelling mistakes in UPI IDs</li>
          <li>Never share your UPI PIN with anyone</li>
          <li>Report suspicious UPI IDs to help the community</li>
        </ul>
      </div>
    </div>
  );
};

export default UpiChecker;
