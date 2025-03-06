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
      
      // Build the authorization URL with state parameter containing advertiser ID
      const redirectUri = "https://www.adspirer.com/api/amazon-callback";
      const scopes = ["advertising::campaign_management"];
      const state = btoa(JSON.stringify({ advertiserId })); // Base64 encode for safety
      
      const authUrl = new URL("https://www.amazon.com/ap/oa");
      authUrl.searchParams.append("client_id", clientId);
      authUrl.searchParams.append("scope", scopes.join(" "));
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("redirect_uri", redirectUri);
      authUrl.searchParams.append("state", state);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          authUrl: authUrl.toString() 
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