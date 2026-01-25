import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base64URL encode (no padding, URL-safe)
function base64url(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const pemContents = pem
    .replace(/-----BEGIN .*?-----/g, '')
    .replace(/-----END .*?-----/g, '')
    .replace(/\s/g, '');
  
  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function generateAppJWT(): Promise<string> {
  const appId = Deno.env.get('GITHUB_APP_ID');
  let privateKey = Deno.env.get('GITHUB_APP_PRIVATE_KEY');
  const privateKeyBase64 = Deno.env.get('GITHUB_APP_PRIVATE_KEY_BASE64');

  if (!appId) {
    throw new Error('Missing GITHUB_APP_ID');
  }

  // Support both full PEM format and base64-only format (PKCS8)
  if (privateKeyBase64) {
    // Wrap base64 key with PKCS8 PEM markers (from openssl pkcs8 conversion)
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----`;
  } else if (!privateKey) {
    throw new Error('Missing GITHUB_APP_PRIVATE_KEY or GITHUB_APP_PRIVATE_KEY_BASE64');
  }

  // Handle escaped newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
  
  console.log('Generating JWT for App ID:', appId);

  const keyData = pemToArrayBuffer(privateKey);
  
  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now - 60, exp: now + 600, iss: appId };

  const encodedHeader = base64url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(signingInput)
  );

  console.log('JWT generated successfully');
  return `${signingInput}.${base64url(new Uint8Array(signature))}`;
}

async function listInstallations(): Promise<unknown[]> {
  const jwt = await generateAppJWT();
  
  const response = await fetch('https://api.github.com/app/installations', {
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function getInstallationToken(installationId: number): Promise<{ token: string; expires_at: string }> {
  const jwt = await generateAppJWT();

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get installation token: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return { token: data.token, expires_at: data.expires_at };
}

async function getInstallationRepos(installationId: number): Promise<unknown[]> {
  const { token } = await getInstallationToken(installationId);

  const response = await fetch('https://api.github.com/installation/repositories', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get repos: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.repositories || [];
}

async function getRepository(owner: string, repo: string): Promise<unknown> {
  // First get all installations to find the one with access to this repo
  const installations = await listInstallations();
  const repoFullName = `${owner}/${repo}`;
  
  for (const installation of installations as Array<{ id: number }>) {
    try {
      const { token } = await getInstallationToken(installation.id);
      
      // Fetch repository info
      const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // If 404 or 403, try next installation
      if (response.status === 404 || response.status === 403) {
        continue;
      }
      
      // For other errors, throw
      const error = await response.text();
      throw new Error(`Failed to get repository: ${response.status} - ${error}`);
    } catch (error) {
      // Try next installation
      continue;
    }
  }
  
  throw new Error('No installation found with access to this repository');
}

async function getRepoEnvironments(repoFullName: string): Promise<{ environments: unknown[]; total_count: number }> {
  // First get all installations to find the one with access to this repo
  const installations = await listInstallations();
  
  for (const installation of installations as Array<{ id: number }>) {
    try {
      const { token } = await getInstallationToken(installation.id);
      
      // Check if we have access to this repo
      const repoCheck = await fetch(`https://api.github.com/repos/${repoFullName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      
      if (!repoCheck.ok) continue;
      
      // Fetch environments
      const response = await fetch(`https://api.github.com/repos/${repoFullName}/environments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (response.status === 404) {
        // No environments configured or no permission
        return { environments: [], total_count: 0 };
      }
      
      if (response.status === 403) {
        // Missing permission
        throw new Error('MISSING_ENVIRONMENTS_PERMISSION');
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get environments: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return { 
        environments: data.environments || [], 
        total_count: data.total_count || 0 
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'MISSING_ENVIRONMENTS_PERMISSION') {
        throw error;
      }
      // Try next installation
      continue;
    }
  }
  
  throw new Error('No installation found with access to this repository');
}

async function getDependabotAlerts(repoFullName: string): Promise<unknown[]> {
  // First get all installations to find the one with access to this repo
  const installations = await listInstallations();
  
  for (const installation of installations as Array<{ id: number }>) {
    try {
      const { token } = await getInstallationToken(installation.id);
      
      // Check if we have access to this repo
      const repoCheck = await fetch(`https://api.github.com/repos/${repoFullName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      
      if (!repoCheck.ok) continue;
      
      // Fetch Dependabot alerts
      const response = await fetch(`https://api.github.com/repos/${repoFullName}/dependabot/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (response.status === 404) {
        // Dependabot alerts not enabled or no alerts
        return [];
      }
      
      if (response.status === 403) {
        // Missing permission - need "Security events: Read" permission
        throw new Error('MISSING_DEPENDABOT_PERMISSION');
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get Dependabot alerts: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      if (error instanceof Error && error.message === 'MISSING_DEPENDABOT_PERMISSION') {
        throw error;
      }
      // Try next installation
      continue;
    }
  }
  
  throw new Error('No installation found with access to this repository');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'test': {
        const appId = Deno.env.get('GITHUB_APP_ID');
        const keyLength = Deno.env.get('GITHUB_APP_PRIVATE_KEY')?.length || 0;
        const keyBase64Length = Deno.env.get('GITHUB_APP_PRIVATE_KEY_BASE64')?.length || 0;
        return new Response(
          JSON.stringify({ status: 'ok', appId, keyLength, keyBase64Length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list-installations': {
        const installations = await listInstallations();
        return new Response(
          JSON.stringify({ installations }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-token': {
        const installationId = url.searchParams.get('installation_id');
        if (!installationId) {
          return new Response(
            JSON.stringify({ error: 'installation_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const tokenData = await getInstallationToken(parseInt(installationId));
        return new Response(
          JSON.stringify(tokenData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list-repos': {
        const installationId = url.searchParams.get('installation_id');
        if (!installationId) {
          return new Response(
            JSON.stringify({ error: 'installation_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const repos = await getInstallationRepos(parseInt(installationId));
        return new Response(
          JSON.stringify({ repositories: repos }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-repo': {
        const owner = url.searchParams.get('owner');
        const repo = url.searchParams.get('repo');
        if (!owner || !repo) {
          return new Response(
            JSON.stringify({ error: 'owner and repo parameters are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        try {
          const repository = await getRepository(owner, repo);
          return new Response(
            JSON.stringify({ repository }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          return new Response(
            JSON.stringify({ error: message }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'list-environments': {
        const repoFullName = url.searchParams.get('repo');
        if (!repoFullName) {
          return new Response(
            JSON.stringify({ error: 'repo parameter is required (format: owner/repo)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        try {
          const envData = await getRepoEnvironments(repoFullName);
          return new Response(
            JSON.stringify(envData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          if (error instanceof Error && error.message === 'MISSING_ENVIRONMENTS_PERMISSION') {
            return new Response(
              JSON.stringify({ 
                error: 'Missing GitHub App permission',
                errorCode: 'MISSING_ENVIRONMENTS_PERMISSION',
                message: "The GitHub App needs 'Environments: Read' permission to view environments."
              }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          throw error;
        }
      }

      case 'list-dependabot-alerts': {
        const repoFullName = url.searchParams.get('repo');
        if (!repoFullName) {
          return new Response(
            JSON.stringify({ error: 'repo parameter is required (format: owner/repo)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        try {
          const alerts = await getDependabotAlerts(repoFullName);
          return new Response(
            JSON.stringify({ alerts }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          if (error instanceof Error && error.message === 'MISSING_DEPENDABOT_PERMISSION') {
            return new Response(
              JSON.stringify({ 
                error: 'Missing GitHub App permission',
                errorCode: 'MISSING_DEPENDABOT_PERMISSION',
                message: "The GitHub App needs 'Security events: Read' permission to view Dependabot alerts."
              }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          const message = error instanceof Error ? error.message : 'Unknown error';
          return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({ 
            error: 'Invalid action',
            available_actions: ['test', 'list-installations', 'get-token', 'list-repos', 'get-repo', 'list-environments', 'list-dependabot-alerts']
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('GitHub App Auth Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});