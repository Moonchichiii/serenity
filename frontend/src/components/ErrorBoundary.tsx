import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    onReset?: () => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.props.onError?.(error, errorInfo)
        this.setState({
            errorInfo,
        })
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
        this.props.onReset?.()
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen bg-porcelain flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full">
                        <div className="card p-8 text-center">
                            <div className="text-6xl mb-6">⚠️</div>

                            <h1 className="text-3xl font-heading font-bold text-charcoal mb-4">
                                Oops! Something went wrong
                            </h1>

                            <p className="text-charcoal/70 mb-6 text-lg">
                                We're sorry for the inconvenience. The application encountered an unexpected error.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={this.handleReset}
                                    className="btn-primary px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Try Again
                                </button>

                                <button
                                    onClick={() => window.history.back()}
                                    className="btn-secondary px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Go Back
                                </button>

                                <button
                                    onClick={() => (window.location.href = '/')}
                                    className="btn-secondary px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Go Home
                                </button>
                            </div>

                            <p className="text-sm text-charcoal/50 mt-6">
                                If this problem persists, please contact support.
                            </p>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export function ErrorFallback({
    error,
    resetError,
}: {
    error?: Error
    resetError?: () => void
}) {
    return (
        <div className="p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-charcoal mb-2">
                Something went wrong
            </h3>
            <p className="text-charcoal/70 mb-4">
                {error?.message || 'An unexpected error occurred'}
            </p>
            {resetError && (
                <button
                    onClick={resetError}
                    className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
                >
                    Try Again
                </button>
            )}
        </div>
    )
}

export function SectionErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">
                        This section failed to load. Please refresh the page.
                    </p>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    )
}
