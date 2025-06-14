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
 * This is a proxy API route that forwards requests to the backend API
 * It helps avoid CORS issues when making direct requests from the frontend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = waitlistFormSchema.parse(body);
    
    // Get the API URL from environment or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.onetechacademy.com';
    
    try {
      // Forward the request to the backend API
      const response = await fetch(`${apiUrl}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });
      
      // Get the response from the backend
      const data = await response.json();
      
      // Return the response to the frontend
      return NextResponse.json(data, {
        status: response.status,
      });
      
    } catch (fetchError) {
      console.error('Error forwarding request to backend:', fetchError);
      
      // If we can't reach the backend, use the contact API as fallback
      try {
        const contactResponse = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone || 'Not provided',
            inquiryType: 'Course Waitlist',
            message: `A user has requested to join the waitlist for the following course:
            
Course: ${validatedData.courseTitle}
Course ID: ${validatedData.courseId}
Name: ${validatedData.name}
Email: ${validatedData.email}
Phone: ${validatedData.phone || 'Not provided'}

Please add them to the waitlist and notify them when this course becomes available.`,
          }),
        });
        
        const contactData = await contactResponse.json();
        
        if (!contactData.success) {
          throw new Error('Failed to send waitlist notification via contact API');
        }
        
        // Return success response
        return NextResponse.json({
          success: true,
          message: 'Successfully added to the waitlist (via contact form)',
          data: {
            name: validatedData.name,
            email: validatedData.email,
            courseTitle: validatedData.courseTitle
          }
        });
        
      } catch (contactError) {
        console.error('Error using contact API as fallback:', contactError);
        throw new Error('Failed to process waitlist request. Please try again later.');
      }
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