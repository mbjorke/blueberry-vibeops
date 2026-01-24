import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  display_name: string | null;
  logo_url: string | null;
  email_notifications: boolean;
  security_alerts: boolean;
  deployment_updates: boolean;
  onboarding_completed: boolean;
  onboarding_step: number;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  uploadLogo: (file: File) => Promise<{ url: string | null; error: Error | null }>;
  removeLogo: () => Promise<{ error: Error | null }>;
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setProfile(data as UserProfile);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    // Use upsert to handle case where profile doesn't exist yet
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({ 
        user_id: user.id,
        email: user.email || '',
        ...updates 
      }, { 
        onConflict: 'user_id' 
      });

    if (updateError) {
      return { error: updateError };
    }

    // Refresh profile data
    await fetchProfile();
    return { error: null };
  };

  const uploadLogo = async (file: File) => {
    if (!user) {
      return { url: null, error: new Error('Not authenticated') };
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return { url: null, error: new Error('File must be an image') };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { url: null, error: new Error('File must be less than 2MB') };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/logo.${fileExt}`;

    // Delete existing logo first
    await supabase.storage.from('avatars').remove([`${user.id}/logo.png`, `${user.id}/logo.jpg`, `${user.id}/logo.jpeg`, `${user.id}/logo.webp`]);

    // Upload new logo
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const logoUrl = urlData.publicUrl;

    // Update profile with new URL (use upsert in case profile doesn't exist)
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({ 
        user_id: user.id, 
        email: user.email || '',
        logo_url: logoUrl 
      }, { 
        onConflict: 'user_id' 
      });

    if (updateError) {
      return { url: null, error: updateError };
    }

    // Refresh profile
    await fetchProfile();

    return { url: logoUrl, error: null };
  };

  const removeLogo = async () => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    // Remove from storage
    await supabase.storage.from('avatars').remove([
      `${user.id}/logo.png`, 
      `${user.id}/logo.jpg`, 
      `${user.id}/logo.jpeg`, 
      `${user.id}/logo.webp`
    ]);

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ logo_url: null })
      .eq('user_id', user.id);

    if (updateError) {
      return { error: updateError };
    }

    await fetchProfile();
    return { error: null };
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    uploadLogo,
    removeLogo,
  };
}
