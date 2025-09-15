// User Database Service - Manages registered users in localStorage
class UserDatabase {
  constructor() {
    this.usersKey = 'digi-raksha-users';
    this.initializeDatabase();
  }

  // Initialize users database
  initializeDatabase() {
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify({}));
    }
  }

  // Register a new user
  registerUser(userData) {
    const users = this.getAllUsers();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Check if email already exists
    const existingUser = Object.values(users).find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const newUser = {
      uid: userId,
      name: userData.name.trim(),
      email: userData.email.toLowerCase(),
      password: this.hashPassword(userData.password), // Simple hash for demo
      createdAt: Date.now(),
      lastLogin: null
    };

    users[userId] = newUser;
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    
    // Return user without password for security
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Authenticate user login
  authenticateUser(email, password) {
    const users = this.getAllUsers();
    const user = Object.values(users).find(user => user.email === email.toLowerCase());
    
    if (!user) {
      throw new Error('No account found with this email');
    }

    if (!this.verifyPassword(password, user.password)) {
      throw new Error('Incorrect password');
    }

    // Update last login
    user.lastLogin = Date.now();
    users[user.uid] = user;
    localStorage.setItem(this.usersKey, JSON.stringify(users));

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Get all users (for admin purposes)
  getAllUsers() {
    return JSON.parse(localStorage.getItem(this.usersKey) || '{}');
  }

  // Check if email exists
  emailExists(email) {
    const users = this.getAllUsers();
    return Object.values(users).some(user => user.email === email.toLowerCase());
  }

  // Get user by email
  getUserByEmail(email) {
    const users = this.getAllUsers();
    const user = Object.values(users).find(user => user.email === email.toLowerCase());
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  // Update user password
  updateUserPassword(email, newPassword) {
    const users = this.getAllUsers();
    const userEntry = Object.entries(users).find(([uid, user]) => user.email === email.toLowerCase());
    
    if (!userEntry) {
      throw new Error('User not found');
    }

    const [userId, user] = userEntry;
    user.password = this.hashPassword(newPassword);
    user.updatedAt = Date.now();
    
    users[userId] = user;
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    
    return true;
  }

  // Update user profile
  updateUser(email, userData) {
    const users = this.getAllUsers();
    const userEntry = Object.entries(users).find(([uid, user]) => user.email === email.toLowerCase());
    
    if (!userEntry) {
      throw new Error('User not found');
    }

    const [userId, user] = userEntry;
    
    // Update allowed fields
    if (userData.displayName !== undefined) {
      user.name = userData.displayName;
    }
    if (userData.updatedAt !== undefined) {
      user.updatedAt = userData.updatedAt;
    }
    
    users[userId] = user;
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Simple password hashing (for demo - use proper hashing in production)
  hashPassword(password) {
    // Simple hash for demo purposes - in production, use bcrypt or similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Verify password
  verifyPassword(inputPassword, hashedPassword) {
    return this.hashPassword(inputPassword) === hashedPassword;
  }

  // Get user statistics
  getUserStats() {
    const users = this.getAllUsers();
    const userCount = Object.keys(users).length;
    const recentUsers = Object.values(users)
      .filter(user => user.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .length;
    
    return {
      totalUsers: userCount,
      recentRegistrations: recentUsers
    };
  }
}

// Export singleton instance
export const userDB = new UserDatabase();
export default userDB;
