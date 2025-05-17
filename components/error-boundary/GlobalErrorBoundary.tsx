'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * A global error boundary component that catches JavaScript errors anywhere in its child component tree.
 * It displays a fallback UI instead of crashing the whole app.
 */
class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by GlobalErrorBoundary:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      const defaultFallback = (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 space-y-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
          
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <div className="max-w-lg w-full mt-4">
              <details className="border rounded-md p-4 bg-muted/50">
                <summary className="font-medium cursor-pointer">Error Details</summary>
                <pre className="mt-2 text-xs overflow-auto p-2 bg-muted rounded">
                  {this.state.error?.stack}
                </pre>
                <pre className="mt-2 text-xs overflow-auto p-2 bg-muted rounded">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            </div>
          )}
          
          <Button 
            onClick={this.handleReset}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      );

      return this.props.fallback || defaultFallback;
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
