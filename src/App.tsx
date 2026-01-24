import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectSettings from "./pages/ProjectSettings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import AdminPanel from "./pages/AdminPanel";
import Preferences from "./pages/Preferences";
import HelpCenter from "./pages/HelpCenter";
import OpsGuide from "./pages/OpsGuide";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Repositories from "./pages/Repositories";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to Clients (new admin home) */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute requireAdmin>
                  <Navigate to="/clients" replace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project/:projectId" 
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project/:projectId/settings" 
              element={
                <ProtectedRoute requireAdmin>
                  <ProjectSettings />
                </ProtectedRoute>
              } 
            />
            
            {/* Legacy Portal - redirect to repositories */}
            <Route path="/portal" element={
              <ProtectedRoute>
                <Navigate to="/repositories" replace />
              </ProtectedRoute>
            } />

            {/* Admin Panel */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* User Preferences */}
            <Route path="/preferences" element={
              <ProtectedRoute>
                <Preferences />
              </ProtectedRoute>
            } />

            {/* Help Center */}
            <Route path="/help" element={
              <ProtectedRoute>
                <HelpCenter />
              </ProtectedRoute>
            } />

            {/* Ops Guide */}
            <Route path="/ops-guide" element={
              <ProtectedRoute requireAdmin>
                <OpsGuide />
              </ProtectedRoute>
            } />

            {/* Clients Management (Admin Home) */}
            <Route path="/clients" element={
              <ProtectedRoute requireAdmin>
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="/clients/:clientId" element={
              <ProtectedRoute requireAdmin>
                <ClientDetail />
              </ProtectedRoute>
            } />

            {/* Repositories - works for both admins and clients */}
            <Route path="/repositories" element={
              <ProtectedRoute>
                <Repositories />
              </ProtectedRoute>
            } />

            {/* Legacy Dashboard (keep for backwards compatibility) */}
            <Route path="/dashboard" element={
              <ProtectedRoute requireAdmin>
                <Index />
              </ProtectedRoute>
            } />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
