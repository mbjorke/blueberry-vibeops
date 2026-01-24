import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, email, fullName }: WelcomeEmailRequest = await req.json();

    // Check if welcome email already sent
    const { data: profile } = await supabase
      .from("profiles")
      .select("welcome_email_sent")
      .eq("user_id", userId)
      .single();

    if (profile?.welcome_email_sent) {
      return new Response(
        JSON.stringify({ message: "Welcome email already sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const firstName = fullName?.split(" ")[0] || "there";

    const emailResponse = await resend.emails.send({
      from: "VibeOps <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to VibeOps! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #3b82f6; width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">V</span>
            </div>
            <h1 style="color: #1a1a2e; margin: 0; font-size: 28px;">Welcome to VibeOps!</h1>
          </div>
          
          <p style="font-size: 18px; color: #4a5568;">Hi ${firstName}! 👋</p>
          
          <p>We're thrilled to have you on board. Your account has been created successfully, and you now have access to monitor your projects' security, compliance, and deployment status.</p>
          
          <div style="background: #f7fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="color: #3b82f6; margin-top: 0; font-size: 18px;">Here's what you can do:</h2>
            <ul style="color: #4a5568; padding-left: 20px;">
              <li style="margin-bottom: 8px;"><strong>View Project Status</strong> - Monitor your projects' health in real-time</li>
              <li style="margin-bottom: 8px;"><strong>Security Reports</strong> - Access detailed security scan results</li>
              <li style="margin-bottom: 8px;"><strong>Deployment History</strong> - Track all deployments across environments</li>
              <li style="margin-bottom: 8px;"><strong>GDPR Compliance</strong> - Review compliance checklists</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}/portal" 
               style="background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Go to Your Portal
            </a>
          </div>
          
          <p style="color: #718096; font-size: 14px;">If you have any questions, our team is here to help. Simply reply to this email.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
          
          <p style="color: #a0aec0; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} VibeOps. All rights reserved.<br>
            You're receiving this email because you signed up for VibeOps.
          </p>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent:", emailResponse);

    // Mark welcome email as sent
    await supabase
      .from("profiles")
      .update({ welcome_email_sent: true })
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);