import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const projectSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(100, 'Name must be less than 100 characters'),
  industry: z.string().trim().min(1, 'Industry is required').max(50, 'Industry must be less than 50 characters'),
  description: z.string().trim().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['healthy', 'warning', 'critical']),
  logo_initial: z.string().trim().min(1, 'Logo initial is required').max(2, 'Maximum 2 characters'),
  logo_color: z.string().min(1, 'Logo color is required'),
});

type ProjectSettingsFormData = z.infer<typeof projectSettingsSchema>;

interface DbProject {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  status: string;
  github_url: string | null;
  full_name: string | null;
}

const INDUSTRY_OPTIONS = [
  'Software',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Media',
  'Travel',
  'Real Estate',
  'Marketing',
  'Other',
];

const LOGO_COLORS = [
  { value: 'bg-primary', label: 'Blue', preview: 'bg-primary' },
  { value: 'bg-success', label: 'Green', preview: 'bg-success' },
  { value: 'bg-warning', label: 'Orange', preview: 'bg-warning' },
  { value: 'bg-danger', label: 'Red', preview: 'bg-danger' },
  { value: 'bg-purple-500', label: 'Purple', preview: 'bg-purple-500' },
  { value: 'bg-pink-500', label: 'Pink', preview: 'bg-pink-500' },
  { value: 'bg-cyan-500', label: 'Cyan', preview: 'bg-cyan-500' },
  { value: 'bg-slate-600', label: 'Slate', preview: 'bg-slate-600' },
];

export default function ProjectSettings() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<DbProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ProjectSettingsFormData>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      name: '',
      industry: 'Software',
      description: '',
      status: 'healthy',
      logo_initial: '',
      logo_color: 'bg-primary',
    },
  });

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;

      try {
        const { data, error } = await supabase
          .from('repositories')
          .select('id, name, description, language, status, github_url, full_name')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        setProject(data);
        form.reset({
          name: data.name,
          industry: data.language || 'Software',
          description: data.description || '',
          status: (data.status as 'healthy' | 'warning' | 'critical') || 'healthy',
          logo_initial: data.name.charAt(0).toUpperCase(),
          logo_color: 'bg-primary',
        });
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project settings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId, form, toast]);

  const onSubmit = async (data: ProjectSettingsFormData) => {
    if (!projectId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('repositories')
        .update({
          name: data.name,
          description: data.description || null,
          status: data.status,
        })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Project settings have been updated successfully.',
      });

      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;

    setIsDeleting(true);
    try {
      // Delete related data first
      await supabase
        .from('client_repos')
        .delete()
        .eq('repo_id', projectId);

      await supabase
        .from('activity_events')
        .delete()
        .eq('project_id', projectId);

      // Delete the repository
      const { error } = await supabase
        .from('repositories')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Project deleted',
        description: 'The project has been permanently deleted.',
      });

      navigate('/');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </header>
        <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const watchedLogoInitial = form.watch('logo_initial');
  const watchedLogoColor = form.watch('logo_color');

  return (
    <div className="min-h-screen bg-dashboard">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/project/${projectId}`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Project</span>
              </Button>
              
              <div className="h-6 w-px bg-border" />
              
              <h1 className="font-semibold text-lg">Project Settings</h1>
            </div>

            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={saving || !form.formState.isDirty}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Basic project details and configuration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDUSTRY_OPTIONS.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the project..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional. A short description of what this project is about.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="healthy">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-success" />
                              Healthy
                            </div>
                          </SelectItem>
                          <SelectItem value="warning">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-warning" />
                              Warning
                            </div>
                          </SelectItem>
                          <SelectItem value="critical">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-danger" />
                              Critical
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The overall health status of this project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how your project looks in the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-6">
                  {/* Logo Preview */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      'w-16 h-16 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl',
                      watchedLogoColor
                    )}>
                      {watchedLogoInitial || '?'}
                    </div>
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>

                  <div className="flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name="logo_initial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo Initial(s)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="AB" 
                              maxLength={2}
                              className="w-24 uppercase"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormDescription>
                            1-2 characters displayed in the project logo.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="logo_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo Color</FormLabel>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {LOGO_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => field.onChange(color.value)}
                                className={cn(
                                  'w-8 h-8 rounded-lg transition-all',
                                  color.preview,
                                  field.value === color.value 
                                    ? 'ring-2 ring-offset-2 ring-primary' 
                                    : 'hover:scale-110'
                                )}
                                title={color.label}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GitHub Info (read-only) */}
            {project.github_url && (
              <Card>
                <CardHeader>
                  <CardTitle>GitHub Repository</CardTitle>
                  <CardDescription>
                    This project is linked to a GitHub repository.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Repository:</span>
                    <a 
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {project.full_name || project.github_url}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Danger Zone */}
            <Card className="border-danger/50">
              <CardHeader>
                <CardTitle className="text-danger">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that permanently affect your project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Project</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this project and all associated data.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{project.name}</strong>? This will permanently remove all associated data including activity events and client assignments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
