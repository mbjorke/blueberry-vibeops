import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeploymentNotificationRequest {
  projectId: string;
  projectName: string;
  environment: 'development' | 'staging' | 'production';
  version?: string;
  deployedBy?: string;
  changes?: string[];
}

const getEnvironmentColor = (env: string): string => {
  switch (env) {
    case 'production': return '#ef4444';
    case 'staging': return '#f59e0b';
    case 'development': return '#3b82f6';
    default: return '#6b7280';
  }
};

const getEnvironmentEmoji = (env: string): string => {
  switch (env) {
    case 'production': return '🚀';
    case 'staging': return '🔶';
    case 'development': return '🔵';
    default: return '📦';
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      projectId, 
      projectName, 
      environment, 
      version, 
      deployedBy,
      changes 
    }: DeploymentNotificationRequest = await req.json();

    // Get all users assigned to this project
    const { data: clientProjects, error: cpError } = await supabase
      .from('client_projects')
      .select('user_id')
      .eq('project_id', projectId);

    if (cpError) {
      console.error("Error fetching client projects:", cpError);
      throw cpError;
    }

    if (!clientProjects || clientProjects.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users assigned to this project" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userIds = clientProjects.map(cp => cp.user_id);

    // Get profiles with deployment_updates enabled
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name, deployment_updates')
      .in('user_id', userIds)
      .eq('deployment_updates', true);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with deployment updates enabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const envColor = getEnvironmentColor(environment);
    const envEmoji = getEnvironmentEmoji(environment);
    const timestamp = new Date().toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });

    // Send emails to all eligible users
    const emailPromises = profiles.map(profile => 
      resend.emails.send({
        from: "VibeOps Deployments <onboarding@resend.dev>",
        to: [profile.email],
        subject: `${envEmoji} ${projectName} deployed to ${environment}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { text-align: center; margin-bottom: 32px; }
              .logo { font-size: 28px; font-weight: bold; color: #3b82f6; }
              .deploy-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
              .deploy-title { font-size: 20px; font-weight: 600; margin: 0 0 16px 0; }
              .env-badge { display: inline-block; background: ${envColor}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 14px; font-weight: 600; text-transform: uppercase; }
              .details-grid { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin-top: 16px; }
              .detail-label { color: #64748b; font-size: 14px; }
              .detail-value { font-weight: 500; }
              .changes-list { background: white; border-radius: 8px; padding: 16px; margin-top: 16px; border: 1px solid #e2e8f0; }
              .change-item { padding: 6px 0; color: #374151; font-size: 14px; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
              .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 32px; }
              .success-icon { font-size: 48px; margin-bottom: 16px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🛡️ VibeOps</div>
              </div>
              
              <div class="deploy-box">
                <div style="text-align: center;" class="success-icon">✅</div>
                <h2 class="deploy-title" style="text-align: center;">Deployment Successful</h2>
                
                <p style="text-align: center;">Hi ${profile.full_name || 'there'},</p>
                <p style="text-align: center;"><strong>${projectName}</strong> has been successfully deployed.</p>
                
                <p style="text-align: center; margin: 20px 0;">
                  <span class="env-badge">${environment}</span>
                </p>
                
                <div class="details-grid">
                  <span class="detail-label">Deployed at:</span>
                  <span class="detail-value">${timestamp}</span>
                  
                  ${version ? `
                    <span class="detail-label">Version:</span>
                    <span class="detail-value">${version}</span>
                  ` : ''}
                  
                  ${deployedBy ? `
                    <span class="detail-label">Deployed by:</span>
                    <span class="detail-value">${deployedBy}</span>
                  ` : ''}
                </div>
                
                ${changes && changes.length > 0 ? `
                  <div class="changes-list">
                    <p style="margin: 0 0 12px 0; font-weight: 600;">What's new:</p>
                    ${changes.map(change => `<div class="change-item">• ${change}</div>`).join('')}
                  </div>
                ` : ''}
              </div>
              
              <p style="text-align: center;">
                <a href="https://vibeops.app/project/${projectId}" class="button">
                  View Project
                </a>
              </p>
              
              <div class="footer">
                <p>You're receiving this because you have deployment updates enabled.</p>
                <p>Manage your notification preferences in your <a href="https://vibeops.app/preferences">account settings</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Deployment notifications: ${successful} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent: successful,
        notificationsFailed: failed 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-deployment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
