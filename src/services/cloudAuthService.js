// Cloud User Authentication Service - Firebase Firestore Implementation
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Simple password hashing using Web Crypto API
class PasswordUtils {
  static async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async verifyPassword(password, hashedPassword) {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
  }
}

class CloudAuthService {
  constructor() {
    this.usersCollection = 'users';
    this.sessionsCollection = 'userSessions';
    
    // Fallback to local storage if Firebase is not available
    this.fallbackToLocal = false;
    this.localUsers = 'digiraksha_users';
    this.localCurrentUser = 'digiraksha_current_user';
  }

  // Initialize with fallback handling
  async initialize() {
    try {
      // Test Firebase connection
      await this.testFirebaseConnection();
      console.log('✅ Cloud authentication service connected');
      return true;
    } catch (error) {
      console.warn('⚠️ Firebase not available, using local storage fallback');
      this.fallbackToLocal = true;
      this.initializeLocalStorage();
      return false;
    }
  }

  // Test Firebase connection
  async testFirebaseConnection() {
    if (!db) throw new Error('Firebase not configured');
    
    // Try to read from users collection
    const testQuery = query(collection(db, this.usersCollection));
    await getDocs(testQuery);
  }

  // Initialize local storage fallback
  initializeLocalStorage() {
    if (!localStorage.getItem(this.localUsers)) {
      localStorage.setItem(this.localUsers, JSON.stringify({}));
    }
  }

