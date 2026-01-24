import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingState {
  showTour: boolean;
  loading: boolean;
  initialStep: number;
  completeOnboarding: () => void;
  sendWelcomeEmail: () => Promise<void>;
}

export function useOnboarding(): OnboardingState {
  const { user } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialStep, setInitialStep] = useState(0);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step, welcome_email_sent')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking onboarding status:', error);
        setLoading(false);
        return;
      }

      if (profile) {
        if (!profile.onboarding_completed) {
          setInitialStep(profile.onboarding_step || 0);
          setShowTour(true);
        }

        // Send welcome email if not sent yet
        if (!profile.welcome_email_sent) {
          sendWelcomeEmailInternal();
        }
      }

      setLoading(false);
    };

    checkOnboardingStatus();
  }, [user]);

  const sendWelcomeEmailInternal = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const response = await supabase.functions.invoke('send-welcome-email', {
        body: {
          userId: user.id,
          email: user.email,
          fullName: profile?.full_name || '',
        },
      });

      if (response.error) {
        console.error('Error sending welcome email:', response.error);
      } else {
        console.log('Welcome email sent successfully');
      }
    } catch (error) {
      console.error('Error invoking welcome email function:', error);
    }
  };

  const completeOnboarding = () => {
    setShowTour(false);
  };

  const sendWelcomeEmail = async () => {
    await sendWelcomeEmailInternal();
  };

  return {
    showTour,
    loading,
    initialStep,
    completeOnboarding,
    sendWelcomeEmail,
  };
}