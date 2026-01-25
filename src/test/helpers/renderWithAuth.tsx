import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/hooks/useAuth';
import { BrowserRouter } from 'react-router-dom';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: {
    id: string;
    email: string;
    role?: 'admin' | 'client' | 'superadmin';
    organizations?: Array<{
      id: string;
      name: string;
      logo_initial: string;
      logo_color: string;
      is_org_admin: boolean;
    }>;
  };
}

export function renderWithAuth(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialUser, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
