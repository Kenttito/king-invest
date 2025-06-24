# Outlook Email Setup Guide

This guide will help you configure Outlook/Hotmail as your email service provider for the Invest Platform.

## Step 1: Create a .env file

Create a `.env` file in the `backend` directory with the following configuration:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/forexcrypto

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration - Outlook/Hotmail
EMAIL_SERVICE=outlook
EMAIL_USER=your-outlook-email@outlook.com
EMAIL_PASS=your-outlook-app-password
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Admin Configuration
ADMIN_EMAIL=admin@yourplatform.com
ADMIN_PASSWORD=admin123

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Step 2: Get Outlook App Password

### For Outlook.com/Hotmail:

1. **Enable 2-Factor Authentication:**
   - Go to https://account.microsoft.com/security
   - Sign in with your Outlook account
   - Go to "Security" → "Advanced security options"
   - Turn on "Two-step verification"

2. **Generate App Password:**
   - After enabling 2FA, go to "App passwords"
   - Click "Create a new app password"
   - Give it a name like "Invest Platform"
   - Copy the generated 16-character password

3. **Update .env file:**
   - Replace `your-outlook-email@outlook.com` with your actual Outlook email
   - Replace `your-outlook-app-password` with the app password you just generated

### For Office 365/Outlook:

1. **Enable Modern Authentication:**
   - Contact your IT administrator to ensure modern authentication is enabled
   - Or use app passwords if available

2. **Use App Password:**
   - Follow the same steps as above for generating app passwords

## Step 3: Alternative Configuration Options

### Option 1: Using Service Configuration
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
```

### Option 2: Using Custom SMTP Settings
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
```

### Option 3: Using Office 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@office365.com
EMAIL_PASS=your-app-password
```

## Step 4: Test Email Configuration

Run the test script to verify your email configuration:

```bash
cd backend
node test-email.js
```

## Step 5: Common Issues and Solutions

### Issue: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:**
- Make sure you're using an app password, not your regular password
- Ensure 2-factor authentication is enabled
- Check that your email address is correct

### Issue: "Connection timeout"

**Solution:**
- Check your internet connection
- Verify the SMTP settings are correct
- Try using port 587 instead of 465

### Issue: "Authentication failed"

**Solution:**
- Double-check your app password
- Make sure you're not using your regular account password
- Verify that app passwords are enabled for your account

## Step 6: Security Best Practices

1. **Never commit .env files to version control**
2. **Use strong, unique app passwords**
3. **Regularly rotate app passwords**
4. **Monitor email sending logs**
5. **Use environment-specific configurations**

## Step 7: Restart the Server

After updating your `.env` file:

```bash
cd backend
node server.js
```

## Troubleshooting

If you continue to have issues:

1. **Check the server logs** for specific error messages
2. **Verify your Outlook account settings**
3. **Test with a different email client** to ensure your account works
4. **Contact Microsoft support** if you can't generate app passwords

## Alternative Email Services

If Outlook doesn't work for you, consider these alternatives:

- **Gmail** (with app passwords)
- **SendGrid** (recommended for production)
- **Mailgun**
- **Amazon SES**

Each has their own setup guide available in the `backend` directory. 