  // Check if user exists by email
  async userExists(email) {
    const normalizedEmail = email.toLowerCase().trim();
    
    if (this.fallbackToLocal) {
      const users = JSON.parse(localStorage.getItem(this.localUsers) || '{}');
      return !!users[normalizedEmail];
    }

    try {
      const userDoc = doc(db, this.usersCollection, normalizedEmail);
      const docSnap = await getDoc(userDoc);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Register a new user
  async registerUser(userData) {
    const { email, password, fullName, phone } = userData;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const exists = await this.userExists(normalizedEmail);
    if (exists) {
      throw new Error('User already exists. Please login instead.');
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hashPassword(password);

    const newUser = {
      uid: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      email: normalizedEmail,
      hashedPassword,
      fullName,
      phone,
      createdAt: this.fallbackToLocal ? Date.now() : serverTimestamp(),
      lastLogin: null,
      isActive: true,
      loginCount: 0,
      profile: {
        avatar: null,
        preferences: {
          notifications: true,
          theme: 'light'
        }
      }
    };

    if (this.fallbackToLocal) {
      const users = JSON.parse(localStorage.getItem(this.localUsers) || '{}');
      users[normalizedEmail] = newUser;
      localStorage.setItem(this.localUsers, JSON.stringify(users));
    } else {
      try {
        const userDoc = doc(db, this.usersCollection, normalizedEmail);
        await setDoc(userDoc, newUser);
      } catch (error) {
        console.error('Error registering user:', error);
        throw new Error('Failed to register user. Please try again.');
      }
    }

    // Return user data without password
    const { hashedPassword: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Login user
  async loginUser(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    if (this.fallbackToLocal) {
      const users = JSON.parse(localStorage.getItem(this.localUsers) || '{}');
      const user = users[normalizedEmail];
      
      if (!user) {
        throw new Error('User not found. Please sign up first.');
      }

      const isValidPassword = await PasswordUtils.verifyPassword(password, user.hashedPassword);
      if (!isValidPassword) {
        throw new Error('Invalid password. Please try again.');
      }

      // Update login info
      user.lastLogin = Date.now();
      user.loginCount = (user.loginCount || 0) + 1;
      users[normalizedEmail] = user;
      localStorage.setItem(this.localUsers, JSON.stringify(users));
      localStorage.setItem(this.localCurrentUser, JSON.stringify(user));

      const { hashedPassword: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    try {
      const userDoc = doc(db, this.usersCollection, normalizedEmail);
      const docSnap = await getDoc(userDoc);

      if (!docSnap.exists()) {
        throw new Error('User not found. Please sign up first.');
      }

      const user = docSnap.data();
      
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }

      // Verify password
      const isValidPassword = await PasswordUtils.verifyPassword(password, user.hashedPassword);
      if (!isValidPassword) {
        throw new Error('Invalid password. Please try again.');
      }

      // Update login info
      await updateDoc(userDoc, {
        lastLogin: serverTimestamp(),
        loginCount: (user.loginCount || 0) + 1
      });

      // Create session record
      await this.createUserSession(user.uid, normalizedEmail);

      // Return user data without password
      const { hashedPassword: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error.message.includes('User not found') || error.message.includes('Invalid password')) {
        throw error;
      }
      console.error('Error logging in user:', error);
      throw new Error('Login failed. Please check your connection and try again.');
    }
  }

  // Create user session
  async createUserSession(uid, email) {
    if (this.fallbackToLocal) return;

    try {
      const sessionDoc = doc(collection(db, this.sessionsCollection));
      await setDoc(sessionDoc, {
        uid,
        email,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      });
    } catch (error) {
      console.warn('Could not create session record:', error);
    }
  }

  // Get current user
  async getCurrentUser() {
    if (this.fallbackToLocal) {
      const user = localStorage.getItem(this.localCurrentUser);
      return user ? JSON.parse(user) : null;
    }

    // For cloud implementation, this would typically use Firebase Auth
    // For now, return null as session management would be handled differently
    return null;
  }

  // Update user profile
  async updateUserProfile(email, profileUpdates) {
    const normalizedEmail = email.toLowerCase().trim();

    if (this.fallbackToLocal) {
      const users = JSON.parse(localStorage.getItem(this.localUsers) || '{}');
      if (users[normalizedEmail]) {
        users[normalizedEmail] = { ...users[normalizedEmail], ...profileUpdates };
        users[normalizedEmail].updatedAt = Date.now();
        localStorage.setItem(this.localUsers, JSON.stringify(users));
        
        // Update current user cache
        localStorage.setItem(this.localCurrentUser, JSON.stringify(users[normalizedEmail]));
        return users[normalizedEmail];
      }
      throw new Error('User not found');
    }

    try {
      const userDoc = doc(db, this.usersCollection, normalizedEmail);
      await updateDoc(userDoc, {
        ...profileUpdates,
        updatedAt: serverTimestamp()
      });

      // Get updated user data
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const { hashedPassword: _, ...userWithoutPassword } = docSnap.data();
        return userWithoutPassword;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  // Change password
  async changePassword(email, currentPassword, newPassword) {
    const normalizedEmail = email.toLowerCase().trim();

    // First verify current password by attempting login
    try {
      await this.loginUser(email, currentPassword);
    } catch (error) {
      throw new Error('Current password is incorrect.');
    }

    // Hash new password
    const hashedNewPassword = await PasswordUtils.hashPassword(newPassword);

    if (this.fallbackToLocal) {
      const users = JSON.parse(localStorage.getItem(this.localUsers) || '{}');
      if (users[normalizedEmail]) {
        users[normalizedEmail].hashedPassword = hashedNewPassword;
        users[normalizedEmail].passwordChangedAt = Date.now();
        localStorage.setItem(this.localUsers, JSON.stringify(users));
        return true;
      }
      throw new Error('User not found');
    }

    try {
      const userDoc = doc(db, this.usersCollection, normalizedEmail);
      await updateDoc(userDoc, {
        hashedPassword: hashedNewPassword,
        passwordChangedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Failed to change password. Please try again.');
    }
  }

  // Get user statistics
  async getUserStats() {
    if (this.fallbackToLocal) {
      const users = JSON.parse(localStorage.getItem(this.localUsers) || '{}');
      return {
        totalUsers: Object.keys(users).length,
        activeUsers: Object.values(users).filter(u => u.isActive).length
      };
    }

    try {
      const usersSnapshot = await getDocs(collection(db, this.usersCollection));
      let totalUsers = 0;
      let activeUsers = 0;

      usersSnapshot.forEach(doc => {
        totalUsers++;
        if (doc.data().isActive) {
          activeUsers++;
        }
      });

      return { totalUsers, activeUsers };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { totalUsers: 0, activeUsers: 0 };
    }
  }

  // Logout user
  async logoutUser() {
    if (this.fallbackToLocal) {
      localStorage.removeItem(this.localCurrentUser);
      return;
    }

    // For cloud implementation, this would invalidate sessions
    // For now, just clear local state
    return;
  }

  // Reset password (would typically send email)
  async resetPassword(email) {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const exists = await this.userExists(normalizedEmail);
    if (!exists) {
      throw new Error('No account found with this email address.');
    }

    // In a real implementation, this would send a password reset email
    // For now, we'll just return success
    console.log(`Password reset requested for: ${normalizedEmail}`);
    return {
      message: 'Password reset instructions would be sent to your email.',
      email: normalizedEmail
    };
  }

  // List all users (admin function)
  async getAllUsers() {
    if (this.fallbackToLocal) {
      const users = JSON.parse(localStorage.getItem(this.localUsers) || '{}');
      return Object.values(users).map(user => {
        const { hashedPassword: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    }

    try {
      const usersSnapshot = await getDocs(collection(db, this.usersCollection));
      const users = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const { hashedPassword: _, ...userWithoutPassword } = userData;
        users.push(userWithoutPassword);
      });

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to retrieve users.');
    }
  }
}

// Export singleton instance
export const cloudAuthService = new CloudAuthService();
export default cloudAuthService;