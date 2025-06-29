const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const { sendEmail, verifyEmailConfig } = require('../config/email');

// Initialize email verification
verifyEmailConfig();

// Generate verification code
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code) => {
  try {
    const subject = 'Welcome to Kings Invest - Complete Your Registration';
    const textContent = `Your verification code is: ${code}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Registration</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #d4af37;">
            <h1 style="color: #d4af37; margin: 0; font-size: 28px;">Kings Invest</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Kings Invest!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for creating your account. To complete your registration and start investing, please use the security code below:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 14px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">
                Your Security Code
              </p>
              <div style="background-color: #d4af37; color: #1a1a1a; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
              <p style="color: #999; font-size: 14px; margin-top: 15px;">
                This code will expire in 24 hours
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0;">
                <strong>🔒 Security Notice:</strong> Never share this code with anyone. Kings Invest will never ask for this code via phone or email.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              <strong>The Kings Invest Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail(email, subject, htmlContent, textContent);
    if (result.success) {
      console.log('✅ Verification email sent successfully:', result.messageId);
      return true;
    } else {
      console.error('❌ Verification email failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

// Generic email sending function
const sendEmailLegacy = async (email, subject, htmlContent) => {
  try {
    const textContent = htmlContent.replace(/<[^>]*>/g, ''); // Strip HTML for text version
    const result = await sendEmail(email, subject, htmlContent, textContent);
    return result.success;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, country, currency, phone, role } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !country || !currency || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate phone number format
    const phoneRegex = /^[0-9\-\+\s]+$/;
    if (!phoneRegex.test(phone) || phone.length < 7 || phone.length > 20) {
      return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate email confirmation code
    const emailConfirmationCode = generateVerificationCode();
    const emailConfirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user = new User({ 
      email, 
      password: hashedPassword, 
      firstName, 
      lastName, 
      country, 
      currency, 
      phone, 
      role,
      emailConfirmationCode,
      emailConfirmationExpires,
      registrationIP: req.ip || req.connection.remoteAddress,
      isActive: false
    });
    
    await user.save();

    // Send verification email
    try {
      const result = await sendVerificationEmail(email, emailConfirmationCode);
      if (!result) {
        throw new Error('Email sending failed');
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      console.error('Full email error:', emailError);
      // Don't fail registration if email fails, but log it
    }

    res.status(201).json({ 
      message: 'Account created successfully! Please check your email to verify your account.',
      requiresVerification: true
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors 
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ 
        message: `An account with this ${field} already exists` 
      });
    }
    
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Email verification endpoint
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailConfirmed) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.emailConfirmationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > user.emailConfirmationExpires) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Mark email as confirmed and activate account
    user.emailConfirmed = true;
    user.isActive = true;
    user.emailConfirmationCode = undefined;
    user.emailConfirmationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! Your account is now active.' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailConfirmed) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification code
    const emailConfirmationCode = generateVerificationCode();
    const emailConfirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailConfirmationCode = emailConfirmationCode;
    user.emailConfirmationExpires = emailConfirmationExpires;
    await user.save();

    // Send new verification email
    try {
      const result = await sendVerificationEmail(email, emailConfirmationCode);
      if (!result) {
        throw new Error('Email sending failed');
      }
      res.json({ message: 'Verification email sent successfully' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, admin } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (admin && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not an admin user' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if email is verified
    if (!user.emailConfirmed && user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Please verify your email address before logging in',
        requiresVerification: true 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Your account is not active. Please contact support.',
        accountInactive: true 
      });
    }

    // Update last login date
    user.lastLoginDate = new Date();
    await user.save();

    // 2FA check will go here

    const payload = {
      userId: user._id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, id: user._id, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = speakeasy.generateSecret({ name: `ForexCrypto (${user.email})` });
    user.twoFASecret = secret.base32;
    await user.save();

    // Generate QR code data URL
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ message: 'QR code generation failed' });
      res.json({ otpauth_url: secret.otpauth_url, qr: data_url, secret: secret.base32 });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user || !user.twoFASecret) return res.status(400).json({ message: '2FA not set up' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) return res.status(400).json({ message: 'Invalid 2FA code' });

    user.is2FAEnabled = true;
    await user.save();
    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.validate2FA = async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.twoFASecret) return res.status(400).json({ message: '2FA not set up' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) return res.status(400).json({ message: 'Invalid 2FA code' });

    // Issue JWT after successful 2FA validation
    const payload = {
      userId: user._id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: jwtToken, user: { email: user.email, id: user._id } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

// Admin login as user
exports.adminLoginAsUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Verify the current user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Find the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a token for the target user (admin impersonation)
    const payload = {
      userId: targetUser._id,
      role: targetUser.role,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      adminImpersonation: true, // Flag to indicate this is admin impersonation
      originalAdminId: req.user.userId // Store the original admin's ID
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Shorter expiry for impersonation
    
    res.json({ 
      token, 
      user: { 
        email: targetUser.email, 
        id: targetUser._id, 
        role: targetUser.role,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName
      },
      impersonation: true
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Forgot password - send reset link
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email address not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Store reset token in user document
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    await user.save();

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'https://kenttito.github.io/king-invest';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    // Debug log
    console.log('🔗 Generated reset URL:', resetUrl);
    console.log('🔗 FRONTEND_URL env var:', process.env.FRONTEND_URL || 'NOT SET');
    console.log('🔗 Using frontend URL:', frontendUrl);

    // Send email with reset link
    try {
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #d4af37;">
              <h1 style="color: #d4af37; margin: 0; font-size: 28px;">Invest Platform</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Hello ${user.firstName},
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                You have requested to reset your password for your Invest Platform account. 
                Click the button below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background-color: #d4af37; color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                  Reset Password
                </a>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                  <strong>If the button above doesn't work, copy and paste this link into your browser:</strong>
                </p>
                <p style="word-break: break-all; color: #d4af37; font-size: 14px; background-color: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
                  ${resetUrl}
                </p>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for security reasons. 
                  If you didn't request this password reset, please ignore this email.
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                <strong>Invest Platform Team</strong>
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await sendEmailLegacy(user.email, 'Password Reset Request - Invest Platform', emailContent);
      if (!result) {
        throw new Error('Email sending failed');
      }

      res.json({ message: 'Password reset link sent to your email address' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Clear the reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Validate reset password token
exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with this token
    const user = await User.findOne({
      _id: decoded.userId,
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.json({ message: 'Token is valid' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    console.error('Validate reset token error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with this token
    const user = await User.findOne({
      _id: decoded.userId,
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 