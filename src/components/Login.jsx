import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import cloudAuthService from '../services/cloudAuthService';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import DigiRakshaLogo from './DigiRakshaLogo';

const Login = ({ onLogin, onSwitchToSignup, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Try cloud authentication first
      try {
        const authenticatedUser = await cloudAuthService.loginUser(formData.email, formData.password);
        
        // Set user data in localStorage for session management
        localStorage.setItem('demoUser', JSON.stringify(authenticatedUser));
        localStorage.setItem('demoUserLoggedIn', 'true');
        
        onLogin(authenticatedUser);
        return;
      } catch (cloudAuthError) {
        console.log('Cloud auth error:', cloudAuthError.message);
        setError(cloudAuthError.message);
        return;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <DigiRakshaLogo size={64} />
          </div>
          <h1>Digi Raksha</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={onSwitchToSignup}
              disabled={loading}
            >
              Sign Up
            </button>
          </p>
          <p className="auth-forgot-password">
            Forgot your password?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={onSwitchToForgotPassword}
              disabled={loading}
            >
              Reset Password
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
