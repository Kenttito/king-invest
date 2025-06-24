# Email Verification Setup Guide

This guide will help you configure email verification for your investment platform using various email providers.

## Quick Setup Options

### Option 1: Gmail (Recommended for testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to [Google Account settings](https://myaccount.google.com/)
   - Navigate to **Security** → **2-Step Verification** → **App passwords**
   - Select **"Mail"** and **"Other (Custom name)"**
   - Enter **"Invest Platform"** as the name
   - Copy the 16-character password

3. **Update your `.env` file**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### Option 2: Outlook/Hotmail

1. **Enable 2-Factor Authentication** on your Outlook account
2. **Generate an App Password**:
   - Go to [Microsoft Account security](https://account.microsoft.com/security)
   - Navigate to **Security** → **Advanced security options** → **App passwords**
   - Generate a new app password

3. **Update your `.env` file**:
   ```env
   EMAIL_SERVICE=outlook
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASS=your-app-password
   ```

### Option 3: Yahoo Mail

1. **Enable 2-Factor Authentication** on your Yahoo account
2. **Generate an App Password**:
   - Go to [Yahoo Account security](https://login.yahoo.com/account/security)
   - Navigate to **Account security** → **Generate app password**

3. **Update your `.env` file**:
   ```env
   EMAIL_SERVICE=yahoo
   EMAIL_USER=your-email@yahoo.com
   EMAIL_PASS=your-app-password
   ```

### Option 4: Custom SMTP (SendGrid, Mailgun, etc.)

#### SendGrid Example:
1. **Create a SendGrid account** at [sendgrid.com](https://sendgrid.com)
2. **Generate an API key**:
   - Go to **Settings** → **API Keys**
   - Create a new API key with **Mail Send** permissions

3. **Update your `.env` file**:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   ```

#### Mailgun Example:
1. **Create a Mailgun account** at [mailgun.com](https://mailgun.com)
2. **Get your SMTP credentials**:
   - Go to **Sending** → **Domains** → **Your Domain** → **SMTP credentials**

3. **Update your `.env` file**:
   ```env
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-mailgun-username
   EMAIL_PASS=your-mailgun-password
   ```

## Testing Your Email Configuration

After updating your `.env` file, restart the server and test:

```bash
cd backend
node server.js
```

You should see:
- ✅ "Email configuration is valid" - if setup is correct
- ❌ "Email configuration error" - if there are issues

## Troubleshooting

### Common Issues:

1. **"Invalid login" errors**:
   - Make sure you're using an app password, not your regular password
   - Verify 2-factor authentication is enabled
   - Check that the email and password are correct

2. **"Missing credentials" errors**:
   - Ensure your `.env` file is in the `backend` directory
   - Check that `EMAIL_USER` and `EMAIL_PASS` are set
   - Restart the server after making changes

3. **"Connection timeout" errors**:
   - Check your internet connection
   - Verify the SMTP host and port are correct
   - Try a different email provider

### Security Notes:

- Never commit your `.env` file to version control
- Use app passwords instead of regular passwords
- Consider using environment variables in production
- Regularly rotate your email credentials

## Production Recommendations

For production use, consider:
- Using a dedicated email service (SendGrid, Mailgun, AWS SES)
- Setting up proper SPF, DKIM, and DMARC records
- Implementing email rate limiting
- Using environment variables for all sensitive data 