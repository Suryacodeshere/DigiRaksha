import React, { useState } from 'react';
import { 
  Shield, 
  Scan, 
  AlertTriangle, 
  MessageCircle, 
  Phone, 
  Link as LinkIcon,
  User,
  Database,
  Menu,
  X
} from 'lucide-react';

const TopNavigation = ({ activeComponent, onComponentChange, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { key: 'upi-checker', icon: Shield, label: 'UPI Check', color: '#10B981' },
    { key: 'qr-scanner', icon: Scan, label: 'QR Scanner', color: '#3B82F6' },
    { key: 'phone-checker', icon: Phone, label: 'Phone Check', color: '#8B5CF6' },
    { key: 'link-checker', icon: LinkIcon, label: 'Link Check', color: '#F59E0B' },
    { key: 'fraud-reporting', icon: AlertTriangle, label: 'Report Fraud', color: '#EF4444' },
    { key: 'fraud-database', icon: Database, label: 'Database', color: '#DC2626' },
    { key: 'chat-support', icon: MessageCircle, label: 'Support', color: '#06B6D4' },
    { key: 'profile', icon: User, label: 'Profile', color: '#6B7280' }
  ];

  const handleNavClick = (key) => {
    onComponentChange(key);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="top-navigation">
      <div className="nav-container">
        {/* App Branding */}
        <div className="nav-branding">
          <div className="nav-logo">
            <span className="nav-logo-icon">🛡️</span>
            <div className="nav-logo-text">
              <h1>Digi Raksha</h1>
              <p>Because Every Payment Matters</p>
            </div>
          </div>
          {user && (
            <button 
              className="nav-user-info clickable"
              onClick={() => handleNavClick('profile')}
              title="View Profile"
            >
              Welcome, {user.name || user.displayName || user.email}!
            </button>
          )}
        </div>
        
        {/* Desktop Navigation */}
        <div className="nav-desktop">
          {navigationItems.map(({ key, icon: Icon, label, color }) => {
            const isActive = activeComponent === key;
            return (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ 
                  '--item-color': color,
                }}
              >
                <Icon size={20} />
                <span>{label}</span>
                {isActive && <div className="active-indicator" style={{ backgroundColor: color }}></div>}
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="nav-mobile">
          <div className="mobile-header">
            <div className="mobile-branding">
              <span className="mobile-logo-icon">🛡️</span>
              <span className="mobile-logo-text">Digi Raksha</span>
            </div>
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {isMobileMenuOpen && (
            <div className="mobile-dropdown">
              {navigationItems.map(({ key, icon: Icon, label, color }) => {
                const isActive = activeComponent === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleNavClick(key)}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    style={{ 
                      '--item-color': color,
                    }}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;