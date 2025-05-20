# Interactive Onboarding Tour Component

## Overview

The Interactive Onboarding Tour is a guided walkthrough that introduces new users to key platform features based on their role. It uses the react-joyride library to create an interactive, step-by-step tour of the interface.

## Implementation

```jsx
// components/onboarding/OnboardingTour.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { completeOnboardingTour } from '@/features/auth/store/auth-slice';

export function OnboardingTour() {
  const { user, hasCompletedTour } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [run, setRun] = useState(false);
  
  // Define steps based on user role
  const getSteps = (): Step[] => {
    const commonSteps = [
      {
        target: '.dashboard-welcome',
        content: 'Welcome to 1Tech Academy! This is your dashboard where you can see an overview of your activities.',
        placement: 'bottom',
      },
      {
        target: '.app-sidebar',
        content: 'Use the sidebar to navigate to different sections of the platform.',
        placement: 'right',
      }
    ];
    
    // Role-specific steps
    if (user?.role === 'student') {
      return [
        ...commonSteps,
        {
          target: '.my-courses-section',
          content: 'Here you can find all your enrolled courses.',
          placement: 'top',
        },
        {
          target: '.dashboard-stats',
          content: 'Track your progress and upcoming assignments here.',
          placement: 'bottom',
        }
      ];
    }
    
    if (user?.role === 'teacher') {
      return [
        ...commonSteps,
        {
          target: '.my-classes-section',
          content: 'Manage your classes and student attendance here.',
          placement: 'top',
        }
      ];
    }
    
    // Default steps for other roles
    return commonSteps;
  };
  
  useEffect(() => {
    // Only start the tour if user is logged in, hasn't completed it, and we're on the dashboard
    if (user && !hasCompletedTour && router.pathname === '/dashboard') {
      // Delay start to ensure DOM elements are loaded
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, hasCompletedTour, router.pathname]);
  
  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      dispatch(completeOnboardingTour());
    }
  };
  
  if (!user || hasCompletedTour) return null;
  
  return (
    <Joyride
      steps={getSteps()}
      run={run}
      continuous
      showSkipButton
      showProgress
      styles={{
        options: {
          primaryColor: 'var(--color-primary)',
          zIndex: 1000,
        },
        tooltip: {
          fontSize: '14px',
        },
        buttonNext: {
          backgroundColor: 'var(--color-primary)',
        },
        buttonBack: {
          color: 'var(--color-primary)',
        }
      }}
      callback={handleCallback}
    />
  );
}
```

## Integration

1. Add the OnboardingTour component to the authenticated layout:

```jsx
// app/(authenticated)/layout.tsx
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';

export default function AuthenticatedLayout({ children }) {
  return (
    <>
      {children}
      <OnboardingTour />
    </>
  );
}
```

2. Update the auth slice to track tour completion:

```jsx
// features/auth/store/auth-slice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    // ... existing state
    hasCompletedTour: false,
  },
  reducers: {
    // ... existing reducers
    completeOnboardingTour: (state) => {
      state.hasCompletedTour = true;
    },
  },
});

export const { completeOnboardingTour } = authSlice.actions;
```

3. Add CSS classes to key UI elements for targeting:

```jsx
// components/dashboard/DashboardWelcome.tsx
<div className="dashboard-welcome">
  <h1>Welcome, {user.name}</h1>
</div>

// components/courses/MyCourses.tsx
<div className="my-courses-section">
  <h2>My Courses</h2>
  {/* Course cards */}
</div>
```

## Dependencies

- react-joyride: `^2.5.0`

## Customization

The tour can be customized by:
- Adding more steps for different user roles
- Changing the styling of the tooltips
- Adjusting the timing of when the tour appears
- Adding more interactive elements to the tour

## Accessibility Considerations

- All tooltips should have sufficient color contrast
- Tour should be keyboard navigable
- Consider adding a "Do not show again" option
- Ensure screen readers can access the tour content
