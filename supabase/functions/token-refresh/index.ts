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
    const requestData = await req.json().catch(e => {
      console.error("Request parsing error:", e);
      throw new Error(`Invalid JSON in request: ${e.message}`);
    });
    
    console.log("Token refresh request received:", {
      has_platform_id: !!requestData.platformCredentialId,
      has_refresh_token: !!requestData.refreshToken,
      browser_info: req.headers.get("user-agent")
    });
    
    const { platformCredentialId, refreshToken } = requestData;

    if (!platformCredentialId) {
      return new Response(JSON.stringify({ 
        error: "Missing platform credential ID",
        code: "missing_platform_credential_id" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get Supabase configuration - check both naming conventions
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || 
                       Deno.env.get("PUBLIC_SUPABASE_URL") || "";
    
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || 
                              Deno.env.get("SUPABASE_SERVICE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      console.error("URL present:", !!supabaseUrl);
      console.error("Service key present:", !!supabaseServiceKey);
      
      return new Response(JSON.stringify({ 
        error: "Server configuration error: Missing Supabase configuration",
        code: "missing_supabase_config",
        details: {
          url_present: !!supabaseUrl,
          key_present: !!supabaseServiceKey
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("Creating Supabase client");
    
    // Initialize Supabase client with service role key
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      console.log("Supabase client created successfully");
    } catch (clientError) {
      console.error("Supabase client creation error:", clientError);
      return new Response(JSON.stringify({ 
        error: `Failed to create Supabase client: ${clientError.message}`,
        code: "supabase_client_error"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // If no refresh token provided, get it from the database
    let tokenToUse = refreshToken;
    if (!tokenToUse) {
      console.log("No refresh token provided, fetching from database");
      
      // Fetch platform credentials
      const { data: credentials, error: credentialsError } = await supabase
        .from("platform_credentials")
        .select("refresh_token, client_id, client_secret")
        .eq("id", platformCredentialId)
        .single();

      if (credentialsError || !credentials) {
        console.error("Credentials fetch error:", credentialsError);
        return new Response(JSON.stringify({ 
          error: "Failed to fetch credentials", 
          details: credentialsError?.message,
          code: "credentials_fetch_error" 
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      tokenToUse = credentials.refresh_token;
      
      if (!tokenToUse) {
        console.error("No refresh token found in database");
        return new Response(JSON.stringify({ 
          error: "No refresh token available",
          code: "missing_refresh_token" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      console.log("Requesting new token from Amazon");
      
      // Refresh the access token using the refresh token
      try {
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
          let errorDetails = "";
          
          try {
            const errorData = await tokenResponse.json();
            errorDetails = JSON.stringify(errorData);
          } catch (parseError) {
            errorDetails = await tokenResponse.text().catch(() => "Could not parse response");
          }
          
          console.error("Token response error:", tokenResponse.status, errorDetails);
          
          return new Response(JSON.stringify({ 
            error: "Failed to refresh token", 
            details: errorDetails,
            status: tokenResponse.status,
            code: "token_refresh_failed"
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Parse token response
        const tokenData = await tokenResponse.json().catch(e => {
          console.error("Token response parsing error:", e);
          throw new Error("Invalid JSON in token response");
        });
        
        const accessToken = tokenData.access_token;
        const newRefreshToken = tokenData.refresh_token || tokenToUse;
        
        if (!accessToken) {
          console.error("No access token in response:", tokenData);
          return new Response(JSON.stringify({ 
            error: "No access token returned",
            code: "missing_access_token" 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Calculate token expiration time
        const expiresInSeconds = tokenData.expires_in || 3600;
        const tokenExpiresAt = new Date();
        tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expiresInSeconds);

        console.log("Token obtained successfully, updating database");
        
        // Update credentials in database
        const { error: updateError } = await supabase
          .from("platform_credentials")
          .update({
            access_token: accessToken,
            refresh_token: newRefreshToken,
            token_expires_at: tokenExpiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", platformCredentialId);

        if (updateError) {
          console.error("Error updating credentials:", updateError);
          // Continue anyway since we still have the new token
        }

        // Log the token refresh event
        try {
          await supabase.from("token_refresh_logs").insert({
            platform_credential_id: platformCredentialId,
            operation_type: "automatic_refresh",
            status: "success",
            details: { expires_in_seconds: expiresInSeconds }
          });
        } catch (logError) {
          console.error("Error logging token refresh:", logError);
          // Non-critical, continue
        }

        console.log("Token refresh completed successfully");
        
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
      } catch (tokenFetchError) {
        console.error("Token fetch error:", tokenFetchError);
        return new Response(JSON.stringify({ 
          error: `Error refreshing token: ${tokenFetchError.message}`,
          code: "token_fetch_error" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    
    // This should never be reached if tokenToUse was initially null
    return new Response(JSON.stringify({ 
      error: "Invalid flow path reached",
      code: "invalid_flow" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in token refresh:", error);
    return new Response(JSON.stringify({ 
      error: "Token refresh failed", 
      details: error.message || "Unknown error",
      code: "unhandled_error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}); 