import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'client' | 'superadmin';

interface Organization {
  id: string;
  name: string;
  logo_initial: string;
  logo_color: string;
  is_org_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<{ error: Error | null; data: { user: User | null } | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  organizations: Organization[];
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  const fetchUserRole = async (userId: string) => {
    console.log('Fetching role for user:', userId);
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    console.log('Fetched role:', data?.role);
    return data?.role as AppRole | null;
  };

  const fetchUserOrganizations = async (userId: string) => {
    console.log('Fetching organizations for user:', userId);
    const { data, error } = await supabase
      .from('client_users')
      .select(`
        client_id,
        is_org_admin,
        clients (
          id,
          name,
          logo_initial,
          logo_color
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user organizations:', error);
      return [];
    }

    const orgs: Organization[] = (data || [])
      .filter(item => item.clients)
      .map(item => ({
        id: item.clients.id,
        name: item.clients.name,
        logo_initial: item.clients.logo_initial,
        logo_color: item.clients.logo_color,
        is_org_admin: item.is_org_admin || false,
      }));

    console.log('Fetched organizations:', orgs);
    return orgs;
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer role and org fetching to avoid blocking
          setTimeout(async () => {
            const userRole = await fetchUserRole(session.user.id);
            setRole(userRole);
            
            const userOrgs = await fetchUserOrganizations(session.user.id);
            setOrganizations(userOrgs);
            
            // Set current org to first org if not already set
            if (userOrgs.length > 0 && !currentOrganization) {
              setCurrentOrganization(userOrgs[0]);
            }
          }, 0);
        } else {
          setRole(null);
          setOrganizations([]);
          setCurrentOrganization(null);
        }

        setLoading(false);
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userRole = await fetchUserRole(session.user.id);
        setRole(userRole);
        
        const userOrgs = await fetchUserOrganizations(session.user.id);
        setOrganizations(userOrgs);
        
        // Set current org to first org
        if (userOrgs.length > 0) {
          setCurrentOrganization(userOrgs[0]);
        }
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    });
    return { error: error as Error | null, data: data ? { user: data.user } : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setOrganizations([]);
    setCurrentOrganization(null);
  };

  // Computed permission flags
  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isOrgAdmin = currentOrganization?.is_org_admin || isSuperAdmin;

  const value = {
    user,
    session,
    loading,
    role,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isSuperAdmin,
    isOrgAdmin,
    organizations,
    currentOrganization,
    setCurrentOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
