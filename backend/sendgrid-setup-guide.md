# SendGrid Email Setup Guide

This guide will help you set up SendGrid for email verification in your investment platform.

## Why SendGrid?

- ✅ **More reliable** than Gmail for production applications
- ✅ **Higher sending limits** (100 emails/day free, 40k/month paid)
- ✅ **Better deliverability** and analytics
- ✅ **No 2FA or app password required**
- ✅ **Professional email service**

## Step 1: Create a SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com/)
2. Click **"Start for Free"**
3. Sign up with your email address
4. Verify your email address

## Step 2: Get Your API Key

1. **Log into SendGrid Dashboard**
2. Navigate to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Choose **"Restricted Access"**
5. Select **"Mail Send"** permissions
6. Click **"Create & View"**
7. **Copy the API key** (it starts with `SG.`)

## Step 3: Verify Your Sender Identity

1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in your details:
   - **From Name**: Your Name
   - **From Email**: your-email@yourdomain.com
   - **Reply To**: your-email@yourdomain.com
   - **Company**: Your Company Name
   - **Address**: Your Address
   - **City**: Your City
   - **Country**: Your Country
4. Click **"Create"**
5. **Check your email** and click the verification link

## Step 4: Update Your .env File

Replace the placeholder in your `.env` file:

```env
# Email Configuration - SendGrid SMTP
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=SG.your-actual-api-key-here
```

**Important**: Replace `SG.your-actual-api-key-here` with your actual SendGrid API key.

## Step 5: Test the Configuration

Run the test script to verify your setup:

```bash
node test-email.js
```

## Step 6: Restart Your Server

```bash
node server.js
```

## Expected Results

After setup, you should see:
- ✅ "Email configuration is valid" in server logs
- ✅ Successful email sending when users register
- ✅ Verification emails delivered to user inboxes

## Troubleshooting

### Common Issues:

1. **"Invalid API Key"**
   - Make sure you copied the full API key (starts with `SG.`)
   - Check that you have "Mail Send" permissions

2. **"Sender not verified"**
   - Complete the sender verification process
   - Wait a few minutes after verification

3. **"Rate limit exceeded"**
   - Free tier: 100 emails/day
   - Upgrade to paid plan for higher limits

### SendGrid Dashboard Features:

- **Activity**: See all sent emails
- **Analytics**: Track delivery rates
- **Suppression**: Manage bounced emails
- **Settings**: Configure webhooks, etc.

## Alternative: Mailgun Setup

If you prefer Mailgun instead:

```env
# Mailgun Configuration
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@yourdomain.mailgun.org
EMAIL_PASS=your-mailgun-password
```

## Security Notes

- ✅ API keys are more secure than passwords
- ✅ SendGrid handles authentication automatically
- ✅ No need to store email passwords
- ✅ Better for production environments

## Next Steps

1. **Update your `.env` file** with your SendGrid API key
2. **Restart the server**
3. **Test registration** with a new user
4. **Check email delivery** in SendGrid dashboard

## Support

- SendGrid Documentation: https://docs.sendgrid.com/
- SendGrid Support: https://support.sendgrid.com/
- API Reference: https://docs.sendgrid.com/api-reference/ 