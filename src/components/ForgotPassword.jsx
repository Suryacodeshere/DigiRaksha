import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import DigiRakshaLogo from './DigiRakshaLogo';
import Alert from './Alert';
import emailService from '../services/emailService';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Email Required',
        message: 'Please enter your email address to reset your password.'
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address.'
      });
      return;
    }

    setLoading(true);
    try {
      // Use the new email service
      const result = await emailService.sendPasswordResetEmail(email);
      
      if (result.success) {
        let message = `We've sent a password reset link to ${email}. Please check your inbox and follow the instructions to reset your password.`;
        
        // Add demo information if in demo mode
        if (result.method === 'demo') {
          message += `\n\n🚀 Demo Mode: Check the browser console for the reset link and token, or use the following:\nReset Link: ${result.resetLink}`;
        }
        
        setAlert({
          isOpen: true,
          type: 'success',
          title: '✅ Password Reset Email Sent!',
          message
        });
        setEmail('');
      } else {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Reset Failed',
          message: result.message || 'Unable to send password reset email. Please try again.'
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Reset Failed',
        message: 'Unable to send password reset email. Please try again or contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <DigiRakshaLogo size={64} />
          <h1>Digi Raksha</h1>
          <h2>Reset Your Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Sending Reset Link...
              </>
            ) : (
              <>
                <Mail size={20} />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="auth-link"
            onClick={onBackToLogin}
            disabled={loading}
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </button>
        </div>

        <div className="auth-help">
          <h4>💡 Having trouble?</h4>
          <ul>
            <li>Make sure you entered the correct email address</li>
            <li>Check your spam/junk folder</li>
            <li>The reset link expires after 1 hour</li>
            <li>Contact support if you continue having issues</li>
          </ul>
        </div>
      </div>

      <Alert
        isOpen={alert.isOpen}
        onClose={handleCloseAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        autoClose={false}
        showCloseButton={true}
      />
    </div>
  );
};

export default ForgotPassword;