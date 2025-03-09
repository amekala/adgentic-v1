
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// The URL to which Amazon redirects after login - must match whitelist in Amazon developer console
const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";
const REDIRECT_URI = isDevelopment
  ? "http://localhost:8080/api/amazon-callback"
  : "https://www.adspirer.com/api/amazon-callback";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request info for debugging
    console.log("Token exchange function called");
    
    // Get request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed successfully");
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to parse request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { code, advertiserId, useTestAccount } = requestBody;
    console.log("Parsed request parameters:", { 
      hasCode: !!code, 
      hasAdvertiserId: !!advertiserId,
      useTestAccount: !!useTestAccount,
      code: code ? code.substring(0, 10) + "..." : null
    });

    if (!code) {
      console.error("Missing code parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Authorization code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!advertiserId) {
      console.error("Missing advertiserId parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Advertiser ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get credentials from environment
    const clientId = Deno.env.get("AMAZON_ADS_CLIENT_ID");
    const clientSecret = Deno.env.get("AMAZON_ADS_CLIENT_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Environment variables:", { 
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      redirectUri: REDIRECT_URI
    });

    if (!clientId || !clientSecret) {
      console.error("Missing Amazon API credentials in environment");
      return new Response(
        JSON.stringify({ success: false, error: "Amazon API credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construct token exchange request
    const tokenParams = {
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
    };
    
    console.log("Sending token exchange request with params:", {
      ...tokenParams,
      client_secret: "REDACTED",
      code: code.substring(0, 5) + "..." // Only log part of the code for security
    });
    
    // Define tokenResponse outside the try block so it's accessible later
    let tokenResponse;
    let tokenData;
    
    try {
      // Exchange authorization code for tokens
      tokenResponse = await fetch("https://api.amazon.com/auth/o2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(tokenParams),
      });
      
      console.log("Token exchange response status:", tokenResponse.status);
      
      if (!tokenResponse.ok) {
        let errorData;
        try {
          errorData = await tokenResponse.json();
          console.error("Token exchange error:", errorData);
        } catch (e) {
          // If can't parse JSON, get text
          const errorText = await tokenResponse.text();
          console.error("Token exchange error (text):", errorText);
          errorData = { error: "Error parsing response", details: errorText };
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to exchange token: ${JSON.stringify(errorData)}`,
            statusCode: tokenResponse.status
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Parse the token data
      try {
        tokenData = await tokenResponse.json();
        console.log("Token data received:", {
          has_refresh_token: !!tokenData.refresh_token,
          has_access_token: !!tokenData.access_token,
          expires_in: tokenData.expires_in
        });
      } catch (e) {
        console.error("Error parsing token response:", e);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to parse token response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (fetchError) {
      console.error("Fetch error during token exchange:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: `Network error: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
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
    
    // Check for required Supabase configuration
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ success: false, error: "Supabase configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create a Supabase client for database operations
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      console.log("Supabase client created successfully");
    } catch (error) {
      console.error("Error creating Supabase client:", error);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create Supabase client: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // First, check if the advertiser exists in the database
    const { data: advertiserData, error: advertiserError } = await supabase
      .from("advertisers")
      .select("id")
      .eq("id", advertiserId)
      .single();
      
    if (advertiserError) {
      console.log("Advertiser not found, creating a new one for demo purposes");
      
      // If this is a test account, create a test advertiser
      if (useTestAccount) {
        const { error: createError } = await supabase
          .from("advertisers")
          .insert({
            id: advertiserId,
            name: "Test Advertiser",
            status: "active",
            created_at: new Date().toISOString()
          });
          
        if (createError) {
          console.error("Failed to create test advertiser:", createError);
          return new Response(
            JSON.stringify({ success: false, error: `Failed to create test advertiser: ${createError.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        console.log("Created test advertiser with ID:", advertiserId);
      } else {
        console.error("Advertiser not found:", advertiserError);
        return new Response(
          JSON.stringify({ success: false, error: `Advertiser not found: ${advertiserError.message}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
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
    console.log("Looking for Amazon platform in database");
    let platformId;
    
    try {
      const { data: platformData, error: platformError } = await supabase
        .from("ad_platforms")
        .select("id")
        .eq("name", "amazon")
        .single();
      
      if (platformError) {
        console.log("Platform not found, will create new record:", platformError.message);
      } else {
        platformId = platformData?.id;
        console.log("Found Amazon platform with ID:", platformId);
      }
      
      if (!platformId) {
        // Insert platform record if it doesn't exist
        console.log("Creating new Amazon platform record");
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
          console.error("Error creating platform record:", createError);
          return new Response(
            JSON.stringify({ success: false, error: `Failed to create platform record: ${createError.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        platformId = newPlatform.id;
        console.log("Created new Amazon platform with ID:", platformId);
      }
    } catch (dbError) {
      console.error("Database error while finding/creating platform:", dbError);
      return new Response(
        JSON.stringify({ success: false, error: `Database error: ${dbError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Store/update credentials in the database
    try {
      console.log("Storing credentials in database for advertiser:", advertiserId);
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
        console.error("Error storing credentials:", credentialError);
        return new Response(
          JSON.stringify({ success: false, error: `Failed to store credentials: ${credentialError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log successful connection
      try {
        console.log("Logging successful connection");
        await supabase.from("token_refresh_logs").insert({
          advertiser_id: advertiserId,
          platform_id: platformId,
          operation_type: "initial_connection",
          status: "success",
        });
      } catch (logError) {
        // Non-fatal error, just log it
        console.error("Error logging token refresh:", logError);
      }
      
      // Return success response
      console.log("Token exchange completed successfully");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Amazon Ads connection successful",
          profileId: profileId
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (dbError) {
      console.error("Database error while storing credentials:", dbError);
      return new Response(
        JSON.stringify({ success: false, error: `Database error: ${dbError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in token exchange:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}); 
