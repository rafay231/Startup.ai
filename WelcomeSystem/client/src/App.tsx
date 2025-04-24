import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import DebugPage from "@/pages/debug-page";

// Performance optimization: Import all pages normally to avoid TypeScript errors
// with lazy loading in this environment
import IdeaWizard from "@/pages/idea-wizard";
import AudienceWizard from "@/pages/audience-wizard";
import BusinessModelWizard from "@/pages/business-model-wizard";
import CompetitionWizard from "@/pages/competition-wizard";
import RevenueWizard from "@/pages/revenue-wizard";
import MvpWizard from "@/pages/mvp-wizard";
import ResourceLibrary from "@/pages/resource-library";
import TaskPlanner from "@/pages/task-planner";
import ExportMaterials from "@/pages/export-materials";

// Router component (simplified for compatibility)
function Router() {
  console.log("Router component rendering");
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/debug" component={DebugPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/startups/:startupId/idea" component={IdeaWizard} />
      <ProtectedRoute path="/startups/:startupId/audience" component={AudienceWizard} />
      <ProtectedRoute path="/startups/:startupId/business-model" component={BusinessModelWizard} />
      <ProtectedRoute path="/startups/:startupId/competition" component={CompetitionWizard} />
      <ProtectedRoute path="/startups/:startupId/revenue" component={RevenueWizard} />
      <ProtectedRoute path="/startups/:startupId/mvp" component={MvpWizard} />
      <ProtectedRoute path="/resources" component={ResourceLibrary} />
      <ProtectedRoute path="/tasks" component={TaskPlanner} />
      <ProtectedRoute path="/export" component={ExportMaterials} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Main App component with optimized provider structure
function App() {
  console.log("App component rendering");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
