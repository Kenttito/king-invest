# Authentication System Setup Guide

This guide explains how to set up the enhanced authentication system for your Invest Platform to prevent unauthorized registrations.

## 🔐 Authentication Features Implemented

### 1. **Email Verification System**
- Users must verify their email address after registration
- 6-character verification codes sent via email
- 24-hour expiration for verification codes
- Resend verification functionality

### 2. **Admin Approval System**
- All new users require admin approval after email verification
- Admins can approve or reject user accounts
- Users cannot log in until approved by admin

### 3. **Account Status Tracking**
- `emailConfirmed`: Email verification status
- `isActive`: Account activation status
- `isApproved`: Admin approval status
- Registration metadata (IP, date, etc.)

## 📧 Email Configuration

### For Gmail:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Set environment variables:
   ```bash
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### For Other Email Services:
```bash
EMAIL_SERVICE=outlook
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install nodemailer
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/invest_platform

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5001
NODE_ENV=development
```

### 3. Start the Servers
```bash
# Backend
cd backend
node server.js

# Frontend (in another terminal)
cd frontend
npm start
```

## 🔄 User Registration Flow

1. **User Registration**
   - User fills out registration form
   - Account created with `emailConfirmed: false`, `isActive: false`, `isApproved: false`
   - Verification email sent automatically

2. **Email Verification**
   - User receives email with 6-character verification code
   - User enters code on `/verify-email` page
   - Account updated: `emailConfirmed: true`, `isActive: true`

3. **Admin Approval**
   - User account appears in admin dashboard for approval
   - Admin can approve or reject the account
   - Only approved users can log in

4. **Login Access**
   - User can only log in after email verification AND admin approval
   - System checks all status flags before allowing login

## 👨‍💼 Admin Functions

### View Pending Users
```http
GET /api/admin/users/pending
```

### Approve User
```http
PUT /api/admin/users/:userId/approve
```

### Reject User
```http
PUT /api/admin/users/:userId/reject
```

### Get User Statistics
```http
GET /api/admin/users/stats
```

## 🛡️ Security Benefits

1. **Prevents Fake Registrations**: Email verification ensures real email addresses
2. **Admin Control**: Manual approval prevents unauthorized access
3. **Account Tracking**: Full audit trail of registration process
4. **IP Logging**: Registration IP addresses are recorded
5. **Status Management**: Clear account status tracking

## 🔧 Customization Options

### Disable Admin Approval (Email Verification Only)
Update the login function in `backend/controllers/authController.js`:
```javascript
// Comment out or remove this check
// if (user.role === 'user' && !user.isApproved) {
//   return res.status(403).json({ 
//     message: 'Your account is pending approval. Please wait for admin approval.',
//     pendingApproval: true 
//   });
// }
```

### Disable Email Verification (Admin Approval Only)
Update the registration function:
```javascript
// Set emailConfirmed to true by default
user.emailConfirmed = true;
user.isActive = true;
```

### Add Phone Verification
1. Integrate SMS service (Twilio, etc.)
2. Add phone verification fields to User model
3. Create phone verification endpoints
4. Update registration flow

### Add CAPTCHA
1. Install reCAPTCHA or similar service
2. Add CAPTCHA verification to registration form
3. Verify CAPTCHA response on backend

## 🐛 Troubleshooting

### Email Not Sending
1. Check email credentials in `.env`
2. Verify Gmail App Password is correct
3. Check if 2FA is enabled on Gmail
4. Review email service logs

### Verification Code Issues
1. Check code expiration (24 hours)
2. Verify code format (6 characters, uppercase)
3. Check email delivery

### Admin Approval Issues
1. Ensure admin role is set correctly
2. Check admin authentication middleware
3. Verify admin routes are accessible

## 📞 Support

For issues or questions about the authentication system, check:
1. Backend console logs for errors
2. Frontend browser console for API errors
3. Email service configuration
4. Database connection status 