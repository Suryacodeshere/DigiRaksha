import React from "react";

function UserProfile({ user, onLogout }) {
  return (
    <div className="card profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.displayName ? user.displayName[0].toUpperCase() : "U"}
        </div>
        <div className="profile-info">
          <h2>{user.displayName || "User"}</h2>
          <p>{user.email}</p>
        </div>
      </div>
      <button className="btn btn-danger" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default UserProfile;
