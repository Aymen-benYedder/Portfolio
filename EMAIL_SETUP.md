# Contact Form Email Setup Guide

## Overview
The portfolio contact form has been upgraded with two email handling options:

### Option 1: PHP Backend (Recommended for Simple Hosting)
**Location:** `/api/send-email.php`

**Features:**
- Uses PHP's built-in `mail()` function
- No dependencies required
- Works on most shared hosting
- Automatic fallback to email client

**Setup:**
1. Ensure PHP is installed on your server
2. The form will automatically POST to `/api/send-email.php`
3. Configure your mail server settings in your hosting provider

**Environment:**
- Hosting: Shared hosting, VPS, or Dedicated servers with PHP
- No configuration needed - uses server's PHP mail()

---

### Option 2: Node.js Express Backend (Recommended for Modern Stack)
**Location:** `/backend/email-server.js`

**Features:**
- Uses Nodemailer for reliable email delivery
- Supports Gmail, SendGrid, and other SMTP services
- Better error handling and logging
- Production-ready

**Setup:**

1. **Install dependencies:**
   ```bash
   cd backend
   npm install express nodemailer body-parser cors
   ```

2. **Set environment variables:**
   ```bash
   # Create .env file in backend directory
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   PORT=3001
   ```

3. **For Gmail:**
   - Enable "Less secure app access" OR
   - Use an App Password (recommended):
     - Go to https://myaccount.google.com/apppasswords
     - Generate an app-specific password
     - Use this instead of your Gmail password

4. **Start the server:**
   ```bash
   node email-server.js
   ```

5. **Update frontend (index.html):**
   - Currently set to `/api/send-email.php`
   - Change to `/api/send-email` in `js/main.js` if using Node.js backend

---

## Frontend JavaScript Implementation

**File:** `/js/main.js` (lines 138-201)

**Features:**
- Validates form data before submission
- Shows "Sending..." status
- Displays success message ("✓ Message Sent!")
- Automatic fallback to mailto: if server fails
- Email client fallback with pre-filled data

**Form Fields:**
- Full Name (required)
- Email Address (required, validated)
- Project Type (required, dropdown)
- Project Details (required, textarea)

---

## HTML Structure

**File:** `/index.html` (lines 829-900)

**Key Elements:**
- Contact form with ID `#contact-form`
- Submit button with visual feedback
- Mobile contact options (WhatsApp + Call)
- Email fallback link
- All form fields properly labeled

---

## CSS Styling

**File:** `/css/components.css` (lines 1224-1283)

**Button Enhancements:**
- Gradient backgrounds
- Smooth hover animations
- Box shadows for depth
- Better spacing and typography
- Responsive design (mobile-first)

**Mobile Contact Buttons:**
- WhatsApp: Green gradient (#25d366 → #1fa855)
- Call: Blue gradient (#007AFF → #0051d5)
- Icon + text layout
- Touch-friendly sizing

---

## Testing

### Local Testing (Static Fallback):
1. Open contact form
2. Fill in all fields
3. Click "Send Message"
4. Should open your default email client with:
   - To: aymen.ben.yedder@mail.com
   - Subject: Portfolio Inquiry: [Project Type]
   - Body: Pre-filled with message and sender info

### With PHP Backend:
1. Ensure PHP is running
2. Check `/api/send-email.php` exists
3. Form should send directly without opening email client

### With Node.js Backend:
1. Start server: `node backend/email-server.js`
2. Update form endpoint in `js/main.js` (line 172)
3. Form should send via Node.js backend

---

## Troubleshooting

**Issue:** Form shows "Open Email Client" message
- **Cause:** Backend endpoint not responding
- **Solution:** Check backend server is running or use PHP option

**Issue:** PHP backend returns 500 error
- **Cause:** Mail server not configured
- **Solution:** Check hosting provider's SMTP settings

**Issue:** Node.js backend returns 401 error
- **Cause:** Email credentials incorrect
- **Solution:** Verify EMAIL_USER and EMAIL_PASSWORD environment variables

**Issue:** Form fields don't validate
- **Cause:** Required attributes missing
- **Solution:** Check HTML form in index.html (all inputs have `required`)

---

## Security Notes

✅ **Implemented:**
- Email validation (regex pattern)
- HTML escaping to prevent XSS
- CORS enabled for cross-origin requests
- Form data sanitization in PHP backend
- Timeout handling in fetch requests

⚠️ **Additional Security (Optional):**
- Add reCAPTCHA v3 to prevent spam
- Implement rate limiting on backend
- Add email verification step
- Use environment variables for email credentials

---

## Production Deployment

### Using PHP:
1. Upload `/api/send-email.php` to web server
2. Test mail() functionality with hosting provider
3. Monitor email delivery

### Using Node.js:
1. Install Node.js on server
2. Upload `/backend/email-server.js`
3. Set environment variables on production
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start email-server.js --name "portfolio-email"
   pm2 startup
   pm2 save
   ```

---

## File Structure

```
/Portfolio/
├── index.html (form markup)
├── js/
│   └── main.js (form handler)
├── css/
│   └── components.css (button styling)
├── api/
│   └── send-email.php (PHP backend)
└── backend/
    └── email-server.js (Node.js backend)
```

---

## Contact Information

**Recipient Email:** aymen.ben.yedder@mail.com  
**Phone:** +216 25200688  
**WhatsApp:** https://wa.me/21625200688
