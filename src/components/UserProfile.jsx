import React, { useState, useEffect } from 'react';
import { updateProfile, updatePassword, signOut } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../config/firebase';
import cloudAuthService from '../services/cloudAuthService';
import { User, Mail, Lock, Save, LogOut, Shield, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { userStatsService } from '../services/userStatsService';
import { userDB } from '../services/userDatabase';
import emailService from '../services/emailService';
import Alert from './Alert';

const UserProfile = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    name: user?.name || user?.displayName || '',
    email: user?.email || ''
  });
  const [userStats, setUserStats] = useState({
    reportsSubmitted: 0,
    checksPerformed: 0,
    accountCreated: null
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Get stats from local storage
      const stats = userStatsService.getUserStats(user.uid || user.email);
      
      // Get account creation date from user data
      let accountCreated = null;
      if (user.uid && user.uid.startsWith('user_')) {
        // For local users, try to get from user database
        const userData = userDB.getUserByEmail(user.email);
        accountCreated = userData?.createdAt || stats.createdAt;
      } else {
        // For demo users, use stats creation date
        accountCreated = user.createdAt || stats.createdAt;
      }
      
      setUserStats({
        reportsSubmitted: stats.reportsSubmitted,
        checksPerformed: stats.checksPerformed,
        accountCreated
      });
    } catch (err) {
      console.error('Error loading user stats:', err);
      // Fallback to default stats
      setUserStats({
        reportsSubmitted: 0,
        checksPerformed: 0,
        accountCreated: user.createdAt || Date.now()
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setAlert({ ...alert, isOpen: false });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      // Update profile using cloud authentication service
      const profileUpdates = {
        fullName: formData.name.trim(),
        profile: {
          ...user.profile,
          lastUpdated: Date.now()
        }
      };

      const updatedUser = await cloudAuthService.updateUserProfile(user.email, profileUpdates);
      
      // Update local storage cache
      localStorage.setItem('demoUser', JSON.stringify(updatedUser));
      
      // Update the current user object reference
      user.fullName = formData.name.trim();
      user.displayName = formData.name.trim();

      setAlert({
        isOpen: true,
        type: 'success',
        title: '✓ Profile Updated Successfully!',
        message: `Hello ${formData.name.trim()}! Your profile information has been updated successfully and synced to the cloud.`
      });
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async () => {
    if (!user?.email) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No email address found for this account.'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await cloudAuthService.resetPassword(user.email);
      
      setAlert({
        isOpen: true,
        type: 'success',
        title: '✅ Password Reset Requested!',
        message: result.message
      });
    } catch (err) {
      console.error('Password reset error:', err);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Reset Failed',
        message: err.message || 'Unable to process password reset. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Try Firebase signout first
      try {
        await signOut(auth);
      } catch (firebaseErr) {
        console.warn('Firebase signout not available:', firebaseErr);
      }
      
      // Clear local demo user data
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoUserLoggedIn');
      
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to log out. Please try again.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-container">
      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-info">
            <h2>Hello, {user?.name || user?.displayName || user?.email?.split('@')[0] || 'User'}!</h2>
            <p className="profile-member-since">
              Member since {formatDate(userStats.accountCreated)}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="profile-stats">
          <div className="stat-card">
            <Shield size={24} color="#10B981" />
            <div>
              <h3>{userStats.checksPerformed}</h3>
              <p>Safety Checks</p>
            </div>
          </div>
          <div className="stat-card">
            <AlertTriangle size={24} color="#F59E0B" />
            <div>
              <h3>{userStats.reportsSubmitted}</h3>
              <p>Fraud Reports</p>
            </div>
          </div>
          <div className="stat-card">
            <Activity size={24} color="#3B82F6" />
            <div>
              <h3>{userStats.checksPerformed + userStats.reportsSubmitted}</h3>
              <p>Total Actions</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Settings
          </button>
          <button
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Account Security
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                disabled={true}
                style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                Email cannot be changed for security reasons
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Updating Profile...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Profile
                </>
              )}
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="security-tab">
            <div className="security-section">
              <h3 style={{ color: '#1F2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} color="#10B981" />
                Password Security
              </h3>
              <p style={{ color: '#4B5563', marginBottom: '1rem' }}>
                For your security, password changes are handled through a secure reset process.
              </p>
              <div className="security-info">
                <div className="security-item">
                  <CheckCircle size={16} color="#10B981" />
                  <span>Your password is encrypted and secure</span>
                </div>
                <div className="security-item">
                  <CheckCircle size={16} color="#10B981" />
                  <span>Account protected with secure authentication</span>
                </div>
                <div className="security-item">
                  <CheckCircle size={16} color="#10B981" />
                  <span>Regular security monitoring enabled</span>
                </div>
              </div>
              <div className="security-action">
                <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Need to change your password? Click the button below to receive a secure reset link via email.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleResetPassword}
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="security-section">
              <h3 style={{ color: '#1F2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="#3B82F6" />
                Account Activity
              </h3>
              <div className="activity-info">
                <div className="activity-item">
                  <span className="activity-label">Account Created:</span>
                  <span className="activity-value">{formatDate(userStats.accountCreated)}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Total Security Checks:</span>
                  <span className="activity-value">{userStats.checksPerformed}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Fraud Reports Submitted:</span>
                  <span className="activity-value">{userStats.reportsSubmitted}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="profile-actions">
          <button
            onClick={handleLogout}
            className="btn btn-secondary logout-btn"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Security Tips */}
      <div className="card">
        <h3 style={{ color: '#1F2937', marginBottom: '1rem' }}>🔒 Account Security Tips</h3>
        <ul style={{ color: '#4B5563', paddingLeft: '1.25rem' }}>
          <li>Use a strong, unique password for your account</li>
          <li>Never share your login credentials with anyone</li>
          <li>Log out from shared or public devices</li>
          <li>Report any suspicious activity immediately</li>
        </ul>
      </div>
      
      {/* Alert Popup */}
      <Alert
        isOpen={alert.isOpen}
        onClose={handleCloseAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        autoClose={true}
        autoCloseDelay={5000}
        showCloseButton={true}
      />
    </div>
  );
};

export default UserProfile;
