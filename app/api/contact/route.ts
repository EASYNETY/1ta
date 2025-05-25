import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

// Contact form schema validation
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  inquiryType: z.string().min(1, 'Please select an inquiry type'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = contactFormSchema.parse(body);

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return NextResponse.json(
        {
          success: false,
          error: 'Email service not configured'
        },
        { status: 500 }
      );
    }

    // Create email content
    const emailSubject = `Contact Form: ${validatedData.inquiryType} - ${validatedData.name}`;

    const emailText = `
New Contact Form Submission

Name: ${validatedData.name}
Email: ${validatedData.email}
Phone: ${validatedData.phone || 'Not provided'}
Inquiry Type: ${validatedData.inquiryType}

Message:
${validatedData.message}

---
Sent from 1Tech Academy Contact Form
Time: ${new Date().toLocaleString()}
    `;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C99700; border-bottom: 2px solid #C99700; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Contact Information</h3>
          <p><strong>Name:</strong> ${validatedData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${validatedData.email}">${validatedData.email}</a></p>
          <p><strong>Phone:</strong> ${validatedData.phone || 'Not provided'}</p>
          <p><strong>Inquiry Type:</strong> ${validatedData.inquiryType}</p>
        </div>

        <div style="background-color: #fff; padding: 20px; border-left: 4px solid #C99700; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Message</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${validatedData.message}</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Sent from 1Tech Academy Contact Form<br>
            ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    // Send email using Resend
    try {
      const emailResult = await resend.emails.send({
        from: 'noreply@1techacademy.com',
        to: 'info@1techacademy.com',
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });

      console.log('Email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email'
        },
        { status: 500 }
      );
    }

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
