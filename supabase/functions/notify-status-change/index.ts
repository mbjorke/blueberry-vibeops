import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StatusChangeRequest {
  projectId: string;
  projectName: string;
  previousStatus: string;
  newStatus: string;
  issues?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { projectId, projectName, previousStatus, newStatus, issues }: StatusChangeRequest = await req.json();

    // Only send notifications for critical status changes
    if (newStatus !== 'critical') {
      return new Response(
        JSON.stringify({ message: "Notification only sent for critical status" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    // Get profiles with security_alerts enabled
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name, security_alerts')
      .in('user_id', userIds)
      .eq('security_alerts', true);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with security alerts enabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send emails to all eligible users
    const emailPromises = profiles.map(profile => 
      resend.emails.send({
        from: "VibeOps Alerts <onboarding@resend.dev>",
        to: [profile.email],
        subject: `🚨 Critical Alert: ${projectName} requires immediate attention`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { text-align: center; margin-bottom: 32px; }
              .logo { font-size: 28px; font-weight: bold; color: #ef4444; }
              .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
              .alert-title { color: #dc2626; font-size: 20px; font-weight: 600; margin: 0 0 12px 0; }
              .status-badge { display: inline-block; background: #ef4444; color: white; padding: 4px 12px; border-radius: 16px; font-size: 14px; font-weight: 600; }
              .previous-badge { display: inline-block; background: #e5e7eb; color: #374151; padding: 4px 12px; border-radius: 16px; font-size: 14px; text-decoration: line-through; }
              .issues-list { background: white; border-radius: 8px; padding: 16px; margin-top: 16px; }
              .issue-item { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
              .issue-item:last-child { border-bottom: none; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
              .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 32px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🛡️ VibeOps Alert</div>
              </div>
              
              <div class="alert-box">
                <h2 class="alert-title">Critical Status Alert</h2>
                <p>Hi ${profile.full_name || 'there'},</p>
                <p>The project <strong>${projectName}</strong> has changed to critical status and requires your immediate attention.</p>
                
                <p style="margin: 16px 0;">
                  Status: <span class="previous-badge">${previousStatus}</span> → <span class="status-badge">Critical</span>
                </p>
                
                ${issues && issues.length > 0 ? `
                  <div class="issues-list">
                    <p style="margin: 0 0 12px 0; font-weight: 600;">Active Issues:</p>
                    ${issues.map(issue => `<div class="issue-item">⚠️ ${issue}</div>`).join('')}
                  </div>
                ` : ''}
              </div>
              
              <p style="text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://vibeops.app'}/project/${projectId}" class="button">
                  View Project Details
                </a>
              </p>
              
              <div class="footer">
                <p>You're receiving this because you have security alerts enabled.</p>
                <p>Manage your notification preferences in your <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://vibeops.app'}/preferences">account settings</a>.</p>
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

    console.log(`Status change notifications: ${successful} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent: successful,
        notificationsFailed: failed 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-status-change:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
