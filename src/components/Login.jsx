import React, { useState } from 'react';

function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const demoUser = { email, displayName: email.split('@')[0] };
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    localStorage.setItem('demoUserLoggedIn', 'true');
    onLogin(demoUser);
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>Welcome Back 👋</h2>
        <p className="auth-subtitle">Login to continue to <strong>UPI Guard</strong></p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">Login</button>
        </form>

        <p className="auth-switch">
          Don’t have an account?{" "}
          <button type="button" className="link-btn" onClick={onSwitchToSignup}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
