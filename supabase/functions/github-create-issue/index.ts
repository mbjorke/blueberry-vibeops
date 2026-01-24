import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateIssueRequest {
  repoFullName: string; // e.g., "owner/repo"
  title: string;
  body: string;
  labels?: string[];
}

interface DependabotAlertRequest {
  repoFullName: string;
  alertNumber?: number;
}

// Generate GitHub App JWT
async function generateAppJWT(): Promise<string> {
  const appId = Deno.env.get("GITHUB_APP_ID");
  const privateKeyPem = Deno.env.get("GITHUB_APP_PRIVATE_KEY");

  if (!appId || !privateKeyPem) {
    throw new Error("Missing GitHub App credentials");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 600,
    iss: appId,
  };

  // Convert PEM to binary
  const pemContents = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
    .replace(/-----END RSA PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Create JWT
  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signatureInput = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, signatureInput);
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// Get installation token for a repository
async function getInstallationToken(repoFullName: string): Promise<string> {
  const jwt = await generateAppJWT();
  
  // Get installations
  const installationsRes = await fetch("https://api.github.com/app/installations", {
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!installationsRes.ok) {
    throw new Error(`Failed to get installations: ${await installationsRes.text()}`);
  }

  const installations = await installationsRes.json();
  
  // Find installation that has access to this repo
  for (const installation of installations) {
    const tokenRes = await fetch(
      `https://api.github.com/app/installations/${installation.id}/access_tokens`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${jwt}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (tokenRes.ok) {
      const tokenData = await tokenRes.json();
      
      // Check if this installation has access to the repo
      const repoCheckRes = await fetch(
        `https://api.github.com/repos/${repoFullName}`,
        {
          headers: {
            "Authorization": `Bearer ${tokenData.token}`,
            "Accept": "application/vnd.github+json",
          },
        }
      );

      if (repoCheckRes.ok) {
        return tokenData.token;
      }
    }
  }

  throw new Error("No installation found with access to this repository");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    if (action === "create-issue") {
      const { repoFullName, title, body: issueBody, labels } = body as CreateIssueRequest;

      if (!repoFullName || !title) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: repoFullName, title" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = await getInstallationToken(repoFullName);

      // Create the issue
      const issueRes = await fetch(
        `https://api.github.com/repos/${repoFullName}/issues`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            body: issueBody || "",
            labels: labels || ["security", "automated"],
          }),
        }
      );

      if (!issueRes.ok) {
        const errorText = await issueRes.text();
        const errorData = JSON.parse(errorText);
        
        // Check for permission error specifically
        if (issueRes.status === 403 && errorData.message?.includes("Resource not accessible")) {
          return new Response(
            JSON.stringify({
              error: "Missing GitHub App permission",
              errorCode: "MISSING_ISSUES_PERMISSION",
              message: "The GitHub App needs 'Issues: Read and write' permission to create issues.",
            }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        throw new Error(`Failed to create issue: ${errorText}`);
      }

      const issue = await issueRes.json();

      return new Response(
        JSON.stringify({
          success: true,
          issue: {
            number: issue.number,
            url: issue.html_url,
            title: issue.title,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "trigger-dependabot") {
      const { repoFullName } = body as DependabotAlertRequest;

      if (!repoFullName) {
        return new Response(
          JSON.stringify({ error: "Missing required field: repoFullName" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = await getInstallationToken(repoFullName);

      // Enable Dependabot security updates if not already enabled
      await fetch(
        `https://api.github.com/repos/${repoFullName}/automated-security-fixes`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      // Also trigger vulnerability alerts to be enabled
      await fetch(
        `https://api.github.com/repos/${repoFullName}/vulnerability-alerts`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: "Dependabot security updates enabled. Dependabot will automatically create PRs for vulnerable dependencies.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'create-issue' or 'trigger-dependabot'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
