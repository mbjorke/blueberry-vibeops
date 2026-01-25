import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => {
  const mockAuth = {
    setSession: vi.fn(),
    getSession: vi.fn(),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn((callback) => {
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    }),
  };

  return {
    supabase: {
      auth: mockAuth,
    },
  };
});

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.hash
    delete (window as any).location;
    window.location = { ...window.location, hash: '' };
  });

  describe('Session Setup', () => {
    it('should set session from URL hash tokens', async () => {
      // Simulate URL with recovery tokens
      window.location.hash = '#access_token=test_token&refresh_token=refresh_token&type=recovery';

      (supabase.auth.setSession as any).mockResolvedValue({
        data: { session: { user: { id: '123' } } },
        error: null,
      });

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(supabase.auth.setSession).toHaveBeenCalledWith({
          access_token: 'test_token',
          refresh_token: 'refresh_token',
        });
      });
    });

    it('should show invalid link message when no tokens in URL', async () => {
      window.location.hash = '';

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Invalid or expired link/i)).toBeInTheDocument();
      });
    });

    it('should use existing session if available', async () => {
      const mockSession = {
        user: { id: '123', email: 'test@example.com' },
        access_token: 'token',
      };

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Reset Form', () => {
    beforeEach(() => {
      // Setup valid session
      window.location.hash = '#access_token=test_token&type=recovery';
      (supabase.auth.setSession as any).mockResolvedValue({
        data: { session: { user: { id: '123' } } },
        error: null,
      });
    });

    it('should render password reset form when session is ready', async () => {
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
      });
    });

    it('should validate password match', async () => {
      const { toast } = useToast();
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/New Password/i);
      const confirmInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password456' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            title: 'Passwords do not match',
          })
        );
      });
    });

    it('should validate password length', async () => {
      const { toast } = useToast();
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/New Password/i);
      const confirmInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Reset password/i });

      fireEvent.change(passwordInput, { target: { value: '12345' } });
      fireEvent.change(confirmInput, { target: { value: '12345' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            title: 'Password too short',
          })
        );
      });
    });

    it('should successfully reset password', async () => {
      const { toast } = useToast();
      (supabase.auth.updateUser as any).mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/New Password/i);
      const confirmInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(supabase.auth.updateUser).toHaveBeenCalledWith({
          password: 'newpassword123',
        });
      });

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Password updated!',
          })
        );
      });

      // Should show success screen
      await waitFor(() => {
        expect(screen.getByText(/Password reset!/i)).toBeInTheDocument();
      });
    });

    it('should handle password update errors', async () => {
      const { toast } = useToast();
      const errorMessage = 'Password update failed';
      (supabase.auth.updateUser as any).mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/New Password/i);
      const confirmInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
            title: 'Error',
            description: errorMessage,
          })
        );
      });
    });
  });

  describe('Password Generation', () => {
    beforeEach(() => {
      window.location.hash = '#access_token=test_token&type=recovery';
      (supabase.auth.setSession as any).mockResolvedValue({
        data: { session: { user: { id: '123' } } },
        error: null,
      });
    });

    it('should generate strong password when clicking generate button', async () => {
      const { toast } = useToast();
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Generate/i)).toBeInTheDocument();
      });

      const generateButton = screen.getByText(/Generate/i);
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Strong password generated',
          })
        );
      });

      // Password should be filled in
      const passwordInput = screen.getByLabelText(/New Password/i) as HTMLInputElement;
      expect(passwordInput.value.length).toBeGreaterThan(0);
    });

    it('should copy password to clipboard', async () => {
      const { toast } = useToast();
      const mockWriteText = vi.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Generate/i)).toBeInTheDocument();
      });

      // Generate password first
      const generateButton = screen.getByText(/Generate/i);
      fireEvent.click(generateButton);

      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/New Password/i) as HTMLInputElement;
        expect(passwordInput.value.length).toBeGreaterThan(0);
      });

      // Find and click copy button
      const copyButton = screen.getByRole('button', { name: '' }); // Copy button has no accessible name
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Password copied to clipboard',
          })
        );
      });
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      window.location.hash = '#access_token=test_token&type=recovery';
      (supabase.auth.setSession as any).mockResolvedValue({
        data: { session: { user: { id: '123' } } },
        error: null,
      });
    });

    it('should show success screen after password reset', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/New Password/i);
      const confirmInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Password reset!/i)).toBeInTheDocument();
        expect(screen.getByText(/Your password has been updated successfully/i)).toBeInTheDocument();
      });
    });

    it('should navigate to login when clicking go to login', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/New Password/i);
      const confirmInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: /Reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Go to login/i)).toBeInTheDocument();
      });

      const loginButton = screen.getByText(/Go to login/i);
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
