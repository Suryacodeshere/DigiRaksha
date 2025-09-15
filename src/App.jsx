import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import cloudFraudDB from './services/cloudFraudDatabase';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import TopNavigation from './components/TopNavigation';
import UpiChecker from './components/UpiChecker';
import QrScanner from './components/QrScanner';
import FraudReporting from './components/FraudReporting';
import ChatSupport from './components/ChatSupport';
import PhoneChecker from './components/PhoneChecker';
import LinkChecker from './components/LinkChecker';
import UserProfile from './components/UserProfile';
import FraudDatabase from './components/FraudDatabase';
import AssistantWidget from './components/AssistantWidget';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', or 'forgot-password'
  const [activeComponent, setActiveComponent] = useState('upi-checker');

  useEffect(() => {
    // Initialize cloud fraud database
    const initializeApp = async () => {
      try {
        await cloudFraudDB.initialize();
        console.log('✅ Cloud fraud database initialized');
      } catch (error) {
        console.warn('⚠️ Cloud fraud database initialization failed, using local fallback');
      }
    };
    
    initializeApp();
    
    // Check for demo user first
    const demoUserLoggedIn = localStorage.getItem('demoUserLoggedIn');
    const storedDemoUser = localStorage.getItem('demoUser');
    
    if (demoUserLoggedIn === 'true' && storedDemoUser) {
      try {
        const demoUser = JSON.parse(storedDemoUser);
        setUser(demoUser);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Error loading demo user:', err);
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoUserLoggedIn');
      }
    }
    
    // Try Firebase authentication
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!demoUserLoggedIn) {
          setUser(user);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (firebaseError) {
      console.warn('Firebase not configured');
      setLoading(false);
    }
  }, []);

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleSignup = (user) => {
    setUser(user);
  };

  const handleLogout = () => {
    // Clear demo user data
    localStorage.removeItem('demoUser');
    localStorage.removeItem('demoUserLoggedIn');
    
    // Try Firebase signOut
    try {
      auth.signOut();
    } catch (error) {
      console.warn('Firebase not configured');
    }
    
    setUser(null);
    setActiveComponent('upi-checker');
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'upi-checker': return <UpiChecker user={user} />;
      case 'qr-scanner': return <QrScanner user={user} />;
      case 'phone-checker': return <PhoneChecker user={user} />;
      case 'link-checker': return <LinkChecker user={user} />;
      case 'fraud-reporting': return <FraudReporting user={user} />;
      case 'fraud-database': return <FraudDatabase user={user} />;
      case 'chat-support': return <ChatSupport user={user} />;
      case 'profile': return <UserProfile user={user} onLogout={handleLogout} />;
      default: return <UpiChecker user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <h2>Loading Digi Raksha...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        {authMode === 'login' ? (
          <Login 
            onLogin={handleLogin} 
            onSwitchToSignup={() => setAuthMode('signup')}
            onSwitchToForgotPassword={() => setAuthMode('forgot-password')}
          />
        ) : authMode === 'signup' ? (
          <Signup 
            onSignup={handleSignup} 
            onSwitchToLogin={() => setAuthMode('login')} 
          />
        ) : (
          <ForgotPassword 
            onBackToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <TopNavigation 
        activeComponent={activeComponent}
        onComponentChange={setActiveComponent}
        user={user}
      />
      
      <main className="app-content">
        {renderComponent()}
      </main>
      
      {/* UPI Security Assistant Widget - Show on all pages except support page */}
      {activeComponent !== 'chat-support' && <AssistantWidget user={user} />}
    </div>
  );
}

export default App;
