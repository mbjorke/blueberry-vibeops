import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  requireOrgAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireSuperAdmin = false,
  requireOrgAdmin = false,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isSuperAdmin, isOrgAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Superadmin routes - platform owner only
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/portal" replace />;
  }

  // Org admin routes - org admins and superadmins
  if (requireOrgAdmin && !isOrgAdmin) {
    return <Navigate to="/portal" replace />;
  }

  // Admin routes - admins and superadmins (legacy, keep for backward compatibility)
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
}
