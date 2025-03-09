import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// The URL to which Amazon redirects after login
const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";
const REDIRECT_URI = isDevelopment
  ? "http://localhost:8080/#/api/amazon-callback"
  : "https://www.adspirer.com/#/api/amazon-callback";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, advertiserId, useTestAccount } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: "Authorization code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!advertiserId) {
      return new Response(
        JSON.stringify({ success: false, error: "Advertiser ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get credentials from environment
    const clientId = Deno.env.get("AMAZON_ADS_CLIENT_ID");
    const clientSecret = Deno.env.get("AMAZON_ADS_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ success: false, error: "Amazon API credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://api.amazon.com/auth/o2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange error:", errorData);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to exchange token: ${JSON.stringify(errorData)}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const tokenData = await tokenResponse.json();
    const refreshToken = tokenData.refresh_token;
    const accessToken = tokenData.access_token;
    
    if (!refreshToken || !accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Token response missing required tokens" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Calculate token expiration time
    const expiresInSeconds = tokenData.expires_in || 3600;
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expiresInSeconds);
    
    // Create a Supabase client for database operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Supabase configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch Amazon Advertising profiles using the access token
    const profilesResponse = await fetch("https://advertising-api.amazon.com/v2/profiles", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": clientId,
      },
    });
    
    if (!profilesResponse.ok) {
      const profilesError = await profilesResponse.json();
      console.error("Profiles fetch error:", profilesError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch profiles: ${JSON.stringify(profilesError)}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const profiles = await profilesResponse.json();
    let profileId = null;
    
    if (profiles && profiles.length > 0) {
      // Use the first profile by default
      profileId = profiles[0].profileId;
      console.log(`Using profile ID: ${profileId}`);
    } else {
      console.warn("No profiles found in Amazon Advertising account");
    }
    
    // Find or create Amazon platform in database
    const { data: platformData, error: platformError } = await supabase
      .from("ad_platforms")
      .select("id")
      .eq("name", "amazon")
      .single();
    
    let platformId = platformData?.id;
    
    if (platformError || !platformId) {
      // Insert platform record if it doesn't exist
      const { data: newPlatform, error: createError } = await supabase
        .from("ad_platforms")
        .insert({
          name: "amazon",
          display_name: "Amazon Ads",
          api_base_url: "https://advertising-api.amazon.com"
        })
        .select()
        .single();
      
      if (createError) {
        return new Response(
          JSON.stringify({ success: false, error: `Failed to create platform record: ${createError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      platformId = newPlatform.id;
    }
    
    // Store/update credentials in the database
    const { error: credentialError } = await supabase
      .from("platform_credentials")
      .upsert({
        advertiser_id: advertiserId,
        platform_id: platformId,
        profile_id: profileId,
        refresh_token: refreshToken,
        access_token: accessToken,
        token_expires_at: tokenExpiresAt.toISOString(),
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "advertiser_id,platform_id"
      });
    
    if (credentialError) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to store credentials: ${credentialError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Log successful connection
    await supabase.from("token_refresh_logs").insert({
      advertiser_id: advertiserId,
      platform_id: platformId,
      operation_type: "initial_connection",
      status: "success",
    });
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Amazon Ads connection successful",
        profileId: profileId
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in token exchange:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}); 