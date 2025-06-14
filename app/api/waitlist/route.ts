import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Waitlist form schema validation
const waitlistFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  courseId: z.string().min(1, 'Course ID is required'),
  courseTitle: z.string().min(1, 'Course title is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = waitlistFormSchema.parse(body);
    const { name, email, phone, courseId, courseTitle } = validatedData;
    
    // Use the existing contact API to send the waitlist notification
    // This is a workaround until the backend waitlist API is fixed
    const contactResponse = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone || 'Not provided',
        inquiryType: 'Course Waitlist',
        message: `A user has requested to join the waitlist for the following course:
        
Course: ${courseTitle}
Course ID: ${courseId}
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Please add them to the waitlist and notify them when this course becomes available.`,
      }),
    });
    
    if (!contactResponse.ok) {
      const errorData = await contactResponse.json();
      throw new Error(errorData.error || 'Failed to send waitlist notification');
    }
    
    // Return success response
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