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

    // Forward the request to the backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.onetechacademy.com';
    const response = await fetch(`${apiUrl}/api/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add to waitlist');
    }

    return NextResponse.json(data);
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