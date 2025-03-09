
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

// Define CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request JSON
    const { operation, platformCredentialId, advertiserId } = await req.json();
    
    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );
    
    if (operation === "get_token") {
      // Fetch the credentials
      const { data: credential, error: fetchError } = await supabaseAdmin
        .from("platform_credentials")
        .select("id, platform_id, advertiser_id, refresh_token, access_token, token_expires_at")
        .eq("id", platformCredentialId)
        .single();
      
      if (fetchError) {
        throw new Error(`Error fetching credentials: ${fetchError.message}`);
      }
      
      if (!credential) {
        throw new Error("Credential not found");
      }
      
      // Check if we need to refresh the token
      const currentTime = new Date();
      const tokenExpiresAt = credential.token_expires_at ? new Date(credential.token_expires_at) : null;
      
      // If token is still valid, return it
      if (credential.access_token && tokenExpiresAt && currentTime < tokenExpiresAt) {
        return new Response(
          JSON.stringify({ access_token: credential.access_token }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // We need to refresh the token
      const clientId = Deno.env.get("AMAZON_ADS_CLIENT_ID");
      const clientSecret = Deno.env.get("AMAZON_ADS_CLIENT_SECRET");
      
      if (!clientId || !clientSecret) {
        throw new Error("Missing API credentials");
      }
      
      // Request new access token using refresh token
      const tokenResponse = await fetch("https://api.amazon.com/auth/o2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: credential.refresh_token,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        
        // Log the token refresh error
        await supabaseAdmin.from("token_refresh_logs").insert({
          advertiser_id: credential.advertiser_id,
          platform_id: credential.platform_id,
          operation_type: "refresh_token",
          status: "error",
          error_message: JSON.stringify(errorData),
        });
        
        throw new Error(`Token refresh failed: ${JSON.stringify(errorData)}`);
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      if (!accessToken) {
        throw new Error("No access token in response");
      }
      
      // Calculate expiration time (subtract 5 minutes for safety margin)
      const expiresInSeconds = tokenData.expires_in || 3600;
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds - 300);
      
      // Update the stored token
      const { error: updateError } = await supabaseAdmin
        .from("platform_credentials")
        .update({
          access_token: accessToken,
          token_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", credential.id);
      
      if (updateError) {
        throw new Error(`Error updating token: ${updateError.message}`);
      }
      
      // Log successful token refresh
      await supabaseAdmin.from("token_refresh_logs").insert({
        advertiser_id: credential.advertiser_id,
        platform_id: credential.platform_id,
        operation_type: "refresh_token",
        status: "success",
      });
      
      return new Response(
        JSON.stringify({ access_token: accessToken }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (operation === "list_connected_platforms") {
      // Ensure an advertiser ID was provided
      if (!advertiserId) {
        throw new Error("Advertiser ID is required");
      }
      
      // Get all platforms connected for this advertiser
      const { data: platforms, error: platformsError } = await supabaseAdmin
        .from("platform_credentials")
        .select(`
          id,
          platform:platform_id(id, name, display_name),
          profile_id,
          is_active,
          token_expires_at
        `)
        .eq("advertiser_id", advertiserId);
      
      if (platformsError) {
        throw new Error(`Error fetching platforms: ${platformsError.message}`);
      }
      
      // Check if any tokens are expired
      const currentTime = new Date();
      const formattedPlatforms = platforms.map(platform => {
        const tokenExpiresAt = platform.token_expires_at ? new Date(platform.token_expires_at) : null;
        const isExpired = tokenExpiresAt ? currentTime > tokenExpiresAt : false;
        
        return {
          credential_id: platform.id,
          platform_id: platform.platform.id,
          platform_name: platform.platform.name,
          profile_id: platform.profile_id,
          is_active: platform.is_active,
          token_status: isExpired ? "expired" : "valid"
        };
      });
      
      return new Response(
        JSON.stringify({ platforms: formattedPlatforms }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      throw new Error("Invalid operation");
    }
  } catch (error) {
    console.error(`Token manager error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
