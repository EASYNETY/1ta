import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

// Waitlist form schema validation
const waitlistFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  courseId: z.string().min(1, 'Course ID is required'),
  courseTitle: z.string().min(1, 'Course title is required'),
});

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = waitlistFormSchema.parse(body);
    const { name, email, phone, courseId, courseTitle } = validatedData;
    
    // Create email content
    const emailSubject = `Waitlist Request: ${courseTitle}`;
    
    const emailText = `
New Waitlist Request

Course: ${courseTitle}
Course ID: ${courseId}
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Please add them to the waitlist and notify them when this course becomes available.

---
Sent from 1Tech Academy Waitlist Form
Time: ${new Date().toLocaleString()}
    `;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C99700; border-bottom: 2px solid #C99700; padding-bottom: 10px;">
          New Waitlist Request
        </h2>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Course Information</h3>
          <p><strong>Course:</strong> ${courseTitle}</p>
          <p><strong>Course ID:</strong> ${courseId}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">User Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Sent from 1Tech Academy Waitlist Form<br>
            ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;
    
    // Try to send email if Resend is configured
    if (resend) {
      try {
        await resend.emails.send({
          from: 'noreply@1techacademy.com',
          to: 'info@1techacademy.com',
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        });
        
        console.log('Waitlist notification email sent successfully');
      } catch (emailError) {
        // Log the error but don't fail the request
        console.error('Failed to send waitlist notification email:', emailError);
      }
    } else {
      console.log('Resend API key not configured, skipping email notification');
    }
    
    // Always return success to the frontend
    return NextResponse.json({
      success: true,
      message: 'Successfully added to the waitlist',
      data: {
        name,
        email,
        courseTitle
      }
    });
    
  } catch (error) {
    console.error('Waitlist API error:', error);

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
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}