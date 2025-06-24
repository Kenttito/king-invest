# SendGrid Email Troubleshooting Guide

## Current Status
✅ API Key Format: Correct (69 characters, starts with SG.)  
❌ Connection: Timeout error  
🔍 Issue: Network connectivity or invalid API key  

## Step-by-Step Fix

### 1. Verify Your SendGrid API Key

1. **Go to SendGrid Dashboard**: https://app.sendgrid.com/
2. **Navigate to**: Settings → API Keys
3. **Check your API key**:
   - Should start with `SG.`
   - Should be about 69 characters long
   - Should have "Mail Send" permissions
   - Should be "Full Access" or "Restricted Access" with Mail Send enabled

### 2. Test API Key Validity

You can test your API key directly with SendGrid's API:

```bash
curl -X GET \
  https://api.sendgrid.com/v3/user/profile \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

Replace `YOUR_API_KEY_HERE` with your actual API key (without the `SG.` prefix).

### 3. Update Your .env File

Your current `.env` file has some issues. Update it with this correct format:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/forexcrypto

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration - SendGrid
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=SG.your_actual_api_key_here
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false

# Admin Configuration
ADMIN_EMAIL=admin@yourplatform.com
ADMIN_PASSWORD=admin123

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 4. Verify Sender Authentication

1. **Go to SendGrid Dashboard**: Settings → Sender Authentication
2. **Domain Authentication**: Verify your domain (recommended)
3. **Single Sender Verification**: Verify individual email addresses
4. **Update your code** to use a verified sender:

```javascript
const mailOptions = {
  from: 'your-verified-email@yourdomain.com',  // Must be verified
  to: email,
  subject: 'Test Email',
  html: '<h1>Test</h1>'
};
```

### 5. Network Troubleshooting

If you're still getting timeout errors:

1. **Check your internet connection**
2. **Try a different network** (mobile hotspot, etc.)
3. **Check firewall settings** - port 587 should be open
4. **Try using port 2525** as an alternative:

```env
EMAIL_PORT=2525
```

### 6. Alternative: Use SendGrid Web API

If SMTP continues to fail, you can use SendGrid's Web API instead:

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.EMAIL_PASS);

const msg = {
  to: 'recipient@example.com',
  from: 'your-verified-sender@yourdomain.com',
  subject: 'Test Email',
  text: 'Test email content',
  html: '<h1>Test</h1>',
};

sgMail.send(msg)
  .then(() => console.log('Email sent'))
  .catch((error) => console.error(error));
```

### 7. Test Commands

After making changes, test with:

```bash
# Test current configuration
node test-sendgrid-simple.js

# Test with main email script
node test-email.js

# Test server startup
node server.js
```

### 8. Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Connection timeout | Check network, try different port (2525) |
| Authentication failed | Verify API key, check permissions |
| Sender not verified | Verify sender email in SendGrid dashboard |
| Domain not authenticated | Set up domain authentication |
| Rate limiting | Check SendGrid account limits |

### 9. SendGrid Account Status

- **Free Tier**: 100 emails/day
- **Paid Plans**: Higher limits
- **Check your usage**: Dashboard → Activity → Email Activity

### 10. Emergency Fallback

If SendGrid continues to fail, you can temporarily disable email verification:

```javascript
// In authController.js, comment out email sending
// await transporter.sendMail(mailOptions);
```

## Next Steps

1. **Verify your API key** in SendGrid dashboard
2. **Update your .env file** with correct format
3. **Verify sender email** in SendGrid
4. **Test connection** with the provided scripts
5. **Check network connectivity** if timeouts persist

## Support

- **SendGrid Support**: https://support.sendgrid.com/
- **API Documentation**: https://sendgrid.com/docs/
- **Status Page**: https://status.sendgrid.com/ 