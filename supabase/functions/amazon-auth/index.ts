import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation, advertiserId } = await req.json();

    const clientId = Deno.env.get("AMAZON_ADS_CLIENT_ID");
    if (!clientId) throw new Error("Client ID not configured");

    if (operation === "get_auth_url") {
      // Validate advertiser ID
      if (!advertiserId) throw new Error("Advertiser ID is required");
      
      // Build the auth URL with state
      const oauthUrl = new URL("https://www.amazon.com/ap/oa");
      oauthUrl.searchParams.append("client_id", clientId);
      oauthUrl.searchParams.append("scope", "advertising::campaign_management");
      oauthUrl.searchParams.append("response_type", "code");
      oauthUrl.searchParams.append("redirect_uri", "https://www.adspirer.com/api/amazon-callback");
      
      // Create state with advertiser ID to use after callback
      const state = JSON.stringify({ advertiserId });
      // Use base64 encoding for safety
      oauthUrl.searchParams.append("state", btoa(state));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          authUrl: oauthUrl.toString() 
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