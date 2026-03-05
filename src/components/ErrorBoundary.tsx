import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);

        // Check for dynamic import failures (common after new deployments)
        const errorMessage = error.toString().toLowerCase();
        if (
            errorMessage.includes('failed to fetch dynamically imported module') ||
            errorMessage.includes('chunkloaderror') ||
            errorMessage.includes('loading chunk') ||
            errorMessage.includes('failed to load')
        ) {
            console.warn('Dynamic import failure detected. Attempting to force reload...');
            // Optional: Use a short timeout to prevent infinite rapid reloads
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', direction: 'ltr' }}>
                    <h1 style={{ marginBottom: '1.5rem' }}>Something went wrong.</h1>
                    <p style={{ color: 'red', backgroundColor: '#fee', padding: '1rem', borderRadius: '4px', maxWidth: '800px', margin: '1rem auto', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                        {this.state.error?.toString()}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginTop: '1rem' }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
