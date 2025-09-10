import React, { useState } from "react";

function Signup({ onSignup, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const demoUser = { email, displayName };
    localStorage.setItem("demoUser", JSON.stringify(demoUser));
    localStorage.setItem("demoUserLoggedIn", "true");
    onSignup(demoUser);
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>Create Account 🚀</h2>
        <p className="auth-subtitle">
          Join <strong>UPI Guard</strong> to stay protected
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

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

          <button type="submit" className="btn btn-primary w-full">
            Sign Up
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" className="link-btn" onClick={onSwitchToLogin}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
