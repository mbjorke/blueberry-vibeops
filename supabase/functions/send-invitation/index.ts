import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  assignedProjects: string[];
  invitedBy: string;
  organizationId?: string; // New: for org-scoped invitations
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, assignedProjects, invitedBy, organizationId }: InvitationRequest = await req.json();

    if (!email || !invitedBy) {
      return new Response(
        JSON.stringify({ error: "Email and invitedBy are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create invitation record with organization context
    const invitationData: Record<string, unknown> = {
      email,
      assigned_projects: assignedProjects || [],
      invited_by: invitedBy,
    };
    
    // Add organization_id if provided
    if (organizationId) {
      invitationData.organization_id = organizationId;
    }

    const { data: invitation, error: dbError } = await supabase
      .from("invitations")
      .insert(invitationData)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get inviter's profile for personalization
    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("full_name, company_name")
      .eq("user_id", invitedBy)
      .single();

    // Get organization name if available
    let organizationName = "";
    if (organizationId) {
      const { data: org } = await supabase
        .from("clients")
        .select("name")
        .eq("id", organizationId)
        .single();
      organizationName = org?.name || "";
    }

    const inviterName = inviterProfile?.full_name || "An administrator";
    const baseUrl = req.headers.get("origin") || "https://vibeops.app";
    const signupUrl = `${baseUrl}/signup?token=${invitation.token}`;

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "VibeOps <onboarding@resend.dev>",
      to: [email],
      subject: "You've been invited to VibeOps",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #3b82f6; }
            .content { background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 32px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
            .footer { text-align: center; color: #64748b; font-size: 14px; }
            .projects { background: white; border-radius: 8px; padding: 16px; margin: 20px 0; }
            .project-badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 16px; font-size: 14px; margin: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🛡️ VibeOps</div>
            </div>
            <div class="content">
              <h2>You're Invited!</h2>
              <p>${inviterName} has invited you to join ${organizationName ? `<strong>${organizationName}</strong> on ` : ''}VibeOps, your security and compliance monitoring portal.</p>
              ${assignedProjects && assignedProjects.length > 0 ? `
                <div class="projects">
                  <p style="margin: 0 0 12px 0; font-weight: 600;">You'll have access to:</p>
                  ${assignedProjects.map(p => `<span class="project-badge">${p}</span>`).join('')}
                </div>
              ` : ''}
              <p style="text-align: center; margin-top: 32px;">
                <a href="${signupUrl}" class="button">Accept Invitation</a>
              </p>
              <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
                This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
              </p>
            </div>
            <div class="footer">
              <p>VibeOps - Security & Compliance Monitoring</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Invitation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, invitation: { id: invitation.id, email } }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
