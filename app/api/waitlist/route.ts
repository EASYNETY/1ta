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

/**
 * Direct implementation of waitlist functionality in the frontend API route
 * This avoids the need to connect to a separate backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = waitlistFormSchema.parse(body);
    const { name, email, phone, courseId, courseTitle } = validatedData;
    
    // Use the contact API directly (absolute URL to avoid recursion)
    const origin = request.headers.get('origin') || 'https://onetechacademy.com';
    const contactApiUrl = `${origin}/api/contact`;
    
    try {
      const contactResponse = await fetch(contactApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone || 'Not provided',
          interest: 'Course Waitlist',
          message: `A user has requested to join the waitlist for the following course:
          
Course: ${courseTitle}
Course ID: ${courseId}
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Please add them to the waitlist and notify them when this course becomes available.`,
        }),
      });
      
      const contactData = await contactResponse.json();
      
      if (!contactData.success) {
        throw new Error(contactData.message || 'Failed to send waitlist notification');
      }
      
      // Log the successful waitlist request
      console.log('Waitlist request processed via contact API:', {
        name,
        email,
        phone: phone || 'Not provided',
        courseTitle,
        courseId
      });
      
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
      
    } catch (contactError) {
      console.error('Error using contact API:', contactError);
      
      // Return a more specific error message
      return NextResponse.json({
        success: false,
        error: 'Unable to process your waitlist request at this time. Please try again later or contact us directly at info@1techacademy.com.'
      }, { status: 500 });
    }
    
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