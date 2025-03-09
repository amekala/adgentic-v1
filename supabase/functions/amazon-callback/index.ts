
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

// Available redirect URIs that can be used for the OAuth flow
const ALLOWED_REDIRECT_URIS = {
  supabase: "https://wllhsxoabzdzulomizzx.functions.supabase.co/amazon-callback",
  adspirer: "https://www.adspirer.com/api/amazon-callback"
};

// This function handles the OAuth callback from Amazon Advertising API
serve(async (req) => {
  try {
    // Get the URL parameters from the request
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");
    
    // If there's an error in the callback, redirect to error page
    if (error) {
      console.error(`Auth error: ${error}: ${errorDescription}`);
      return redirectToErrorPage(`Authentication error: ${error}. ${errorDescription}`);
    }
    
    // Verify required parameters
    if (!code || !stateParam) {
      console.error("Missing code or state parameter");
      return redirectToErrorPage("Missing required parameters for authentication.");
    }
    
    // Decode and parse the state parameter
    let state;
    try {
      state = JSON.parse(atob(stateParam));
    } catch (e) {
      console.error("Failed to parse state parameter:", e);
      return redirectToErrorPage("Invalid state parameter.");
    }
    
    const { advertiserId, redirectOrigin, useTestAccount, callbackType } = state;
    
    if (!advertiserId) {
      console.error("Missing advertiser ID in state");
      return redirectToErrorPage("Missing advertiser information.");
    }
    
    // Get configuration from environment variables
    const clientId = Deno.env.get("AMAZON_ADS_CLIENT_ID");
    const clientSecret = Deno.env.get("AMAZON_ADS_CLIENT_SECRET");
    
    // Use the same redirect URI that was used for the authorization request
    const redirectUri = ALLOWED_REDIRECT_URIS[callbackType || "supabase"];
    
    if (!clientId || !clientSecret) {
      console.error("Missing client credentials");
      return redirectToErrorPage("Server configuration error. Please contact support.");
    }
    
    // Exchange code for access and refresh tokens
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
        redirect_uri: redirectUri,
      }),
    });
    
    // Handle token exchange errors
    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json();
      console.error("Token exchange error:", tokenError);
      return redirectToErrorPage("Failed to complete authentication. Please try again.");
    }
    
    // Extract tokens from response
    const tokenData = await tokenResponse.json();
    const refreshToken = tokenData.refresh_token;
    const accessToken = tokenData.access_token;
    
    if (!refreshToken || !accessToken) {
      console.error("Missing tokens in response:", tokenData);
      return redirectToErrorPage("Failed to receive authentication tokens. Please try again.");
    }
    
    // Calculate token expiration time
    const expiresInSeconds = tokenData.expires_in || 3600;
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expiresInSeconds);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return redirectToErrorPage("Server configuration error. Please contact support.");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch Amazon Advertising profiles using the access token
    const profilesResponse = await fetch("https://advertising-api.amazon.com/v2/profiles", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": clientId,
      },
    });
    
    // Handle profiles fetch errors
    if (!profilesResponse.ok) {
      const profilesError = await profilesResponse.json();
      console.error("Profiles fetch error:", profilesError);
      return redirectToErrorPage("Failed to retrieve Amazon Advertising profiles. Please try again.");
    }
    
    // Process profiles from response
    const profiles = await profilesResponse.json();
    let profileId = null;
    
    if (profiles && profiles.length > 0) {
      // Use the first profile by default (can be improved to let the user select)
      profileId = profiles[0].profileId;
      console.log(`Using profile ${profileId} (${profiles[0].countryCode})`);
    } else {
      console.warn("No profiles found in Amazon Advertising account");
    }
    
    // Look up or create Amazon platform in database
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
        console.error("Error creating platform record:", createError);
        return redirectToErrorPage("Failed to store platform information. Please contact support.");
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
      console.error("Error storing credentials:", credentialError);
      return redirectToErrorPage("Failed to store authentication information. Please contact support.");
    }
    
    // Log successful connection
    await supabase.from("token_refresh_logs").insert({
      advertiser_id: advertiserId,
      platform_id: platformId,
      operation_type: "initial_connection",
      status: "success",
    });
    
    // If this is the Adspirer callback, handle it differently
    if (callbackType === "adspirer") {
      // This is the format expected by the Adspirer frontend
      return new Response(JSON.stringify({
        success: true,
        message: "Amazon Ads connected successfully",
        profileId
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    // Redirect back to the application with success message
    const successUrl = new URL(redirectOrigin || "https://app.adspirer.com");
    successUrl.pathname = "/dashboard";
    successUrl.searchParams.append("success", "amazon_connected");
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": successUrl.toString()
      }
    });
  } catch (error) {
    console.error("Callback error:", error);
    return redirectToErrorPage("An unexpected error occurred. Please try again.");
  }
});

// Helper function to redirect to an error page
function redirectToErrorPage(message: string) {
  const errorUrl = new URL("https://app.adspirer.com/error");
  errorUrl.searchParams.append("message", message);
  
  return new Response(null, {
    status: 302,
    headers: {
      "Location": errorUrl.toString()
    }
  });
}
