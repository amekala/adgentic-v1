
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Use our client-side callback handler for Amazon redirects
const REDIRECT_URI = "https://www.adspirer.com/#/api/amazon-callback";
const CLIENT_REDIRECT_URI = "/#/api/amazon-callback"; // Client-side route to handle callbacks

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, advertiserId, useTestAccount, baseUrl } = await req.json();

    const clientId = Deno.env.get("AMAZON_ADS_CLIENT_ID");
    if (!clientId) throw new Error("Client ID not configured");

    if (operation === "get_auth_url") {
      // Validate advertiser ID
      if (!advertiserId) throw new Error("Advertiser ID is required");
      
      // Build the auth URL with state
      const oauthUrl = new URL("https://www.amazon.com/ap/oa");
      oauthUrl.searchParams.append("client_id", clientId);
      
      // Include test account creation scope if specified
      if (useTestAccount) {
        oauthUrl.searchParams.append("scope", "advertising::test:create_account advertising::campaign_management");
      } else {
        oauthUrl.searchParams.append("scope", "advertising::campaign_management");
      }
      
      oauthUrl.searchParams.append("response_type", "code");
      
      // Use the dynamic redirect URI based on the environment
      const effectiveRedirectUri = baseUrl 
        ? `${baseUrl}${CLIENT_REDIRECT_URI}` 
        : REDIRECT_URI;
      
      oauthUrl.searchParams.append("redirect_uri", effectiveRedirectUri);
      
      // Create state with advertiser ID to use after callback
      const state = JSON.stringify({ 
        advertiserId,
        useTestAccount: !!useTestAccount,
        redirectOrigin: baseUrl || new URL(req.url).origin, // To redirect back to the client app after callback
      });
      
      // Use base64 encoding for safety
      oauthUrl.searchParams.append("state", btoa(state));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          authUrl: oauthUrl.toString(),
          callbackUri: CLIENT_REDIRECT_URI // Tell the client where to listen for the callback
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      throw new Error("Invalid operation");
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}); 
