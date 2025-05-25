import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Contact form schema validation
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  inquiryType: z.string().min(1, 'Please select an inquiry type'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = contactFormSchema.parse(body);
    
    // For now, we'll use a simple email service approach
    // In production, you would integrate with services like:
    // - Resend (recommended)
    // - SendGrid
    // - Nodemailer with SMTP
    // - EmailJS
    
    // Simple email content
    const emailContent = `
New Contact Form Submission

Name: ${validatedData.name}
Email: ${validatedData.email}
Phone: ${validatedData.phone || 'Not provided'}
Inquiry Type: ${validatedData.inquiryType}

Message:
${validatedData.message}

---
Sent from 1Tech Academy Contact Form
Time: ${new Date().toISOString()}
    `;

    // TODO: Replace this with actual email sending logic
    // For now, we'll log the email content and return success
    console.log('Contact Form Submission:', emailContent);
    
    // In a real implementation, you would:
    // 1. Set up environment variables for email service
    // 2. Use a service like Resend:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'noreply@1techacademy.com',
      to: 'info@1techacademy.com',
      subject: `Contact Form: ${validatedData.inquiryType}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>'),
    });
    */
    
    // For now, simulate successful email sending
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    
    return NextResponse.json({ 
      success: true, 
      message: 'Contact form submitted successfully' 
    });
    
  } catch (error) {
    console.error('Contact form API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid form data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
