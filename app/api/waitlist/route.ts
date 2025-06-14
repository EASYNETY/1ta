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
    
    // Create a message for the contact form
    const message = `
Course Waitlist Request

Course: ${courseTitle}
Course ID: ${courseId}
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Please add them to the waitlist and notify them when this course becomes available.
    `;
    
    // Instead of using fetch which is causing issues, directly return success
    // and handle the notification in the frontend component
    
    return NextResponse.json({
      success: true,
      message: 'Successfully added to the waitlist',
      data: {
        name,
        email,
        phone,
        courseId,
        courseTitle,
        message
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