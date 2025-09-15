import React, { useState, useRef } from 'react';
import { Scan, Upload, AlertTriangle, Shield } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { checkUpiSafety } from '../services/firebaseService';

const QrScanner = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [safetyResult, setSafetyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const extractUpiFromQr = (qrText) => {
    try {
      // UPI QR codes typically start with 'upi://pay?'
      if (qrText.startsWith('upi://pay?')) {
        const url = new URL(qrText);
        const pa = url.searchParams.get('pa'); // payee address (UPI ID)
        const pn = url.searchParams.get('pn'); // payee name
        const am = url.searchParams.get('am'); // amount
        const tn = url.searchParams.get('tn'); // transaction note
        
        return {
          upiId: pa,
          payeeName: pn,
          amount: am,
          note: tn,
          rawData: qrText
        };
      } else {
        // Try to find UPI ID pattern in the text
        const upiPattern = /([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64})/g;
        const matches = qrText.match(upiPattern);
        if (matches && matches.length > 0) {
          return {
            upiId: matches[0],
            rawData: qrText
          };
        }
      }
      return null;
    } catch (err) {
      console.error('Error extracting UPI from QR:', err);
      return null;
    }
  };

  const checkUpiFromQr = async (upiData) => {
    if (!upiData || !upiData.upiId) {
      setError('No valid UPI ID found in QR code');
      return;
    }

    setLoading(true);
    try {
      const safety = await checkUpiSafety(upiData.upiId);
      setSafetyResult(safety);
    } catch (err) {
      setError('Failed to check UPI safety');
      console.error('Error checking UPI safety:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);
    setSafetyResult(null);

    try {
      const html5QrCode = new Html5Qrcode('temp-scanner');
      const qrCodeMessage = await html5QrCode.scanFile(file, true);
      
      const upiData = extractUpiFromQr(qrCodeMessage);
      setResult(upiData);
      
      if (upiData) {
        await checkUpiFromQr(upiData);
      } else {
        setError('QR code does not contain a valid UPI payment link');
      }
    } catch (err) {
      console.error('QR scan error:', err);
      setError('Failed to read QR code from image. Please try a clearer image.');
    } finally {
      setUploading(false);
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

  return (
    <div className="qr-scanner">
      <div className="card">
        <h2><Scan size={24} /> QR Code Scanner</h2>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
          Scan QR codes to check UPI payment safety before making transactions
        </p>

        <button
          className="btn btn-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || uploading}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          {uploading ? (
            <>
              <div className="loading-spinner"></div>
              Reading QR Code...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload QR Image
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        
        <div id="temp-scanner" style={{ display: 'none' }}></div>

        {error && (
          <div className="error-message">
            <AlertTriangle size={16} />
            <span style={{ marginLeft: '0.5rem' }}>{error}</span>
          </div>
        )}
      </div>


      {result && (
        <div className="card">
          <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>
            QR Code Details
          </h3>
          
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: '#1F2937' }}>UPI ID:</span>
              <span style={{ color: '#3B82F6', fontWeight: '500' }}>{result.upiId}</span>
            </div>
            
            {result.payeeName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: '#1F2937' }}>Payee:</span>
                <span style={{ color: '#4B5563' }}>{result.payeeName}</span>
              </div>
            )}
            
            {result.amount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: '#1F2937' }}>Amount:</span>
                <span style={{ color: '#059669', fontWeight: '600' }}>₹{result.amount}</span>
              </div>
            )}
            
            {result.note && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: '#1F2937' }}>Note:</span>
                <span style={{ color: '#4B5563' }}>{result.note}</span>
              </div>
            )}
          </div>

          {loading && (
            <div className="loading">
              <div className="loading-spinner"></div>
              Checking safety...
            </div>
          )}

          {safetyResult && (
            <div>
              <div className="safety-score">
                <div className={`score-circle ${getRiskColor(safetyResult.riskLevel)}`}>
                  {safetyResult.safetyScore}
                </div>
                <div className="score-info">
                  <h3>Safety Score</h3>
                  <p>Out of 100 points</p>
                  <div className={`risk-badge ${getRiskBadgeClass(safetyResult.riskLevel)}`} style={{ marginTop: '0.5rem' }}>
                    <Shield size={14} />
                    <span style={{ marginLeft: '0.25rem' }}>
                      {safetyResult.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                background: safetyResult.riskLevel === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 
                            safetyResult.riskLevel === 'moderate' ? 'rgba(245, 158, 11, 0.1)' : 
                            'rgba(16, 185, 129, 0.1)',
                borderRadius: '0.5rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1F2937' }}>
                  Payment Recommendation
                </h4>
                <p style={{ margin: 0, color: '#4B5563' }}>
                  {safetyResult.riskLevel === 'safe' && 
                    "✅ This UPI ID appears safe. You can proceed with the payment, but always verify merchant details."}
                  {safetyResult.riskLevel === 'moderate' && 
                    "⚠️ Exercise caution. This UPI ID has some fraud reports. Verify the merchant before proceeding."}
                  {safetyResult.riskLevel === 'danger' && 
                    "🚨 Do not proceed! This UPI ID has been reported for fraud. Cancel the payment and report if suspicious."}
                </p>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  padding: '0.75rem', 
                  background: 'rgba(107, 114, 128, 0.1)',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1F2937' }}>
                    {safetyResult.reportCount}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                    Reports
                  </p>
                </div>
                <div style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  padding: '0.75rem', 
                  background: 'rgba(107, 114, 128, 0.1)',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1F2937' }}>
                    {safetyResult.avgSeverity.toFixed(1)}/5
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                    Severity
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>🛡️ QR Code Safety Tips</h3>
        <ul style={{ color: '#4B5563', paddingLeft: '1.25rem' }}>
          <li>Always scan QR codes before making payments</li>
          <li>Verify merchant name and amount before confirming</li>
          <li>Be suspicious of QR codes from unknown sources</li>
          <li>Check the UPI ID matches the merchant you intend to pay</li>
        </ul>
      </div>
    </div>
  );
};

export default QrScanner;
