import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-github-event, x-github-delivery, x-hub-signature-256',
};

// Verify GitHub webhook signature
async function verifySignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    return false;
  }

  // GitHub sends signature as "sha256=<hash>"
  const sig = signature.replace('sha256=', '');
  
  // Create HMAC SHA-256 hash
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, payloadData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Compare signatures using constant-time comparison
  if (sig.length !== signatureHex.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < sig.length; i++) {
    result |= sig.charCodeAt(i) ^ signatureHex.charCodeAt(i);
  }
  
  return result === 0;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get webhook secret
    const webhookSecret = Deno.env.get('GITHUB_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.warn('GITHUB_WEBHOOK_SECRET not set - webhook signature verification disabled');
    }

    // Get headers
    const eventType = req.headers.get('x-github-event');
    const deliveryId = req.headers.get('x-github-delivery');
    const signature = req.headers.get('x-hub-signature-256');

    console.log(`Received webhook: ${eventType} (delivery: ${deliveryId})`);

    // Read payload
    const payload = await req.text();
    
    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = await verifySignature(payload, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Parse payload
    const data = JSON.parse(payload);
    
    // Handle different event types
    switch (eventType) {
      case 'installation': {
        const action = data.action;
        const installation = data.installation;
        
        console.log(`Installation ${action}:`, {
          id: installation.id,
          account: installation.account?.login,
        });

        // Handle installation events
        switch (action) {
          case 'created':
            // Installation was created - you might want to sync this to your database
            console.log('New installation created:', installation.id);
            // TODO: Sync installation to database if needed
            break;
            
          case 'deleted':
            // Installation was deleted - clean up related data
            console.log('Installation deleted:', installation.id);
            // TODO: Remove installation from database if needed
            break;
            
          case 'suspend':
            console.log('Installation suspended:', installation.id);
            // TODO: Mark installation as suspended in database
            break;
            
          case 'unsuspend':
            console.log('Installation unsuspended:', installation.id);
            // TODO: Mark installation as active in database
            break;
            
          default:
            console.log(`Unhandled installation action: ${action}`);
        }
        
        return new Response(
          JSON.stringify({ received: true, action, installation_id: installation.id }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'installation_repositories': {
        const action = data.action;
        const installation = data.installation;
        const repositories = data.repositories_added || data.repositories_removed || [];
        
        console.log(`Installation repositories ${action}:`, {
          installation_id: installation.id,
          repositories: repositories.map((r: { full_name: string }) => r.full_name),
        });
        
        // TODO: Sync repository changes to database
        
        return new Response(
          JSON.stringify({ received: true, action, installation_id: installation.id }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
        return new Response(
          JSON.stringify({ received: true, event: eventType }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
