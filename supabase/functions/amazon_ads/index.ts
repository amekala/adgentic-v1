
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a response with the given data and status
function createResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Gets a valid access token for Amazon Advertising API
async function getAmazonToken(supabase: any, platformCredentialId: string) {
  try {
    // Call the token_manager function
    const { data, error } = await supabase.functions.invoke('token_manager', {
      body: {
        operation: 'get_token',
        platformCredentialId
      }
    });
    
    if (error) throw new Error(`Token manager error: ${error.message}`);
    if (!data?.access_token) throw new Error('No access token returned');
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting Amazon token:', error);
    throw error;
  }
}

// Sample campaign metrics data (fallback)
const TEST_CAMPAIGN_METRICS = {
  impressions: 142587,
  clicks: 3842,
  ctr: 2.69,
  cpc: 1.10,
  spend: 4215.87,
  sales: 26678.45,
  acos: 15.8,
  roas: 6.33
};

// Sample product data (fallback)
const TEST_PRODUCTS = [
  { asin: "B0ABCD1234", title: "Premium Wireless Headphones" },
  { asin: "B0EFGH5678", title: "Ergonomic Office Chair" },
  { asin: "B0IJKL9012", title: "Smart Home Security Camera" },
  { asin: "B0MNOP3456", title: "Professional Blender Set" }
];

// Format campaigns into a user-friendly string for chat
function formatCampaignsForChat(campaigns: any[]) {
  if (!campaigns || campaigns.length === 0) {
    return "You don't have any Amazon advertising campaigns running at the moment.";
  }
  
  let response = "Here are your Amazon advertising campaigns:\n\n";
  
  campaigns.forEach((campaign, index) => {
    response += `${index + 1}. ${campaign.name} (${campaign.state})\n`;
    
    if (campaign.budget) {
      response += `   Budget: $${(campaign.budget / 100).toFixed(2)}/day\n`;
    }
    
    if (campaign.startDate) {
      response += `   Start Date: ${formatDate(campaign.startDate)}\n`;
    }
    
    if (campaign.endDate) {
      response += `   End Date: ${formatDate(campaign.endDate)}\n`;
    }
    
    response += "\n";
  });
  
  return response;
}

// Format date from YYYYMMDD to MM/DD/YYYY
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  return `${month}/${day}/${year}`;
}

