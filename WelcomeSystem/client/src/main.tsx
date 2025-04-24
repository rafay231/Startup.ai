import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Performance optimization: Add meaningful console logs to track rendering stages
console.log("Initial JavaScript execution - starting application");

// Simplified loading component with reduced CSS complexity
const LoadingApp: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <h2>Loading StartupLaunchpad...</h2>
    <p>Please wait while the application initializes.</p>
  </div>
);

// Define proper types for the error boundary
type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

// Simplified error boundary with proper TypeScript types
class ErrorFallback extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null
    };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error): void {
    console.error("React rendering error:", error);
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#b91c1c' }}>Application Error</h1>
          <p>We encountered a problem while loading the application.</p>
          <p>Error: {this.state.error && this.state.error.toString()}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Core application rendering logic
try {
  console.log("Finding root element");
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  console.log("Rendering initial loading screen");
  const root = createRoot(rootElement);
  root.render(<LoadingApp />);
  
  // Delay full app loading to ensure the loading screen is displayed first
  setTimeout(() => {
    console.log("Starting dynamic import of App component");
    
    // Dynamically import App with reduced initial dependencies
    import('./App').then(({ default: App }) => {
      console.log("App component loaded, rendering main application");
      
      // Skip API check on initial load to improve performance
      root.render(
        <ErrorFallback>
          <App />
        </ErrorFallback>
      );
    }).catch(err => {
      console.error("Failed to load App component:", err);
      
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif;">
          <h1 style="color: #b91c1c;">Application Failed to Load</h1>
          <p>There was a problem loading the main application.</p>
          <p>Please try refreshing the page.</p>
        </div>
      `;
    });
  }, 100); // Small delay to ensure loading screen renders first
} catch (err) {
  console.error("Critical rendering error:", err);
  
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>StartupLaunchpad</h1>
      <p>The application encountered a critical error during startup.</p>
      <p>Please try refreshing your browser.</p>
    </div>
  `;
}
