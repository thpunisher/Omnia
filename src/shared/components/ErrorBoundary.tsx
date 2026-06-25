import { Component, ErrorInfo, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="h-screen flex items-center justify-center"
          style={{ background: "var(--color-base)" }}
        >
          <div className="text-center max-w-sm px-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "var(--color-accent)" }}
            >
              <span className="text-lg font-black text-white">O</span>
            </div>
            <h2
              className="text-base font-semibold mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Something went wrong
            </h2>
            <p
              className="text-sm mb-5"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <button
              className="btn-primary mx-auto"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
