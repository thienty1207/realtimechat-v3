import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-base-200">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600">The editor failed to load properly.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;