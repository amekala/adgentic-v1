import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";
import { corsHeaders } from '../_shared/cors.ts';

const AMAZON_TOKEN_ENDPOINT = "https://api.amazon.com/auth/o2/token";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Parse request data
    const requestData = await req.json();
    const { platformCredentialId, refreshToken } = requestData;

    if (!platformCredentialId) {
      return new Response(JSON.stringify({ error: "Missing platform credential ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get Supabase configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If no refresh token provided, get it from the database
    let tokenToUse = refreshToken;
    if (!tokenToUse) {
      // Fetch platform credentials
      const { data: credentials, error: credentialsError } = await supabase
        .from("platform_credentials")
        .select("refresh_token, client_id, client_secret")
        .eq("id", platformCredentialId)
        .single();

      if (credentialsError || !credentials) {
        return new Response(JSON.stringify({ 
          error: "Failed to fetch credentials", 
          details: credentialsError?.message 
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      tokenToUse = credentials.refresh_token;
      
      if (!tokenToUse) {
        return new Response(JSON.stringify({ error: "No refresh token available" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Refresh the access token using the refresh token
      const tokenResponse = await fetch(AMAZON_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: tokenToUse,
          client_id: credentials.client_id,
          client_secret: credentials.client_secret
        })
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({ error: "Unknown token error" }));
        return new Response(JSON.stringify({ 
          error: "Failed to refresh token", 
          details: errorData,
          status: tokenResponse.status
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Parse token response
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const newRefreshToken = tokenData.refresh_token || tokenToUse;
      
      if (!accessToken) {
        return new Response(JSON.stringify({ error: "No access token returned" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Calculate token expiration time
      const expiresInSeconds = tokenData.expires_in || 3600;
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expiresInSeconds);

      // Update credentials in database
      const { error: updateError } = await supabase
        .from("platform_credentials")
        .update({
          access_token: accessToken,
          refresh_token: newRefreshToken,
          token_expires_at: tokenExpiresAt.toISOString()
        })
        .eq("id", platformCredentialId);

      if (updateError) {
        console.error("Error updating credentials:", updateError);
        // Continue anyway since we still have the new token
      }

      // Return the new tokens
      return new Response(JSON.stringify({
        access_token: accessToken,
        refresh_token: newRefreshToken,
        expires_at: tokenExpiresAt.toISOString(),
        success: true
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error in token refresh:", error);
    return new Response(JSON.stringify({ 
      error: "Token refresh failed", 
      details: error.message || "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}); 