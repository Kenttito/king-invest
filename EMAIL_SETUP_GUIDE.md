# Email Setup Guide for Invest Platform

## Problem
You're not receiving verification emails because the email configuration is not properly set up.

## Solution

### Step 1: Create Environment Variables File

Create a `.env` file in the `backend` folder with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/forexcrypto

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5001
NODE_ENV=development
```

### Step 2: Set Up Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Navigate to Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "Invest Platform" as the name
   - Copy the generated 16-character password

3. **Update your .env file**:
   - Replace `your-email@gmail.com` with your actual Gmail address
   - Replace `your-app-password` with the 16-character app password

### Step 3: Restart the Server

After updating the `.env` file, restart your backend server:

```bash
cd backend
node server.js
```

### Step 4: Test Email Configuration

The server will now log email configuration status:
- ✅ "Email configuration is valid" - Email is properly configured
- ❌ "Email configuration error: ..." - Check your credentials

### Alternative: Use a Different Email Service

If you prefer not to use Gmail, you can use other services:

#### Option A: Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Option B: Yahoo
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### Option C: Custom SMTP Server
Update the transporter configuration in `backend/controllers/authController.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Troubleshooting

1. **"Email configuration error"**:
   - Check if your Gmail credentials are correct
   - Ensure 2FA is enabled and app password is generated
   - Verify the app password is copied correctly

2. **"Email sending failed"**:
   - Check server logs for specific error messages
   - Ensure your Gmail account allows "less secure app access" or use app passwords
   - Check if your email is in spam folder

3. **Emails not received**:
   - Check spam/junk folder
   - Verify the email address is correct
   - Wait a few minutes as emails can be delayed

### Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of your main Gmail password
- Regularly rotate your app passwords
- Consider using environment-specific email services for production

### Testing

After setup, try registering a new user and check:
1. Server logs for email sending confirmation
2. Your email inbox (and spam folder) for the verification code
3. The verification code format (6-character hexadecimal)

If you still have issues, check the server console output for specific error messages. 