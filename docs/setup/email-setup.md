# Email Setup Guide

## Contact Form Email Configuration

The contact form has been updated to use Resend for reliable email delivery to info@1techacademy.com.

### Required Environment Variable

Add the following environment variable to your `.env.local` file:

\`\`\`bash
RESEND_API_KEY=your_resend_api_key_here
\`\`\`

### Getting a Resend API Key

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your domain (1techacademy.com) or use their test domain
4. Generate an API key from the dashboard
5. Add the API key to your environment variables

### Domain Verification

For production use, you'll need to verify the domain `1techacademy.com` in Resend:

1. Add DNS records as provided by Resend
2. Wait for verification (usually takes a few minutes)
3. Update the `from` field in the API route if needed

### Testing

To test the contact form:

1. Set up the RESEND_API_KEY environment variable
2. Restart your development server
3. Submit a test message through the contact form
4. Check the info@1techacademy.com inbox for the email

### Fallback Behavior

If the RESEND_API_KEY is not configured:
- The API will return an error message
- Users will see a helpful error message suggesting direct email contact
- No emails will be sent (preventing silent failures)

### Email Template

The contact form emails include:
- Professional HTML formatting with 1Tech Academy branding
- Contact information (name, email, phone)
- Inquiry type and message
- Timestamp of submission
- Responsive design for mobile email clients

### Troubleshooting

Common issues:
1. **API Key not set**: Ensure RESEND_API_KEY is in your environment
2. **Domain not verified**: Verify 1techacademy.com in Resend dashboard
3. **Rate limits**: Resend free tier has sending limits
4. **Spam filters**: Check spam/junk folders for test emails

### Production Deployment

For production deployment:
1. Add RESEND_API_KEY to your hosting platform's environment variables
2. Ensure the domain is verified in Resend
3. Monitor email delivery through Resend dashboard
4. Set up webhooks for delivery notifications if needed
