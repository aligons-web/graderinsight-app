import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import RubricBuilder from "@/pages/rubric-builder";
import RubricTemplates from "@/pages/rubric-templates";
import Downloads from "@/pages/downloads";
import Settings from "@/pages/settings";
import { isAuthenticated } from "@/lib/api";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center h-14 px-4 border-b bg-background shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const [location] = useLocation();
  
  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(location);

  if (isPublicRoute) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/rubric-templates" component={RubricTemplates} />
        <Route path="/rubric-templates/new" component={RubricBuilder} />
        <Route path="/rubric-templates/:id" component={RubricBuilder} />
        <Route path="/settings" component={Settings} />
        <Route path="/upload"><Redirect to="/dashboard" /></Route>
        <Route path="/subscriptions"><Redirect to="/settings#subscription" /></Route>
        <Route path="/rubric-builder"><Redirect to="/rubric-templates" /></Route>
        <Route path="/rubric-builder/:id"><Redirect to="/rubric-templates" /></Route>
        <Route path="/apps"><Redirect to="/downloads" /></Route>
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;