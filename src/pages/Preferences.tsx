import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Bell, 
  RotateCcw,
  Save,
  Loader2,
  Upload,
  Trash2,
  Building2
} from 'lucide-react';

interface ProfileFormData {
  full_name: string;
  company_name: string;
  display_name: string;
  email_notifications: boolean;
  security_alerts: boolean;
  deployment_updates: boolean;
}

export default function Preferences() {
  const { user, loading: authLoading } = useAuth();
  const { profile: userProfile, loading: profileLoading, uploadLogo, removeLogo, updateProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    company_name: '',
    display_name: '',
    email_notifications: true,
    security_alerts: true,
    deployment_updates: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        company_name: userProfile.company_name || '',
        display_name: userProfile.display_name || '',
        email_notifications: userProfile.email_notifications ?? true,
        security_alerts: userProfile.security_alerts ?? true,
        deployment_updates: userProfile.deployment_updates ?? true,
      });
    }
  }, [userProfile]);

  const loading = authLoading || profileLoading;

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await updateProfile({
      full_name: formData.full_name || null,
      company_name: formData.company_name || null,
      display_name: formData.display_name || null,
      email_notifications: formData.email_notifications,
      security_alerts: formData.security_alerts,
      deployment_updates: formData.deployment_updates,
    });

    setSaving(false);

    if (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Your preferences have been saved.',
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const { error } = await uploadLogo(file);
    setUploadingLogo(false);

    if (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Logo uploaded',
        description: 'Your logo has been updated.',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    const { error } = await removeLogo();
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove logo.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Logo removed',
        description: 'Your logo has been removed.',
      });
    }
  };

  const handleRestartTour = async () => {
    if (!user) return;

    const { error } = await updateProfile({
      onboarding_completed: false,
      onboarding_step: 0,
    });

    if (error) {
      console.error('Error restarting tour:', error);
      toast({
        title: 'Error',
        description: 'Failed to restart the tour.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Tour Restarted',
        description: 'Redirecting to the dashboard...',
      });
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayName = formData.display_name || formData.company_name || 'Your Company';
  const logoUrl = userProfile?.logo_url;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <AppLayout title="Preferences" subtitle="Manage your profile and notification settings">
      <div className="max-w-2xl space-y-6">
        {/* Branding / Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription>
              Customize how your organization appears in the sidebar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Preview */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {logoUrl ? (
                  <Avatar className="h-20 w-20 rounded-xl">
                    <AvatarImage src={logoUrl} alt={displayName} className="object-cover" />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{initials}</span>
                  </div>
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  {logoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or WebP. Max 2MB. Recommended: 256x256px.
                </p>
              </div>
            </div>

            <Separator />

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Name shown in sidebar"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                This name appears in the sidebar. Leave empty to use company name.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal and company details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter your company name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Choose what updates you'd like to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive general updates and announcements.
                </p>
              </div>
              <Switch
                checked={formData.email_notifications}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, email_notifications: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Security Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about security issues and vulnerabilities.
                </p>
              </div>
              <Switch
                checked={formData.security_alerts}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, security_alerts: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Deployment Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when deployments occur.
                </p>
              </div>
              <Switch
                checked={formData.deployment_updates}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, deployment_updates: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Tour */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Onboarding Tour
            </CardTitle>
            <CardDescription>
              Restart the guided tour to learn about all features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleRestartTour}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart Tour
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}