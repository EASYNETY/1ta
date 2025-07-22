// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /admin/tickets/123)
  const pathname = request.nextUrl.pathname

  // Check if this is an admin ticket detail page request
  if (pathname.startsWith('/admin/tickets/') && pathname !== '/admin/tickets') {
    // Extract the ticket ID from the URL
    const ticketId = pathname.split('/').pop()
    
    // Check if user has customer_care role from cookies or headers
    // Note: In a real implementation, you'd decode the JWT token to get the role
    // For now, we'll let the client-side redirect handle this
    
    console.log('Middleware: Admin ticket request detected:', pathname)
    
    // For now, let the request proceed and let client-side redirect handle it
    // In the future, we could decode JWT and redirect here
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