// Main function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return createResponse({ error: 'Method not allowed' }, 405);
    }

    // Create a Supabase client using the request authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createResponse({ error: 'Missing authorization header' }, 401);
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return createResponse({ error: 'Supabase configuration missing' }, 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const requestData = await req.json();
    const { operation, platformCredentialId, chatMode, advertiserId } = requestData;

    if (!operation) {
      return createResponse({ error: 'Missing operation parameter' }, 400);
    }
    
    if (!platformCredentialId && !advertiserId) {
      return createResponse({ error: 'Missing platformCredentialId or advertiserId parameter' }, 400);
    }

    // Get platform credential details
    let credential;
    
    if (platformCredentialId) {
      const { data, error } = await supabase
        .from('platform_credentials')
        .select('profile_id, platform_id, advertiser_id')
        .eq('id', platformCredentialId)
        .single();
        
      if (error || !data) {
        return createResponse({ 
          error: `Failed to retrieve platform credential: ${error?.message || 'Not found'}` 
        }, 404);
      }
      
      credential = data;
    } else if (advertiserId) {
      // Get the platform_id for Amazon
      const { data: platformData, error: platformError } = await supabase
        .from('ad_platforms')
        .select('id')
        .eq('name', 'amazon')
        .single();
        
      if (platformError || !platformData) {
        return createResponse({ 
          error: `Failed to find Amazon platform: ${platformError?.message}` 
        }, 404);
      }
      
      const { data, error } = await supabase
        .from('platform_credentials')
        .select('id, profile_id, platform_id, advertiser_id')
        .eq('advertiser_id', advertiserId)
        .eq('platform_id', platformData.id)
        .single();
        
      if (error || !data) {
        return createResponse({ 
          error: `Failed to retrieve platform credential for advertiser: ${error?.message || 'Not found'}` 
        }, 404);
      }
      
      credential = data;
      platformCredentialId = data.id;
    }
    
    // Override the profile ID with the hardcoded value
    const profileId = "3211012118364113";
    
    // Get Amazon client ID from environment
    const clientId = Deno.env.get('AMAZON_ADS_CLIENT_ID');
    if (!clientId) {
      return createResponse({ error: 'Amazon Ads client ID not configured' }, 500);
    }

    // Get a valid token
    let accessToken;
    try {
      accessToken = await getAmazonToken(supabase, platformCredentialId);
    } catch (tokenError) {
      return createResponse({ error: `Token error: ${tokenError.message}` }, 500);
    }

    // Log the API interaction
    try {
      await supabase.from("platform_operation_logs").insert({
        advertiser_id: credential.advertiser_id,
        platform_id: credential.platform_id,
        operation_type: operation,
        request_payload: requestData,
        success: true
      });
    } catch (logError) {
      console.warn('Error logging API interaction:', logError);
      // Non-fatal error, continue with the operation
    }

    // Handle different operations
    let responseData;
    switch (operation) {
      case 'get_campaign': {
        const { campaignId } = requestData;
        
        if (!campaignId) {
          return createResponse({ error: 'Missing campaignId parameter' }, 400);
        }
        
        // Make Amazon API request to get campaign details
        const apiUrl = `https://advertising-api.amazon.com/v2/sp/campaigns/${campaignId}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Amazon-Advertising-API-ClientId': clientId,
            'Amazon-Advertising-API-Scope': profileId,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          // For 404, the campaign might be deleted or not found
          if (response.status === 404) {
            return createResponse({ error: 'Campaign not found' }, 404);
          }
          
          const errorData = await response.json();
          return createResponse({ 
            error: `Amazon API error: ${JSON.stringify(errorData)}` 
          }, response.status);
        }
        
        responseData = await response.json();
        break;
      }
      
      case 'list_campaigns': {
        // URL for listing Sponsored Products campaigns
        const apiUrl = 'https://advertising-api.amazon.com/v2/sp/campaigns';
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Amazon-Advertising-API-ClientId': clientId,
            'Amazon-Advertising-API-Scope': profileId,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          // If the API call fails, check if we should use test data for development
          if (Deno.env.get('ENVIRONMENT') === 'development') {
            console.warn('Using test campaign data in development mode');
            responseData = [
              {
                campaignId: 123456789,
                name: "Test Campaign 1",
                state: "enabled",
                budget: 1000,
                budgetType: "daily",
                startDate: "20230601",
                endDate: "20241231"
              },
              {
                campaignId: 987654321,
                name: "Test Campaign 2",
                state: "paused",
                budget: 2500,
                budgetType: "daily",
                startDate: "20230715",
                endDate: null
              }
            ];
            break;
          }
          
          const errorData = await response.json();
          return createResponse({ 
            error: `Amazon API error: ${JSON.stringify(errorData)}` 
          }, response.status);
        }
        
        responseData = await response.json();
        
        // If this is requested for chat, format the campaigns as a readable message
        if (chatMode) {
          responseData = {
            text: formatCampaignsForChat(responseData),
            campaigns: responseData
          };
        }
        
        break;
      }
      
      case 'create_campaign': {
        const { campaignData } = requestData;
        
        if (!campaignData) {
          return createResponse({ error: 'Missing campaign data' }, 400);
        }
        
        // Make Amazon API request to create campaign
        const apiUrl = 'https://advertising-api.amazon.com/v2/sp/campaigns';
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Amazon-Advertising-API-ClientId': clientId,
            'Amazon-Advertising-API-Scope': profileId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(campaignData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          return createResponse({ 
            error: `Amazon API error: ${JSON.stringify(errorData)}` 
          }, response.status);
        }
        
        responseData = await response.json();
        break;
      }
      
      case 'update_campaign': {
        const { campaignId, updateData } = requestData;
        
        if (!campaignId) {
          return createResponse({ error: 'Missing campaign ID' }, 400);
        }
        
        if (!updateData) {
          return createResponse({ error: 'Missing update data' }, 400);
        }
        
        // Make Amazon API request to update campaign
        const apiUrl = `https://advertising-api.amazon.com/v2/sp/campaigns/${campaignId}`;
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Amazon-Advertising-API-ClientId': clientId,
            'Amazon-Advertising-API-Scope': profileId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          return createResponse({ 
            error: `Amazon API error: ${JSON.stringify(errorData)}` 
          }, response.status);
        }
        
        responseData = await response.json();
        break;
      }
      
      case 'get_campaign_metrics': {
        const { campaignId, timeframe } = requestData;
        
        // Fallback to test data when developing/testing
        // In production, this should make a real API call to the Amazon reports endpoint
        responseData = {
          campaignId: campaignId,
          timeframe: timeframe || 'last_7_days',
          metrics: TEST_CAMPAIGN_METRICS
        };
        break;
      }
      
      case 'get_products': {
        // Fallback to test data when developing/testing
        // In production, this should make a real API call to the Amazon catalog/product API
        responseData = {
          products: TEST_PRODUCTS
        };
        break;
      }
      
      default:
        return createResponse({ error: `Unsupported operation: ${operation}` }, 400);
    }

    // Log successful response
    try {
      await supabase.from("platform_operation_logs").update({
        response_payload: responseData,
        success: true
      }).eq('advertiser_id', credential.advertiser_id)
        .eq('platform_id', credential.platform_id)
        .eq('operation_type', operation);
    } catch (logError) {
      console.warn('Error updating API interaction log:', logError);
      // Non-fatal error, continue with the response
    }

    // Return the response data
    return createResponse(responseData);
  } catch (error) {
    console.error('Amazon Ads API Error:', error);
    return createResponse({ error: error.message }, 500);
  }
}); 
