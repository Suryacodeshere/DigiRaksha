// Email service for DigiRaksha password reset functionality
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

class EmailService {
  constructor() {
    // Demo email service configuration
    this.demoMode = true;
    this.resetTokens = new Map(); // Store reset tokens in memory for demo
    this.emailQueue = [];
  }

  // Generate secure reset token
  generateResetToken(email) {
    const token = this.generateRandomToken();
    const expiry = Date.now() + (60 * 60 * 1000); // 1 hour expiry
    
    this.resetTokens.set(token, {
      email,
      expiry,
      used: false
    });
    
    return token;
  }

  // Generate random token
  generateRandomToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Send password reset email
  async sendPasswordResetEmail(email) {
    try {
      // Try Firebase password reset first
      if (!this.demoMode) {
        await sendPasswordResetEmail(auth, email);
        console.log('✅ Firebase password reset email sent to:', email);
        return {
          success: true,
          message: 'Password reset email sent successfully',
          method: 'firebase'
        };
      }

      // Demo mode - simulate email sending
      const resetToken = this.generateResetToken(email);
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
      
      // Simulate email content
      const emailContent = {
        to: email,
        subject: '🛡️ DigiRaksha - Password Reset Request',
        html: this.generateEmailHTML(email, resetLink, resetToken),
        timestamp: new Date().toISOString(),
        resetToken,
        resetLink
      };

      // Store in demo queue
      this.emailQueue.push(emailContent);
      
      // Simulate successful email sending
      console.log('📧 Demo email sent to:', email);
      console.log('🔗 Reset link:', resetLink);
      console.log('🎟️ Reset token:', resetToken);
      
      // In a real implementation, you would use a service like:
      // - SendGrid
      // - AWS SES
      // - Nodemailer with SMTP
      // - EmailJS for client-side sending
      
      return {
        success: true,
        message: 'Password reset email sent successfully',
        method: 'demo',
        resetToken, // Only for demo purposes
        resetLink, // Only for demo purposes
        emailContent // Only for demo purposes
      };
      
    } catch (error) {
      console.error('Error sending password reset email:', error);
      
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again.',
        error: error.message
      };
    }
  }

  // Generate email HTML template
  generateEmailHTML(email, resetLink, token) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DigiRaksha - Password Reset</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 2rem; text-align: center; }
        .content { padding: 2rem; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 0.5rem; font-weight: 600; margin: 1rem 0; }
        .footer { background: #f1f5f9; padding: 1rem; text-align: center; color: #64748b; font-size: 0.875rem; }
        .security-info { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .token-info { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; font-family: monospace; font-size: 0.875rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ DigiRaksha</h1>
            <h2>Password Reset Request</h2>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            
            <p>We received a request to reset the password for your DigiRaksha account associated with <strong>${email}</strong>.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 2rem 0;">
                <a href="${resetLink}" class="button">Reset Your Password</a>
            </div>
            
            <div class="security-info">
                <h4>🔒 Security Information:</h4>
                <ul>
                    <li>This link will expire in 1 hour for security reasons</li>
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>Your password will not be changed until you click the link and complete the process</li>
                </ul>
            </div>
            
            <div class="token-info">
                <h4>🎟️ Demo Information:</h4>
                <p><strong>Reset Token:</strong> ${token}</p>
                <p><strong>Reset Link:</strong> ${resetLink}</p>
                <p><em>This is a demo environment. In production, these details would not be visible.</em></p>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetLink}</p>
            
            <p>For security reasons, this link will only work once and will expire in 1 hour.</p>
            
            <p>If you have any questions or concerns, please contact our support team.</p>
            
            <p>Best regards,<br>The DigiRaksha Team</p>
        </div>
        
        <div class="footer">
            <p>© 2024 DigiRaksha. All rights reserved.</p>
            <p>This email was sent to ${email}. If you received this in error, please ignore it.</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Validate reset token
  validateResetToken(token) {
    const tokenData = this.resetTokens.get(token);
    
    if (!tokenData) {
      return { valid: false, reason: 'Invalid token' };
    }
    
    if (tokenData.used) {
      return { valid: false, reason: 'Token already used' };
    }
    
    if (Date.now() > tokenData.expiry) {
      return { valid: false, reason: 'Token expired' };
    }
    
    return { valid: true, email: tokenData.email };
  }

  // Mark token as used
  useResetToken(token) {
    const tokenData = this.resetTokens.get(token);
    if (tokenData) {
      tokenData.used = true;
      this.resetTokens.set(token, tokenData);
    }
  }

  // Get demo email queue (for testing)
  getDemoEmails() {
    return this.emailQueue;
  }

  // Clear demo data
  clearDemoData() {
    this.emailQueue = [];
    this.resetTokens.clear();
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;
export { EmailService };