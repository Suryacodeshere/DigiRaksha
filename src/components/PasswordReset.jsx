import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import emailService from '../services/emailService';
import { userDB } from '../services/userDatabase';
import Alert from './Alert';

const PasswordReset = ({ onBackToLogin, onSuccess }) => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (resetToken) {
      setToken(resetToken);
      validateToken(resetToken);
    } else {
      setValidating(false);
      setTokenValid(false);
    }
  }, []);

  const validateToken = async (resetToken) => {
    setValidating(true);
    try {
      const validation = emailService.validateResetToken(resetToken);
      
      if (validation.valid) {
        setTokenValid(true);
        setEmail(validation.email);
      } else {
        setTokenValid(false);
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Invalid Reset Link',
          message: `This password reset link is ${validation.reason}. Please request a new password reset.`
        });
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setTokenValid(false);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Unable to validate the reset link. Please try again.'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setAlert({ ...alert, isOpen: false });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Invalid Password',
        message: passwordError
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Password Mismatch',
        message: 'The passwords you entered do not match. Please try again.'
      });
      return;
    }

    setLoading(true);
    try {
      // Mark token as used
      emailService.useResetToken(token);
      
      // Update password in user database (demo mode)
      if (userDB && userDB.getUserByEmail) {
        try {
          const userData = userDB.getUserByEmail(email);
          if (userData) {
            userDB.updateUserPassword(email, formData.newPassword);
            console.log('✅ Password updated in demo database');
          }
        } catch (dbError) {
          console.warn('Could not update password in demo database:', dbError);
        }
      }
      
      setAlert({
        isOpen: true,
        type: 'success',
        title: '✅ Password Reset Successful!',
        message: 'Your password has been successfully updated. You can now sign in with your new password.'
      });
      
      // Clear form
      setFormData({ newPassword: '', confirmPassword: '' });
      
      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(email);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Password reset error:', error);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Reset Failed',
        message: 'Unable to reset your password. Please try again or contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🛡️ Digi Raksha</h1>
            <h2>Validating Reset Link</h2>
            <p>Please wait while we verify your password reset link...</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="loading-spinner large"></div>
            <p style={{ color: '#6B7280', marginTop: '1rem' }}>Validating...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🛡️ Digi Raksha</h1>
            <h2>Invalid Reset Link</h2>
            <p>This password reset link is invalid or has expired</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={48} color="#EF4444" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
              The password reset link you used is either invalid, expired, or has already been used.
            </p>
            
            <button
              type="button"
              className="btn btn-primary"
              onClick={onBackToLogin}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </button>
          </div>
          
          <div className="auth-help">
            <h4>💡 Need help?</h4>
            <ul>
              <li>Request a new password reset from the sign-in page</li>
              <li>Make sure you're using the latest reset link from your email</li>
              <li>Reset links expire after 1 hour for security</li>
              <li>Each reset link can only be used once</li>
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
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🛡️ Digi Raksha</h1>
          <h2>Set New Password</h2>
          <p>Create a new secure password for {email}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              New Password
            </label>
            <div className="password-input-container">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                className="form-input"
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                placeholder="Enter your new password"
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                disabled={loading}
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              Confirm New Password
            </label>
            <div className="password-input-container">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                className="form-input"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Confirm your new password"
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                disabled={loading}
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Updating Password...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Update Password
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
          <h4>🔒 Password Requirements:</h4>
          <ul>
            <li>At least 6 characters long</li>
            <li>Use a combination of letters, numbers, and symbols</li>
            <li>Avoid using personal information</li>
            <li>Don't reuse old passwords</li>
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

export default PasswordReset;