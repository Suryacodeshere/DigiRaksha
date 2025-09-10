import React from "react";

function SlidingNavigation({ activeComponent, onComponentChange }) {
  const navItems = [
    { key: "upi-checker", label: "UPI Checker" },
    { key: "qr-scanner", label: "QR Scanner" },
    { key: "phone-checker", label: "Phone Checker" },
    { key: "link-checker", label: "Link Checker" },
    { key: "fraud-reporting", label: "Report Fraud" },
    { key: "fraud-database", label: "Fraud Database" },
    { key: "chat-support", label: "Chat Support" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <nav className="sliding-nav">
      <div className="nav-content">
        <div className="nav-header">
          <h3>UPI Guard</h3>
          <p>Stay Safe 🔒</p>
        </div>
        <div className="nav-items">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${
                activeComponent === item.key ? "active" : ""
              }`}
              onClick={() => onComponentChange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default SlidingNavigation;
