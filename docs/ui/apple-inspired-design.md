# Apple-Inspired UI Design Pattern

This document outlines the Apple-inspired UI design pattern implemented in the SmartEdu frontend application. This design approach emphasizes clarity, efficiency, and visual hierarchy while making optimal use of screen space.

## Core Principles

1. **Clarity**: Information is presented in a clear, organized manner with proper visual hierarchy
2. **Space Efficiency**: Two-column layouts for detail pages to maximize information density without overwhelming users
3. **Consistent Components**: Reusable card components with standardized spacing and typography
4. **Role-Based Content**: Content adapts based on user roles and available data
5. **Visual Hierarchy**: Important information is emphasized through size, position, and color

## Implementation Examples

### User Profile Page

The user profile page demonstrates this design pattern with:

1. **Page Header**: Clean header with title, subtitle, and action buttons
2. **Two-Column Layout**:
   - Left column: Compact summary card with key user information
   - Right column: Multiple cards organized by information category

#### Left Column (Summary)

- User avatar/placeholder
- User name and email
- Key status indicators (role, active status)
- Core metadata (account type, join date)
- Visual status indicators using badges

#### Right Column (Details)

- Multiple cards organized by category:
  - Contact Information
  - Role-Specific Information (Student/Teacher/Admin)
  - System Information
  - Biography (if available)
- Each card has:
  - Clear header with icon and title
  - Well-organized content with consistent spacing
  - Two-column layout for related information pairs

## Code Structure

\`\`\`tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column - Summary Card (1/3 width on large screens) */}
    <Card className="lg:col-span-1 h-fit">
        <CardHeader>
            <CardTitle>Summary Title</CardTitle>
        </CardHeader>
        <CardContent>
            {/* Avatar and key information */}
            <div className="flex flex-col items-center">
                {/* Avatar placeholder */}
            </div>
            
            {/* Key information list */}
            <div className="space-y-3">
                {/* Row items with label/value pairs */}
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Label</span>
                    <span className="text-sm">Value</span>
                </div>
            </div>
        </CardContent>
    </Card>
    
    {/* Right Column - Detail Cards (2/3 width on large screens) */}
    <div className="lg:col-span-2 space-y-6">
        {/* Multiple detail cards */}
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    Section Title
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Two-column grid for related information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Field Label</p>
                        <p className="text-sm text-muted-foreground">Field Value</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        {/* Conditional cards based on role or data availability */}
        {condition && (
            <Card>
                {/* Role-specific content */}
            </Card>
        )}
    </div>
</div>
\`\`\`

## Component Usage

1. Use standard `Card` components instead of `DyraneCard` for content containers
2. Continue using `DyraneButton` for actions
3. Use the `PageHeader` component for consistent page headers
4. Use appropriate icons from Lucide React to visually categorize information

## Spacing and Typography

- Card headers: `pb-3` or `pb-4` for appropriate spacing
- Card content: `space-y-4` for vertical spacing between sections
- Use `text-sm` for most content text
- Use `text-muted-foreground` for secondary text
- Use `font-medium` for labels and field names
- Use `gap-6` between cards and columns

## Responsive Behavior

- Single column on mobile/small screens
- Two or three columns on larger screens
- Grid-based layouts within cards that adapt to screen size
- Consistent spacing across screen sizes

## When to Use This Pattern

This design pattern is ideal for:

1. Detail pages showing comprehensive information about an entity
2. Pages with multiple categories of related information
3. Forms that need to be organized into logical sections
4. Pages where users need to quickly scan for key information

## Implementation Guidelines

1. Start with the page header for context
2. Implement the two-column layout grid
3. Create the summary card for the left column
4. Add detail cards to the right column, organized by category
5. Implement conditional rendering based on role or data availability
6. Ensure consistent spacing and typography throughout

By following this design pattern, we create a consistent, professional, and user-friendly interface that makes efficient use of screen space while maintaining clarity and visual hierarchy.
