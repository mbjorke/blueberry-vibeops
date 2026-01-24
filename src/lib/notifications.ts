import { supabase } from '@/integrations/supabase/client';

interface NotifyStatusChangeParams {
  projectId: string;
  projectName: string;
  previousStatus: string;
  newStatus: string;
  issues?: string[];
}

interface NotifyDeploymentParams {
  projectId: string;
  projectName: string;
  environment: 'development' | 'staging' | 'production';
  version?: string;
  deployedBy?: string;
  changes?: string[];
}

interface NotificationResult {
  success: boolean;
  notificationsSent?: number;
  error?: string;
}

export async function notifyStatusChange(params: NotifyStatusChangeParams): Promise<NotificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('notify-status-change', {
      body: params,
    });

    if (error) {
      console.error('Error sending status change notification:', error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      notificationsSent: data?.notificationsSent || 0 
    };
  } catch (err: any) {
    console.error('Error invoking notify-status-change:', err);
    return { success: false, error: err.message };
  }
}

export async function notifyDeployment(params: NotifyDeploymentParams): Promise<NotificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('notify-deployment', {
      body: params,
    });

    if (error) {
      console.error('Error sending deployment notification:', error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      notificationsSent: data?.notificationsSent || 0 
    };
  } catch (err: any) {
    console.error('Error invoking notify-deployment:', err);
    return { success: false, error: err.message };
  }
}
