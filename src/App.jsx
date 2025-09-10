import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Login from './components/Login';
import Signup from './components/Signup';
import SlidingNavigation from './components/SlidingNavigation';
import UpiChecker from './components/UpiChecker';
import QrScanner from './components/QrScanner';
import FraudReporting from './components/FraudReporting';
import ChatSupport from './components/ChatSupport';
import PhoneChecker from './components/PhoneChecker';
import LinkChecker from './components/LinkChecker';
import UserProfile from './components/UserProfile';
import FraudDatabase from './components/FraudDatabase';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [activeComponent, setActiveComponent] = useState('upi-checker');

  useEffect(() => {
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
      case 'upi-checker': return <UpiChecker />;
      case 'qr-scanner': return <QrScanner />;
      case 'phone-checker': return <PhoneChecker />;
      case 'link-checker': return <LinkChecker />;
      case 'fraud-reporting': return <FraudReporting />;
      case 'fraud-database': return <FraudDatabase />;
      case 'chat-support': return <ChatSupport />;
      case 'profile': return <UserProfile user={user} onLogout={handleLogout} />;
      default: return <UpiChecker />;
    }
  };

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <h2>Loading UPI Guard...</h2>
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
          />
        ) : (
          <Signup 
            onSignup={handleSignup} 
            onSwitchToLogin={() => setAuthMode('login')} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛡️ UPI Guard</h1>
        <p>Stay Safe from UPI Fraud</p>
        <div className="user-info">
          Welcome, {user.displayName || user.email}!
        </div>
      </header>
      
      <div className="app-layout">
        <SlidingNavigation 
          activeComponent={activeComponent}
          onComponentChange={setActiveComponent}
        />
        
        <main className="app-content">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
}

export default App;
