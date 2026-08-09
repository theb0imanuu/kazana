import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in Kazana frontend:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-ios-bg-light dark:bg-ios-bg-dark text-neutral-800 dark:text-neutral-200">
          <div className="w-16 h-16 rounded-full bg-ios-red/10 text-ios-red flex items-center justify-center mb-6 border border-ios-red/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm mb-6">
            An unexpected error occurred while rendering the page. Feel free to reload or reset the application.
          </p>
          {this.state.error?.message ? (
            <pre className="p-4 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-ios-md text-xs text-left max-w-md w-full overflow-auto mb-6 text-neutral-600 dark:text-neutral-400 font-mono">
              {this.state.error.message}
            </pre>
          ) : null}
          <Button variant="primary" onClick={this.handleReset}>
            Reset Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
