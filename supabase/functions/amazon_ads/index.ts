import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Test campaign data from your Amazon Advertising API
const TEST_CAMPAIGN = {
  campaignId: 306693373344074,
  name: "Test Campaign",
  tactic: "T00020",
  startDate: "20250308",
  endDate: "20251231",
  state: "enabled",
  costType: "cpc",
  budget: 10000.0,
  budgetType: "daily",
  deliveryProfile: "as_soon_as_possible"
};

// Sample campaign metrics data
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

// Sample product data
const TEST_PRODUCTS = [
  { asin: "B0ABCD1234", title: "Premium Wireless Headphones" },
  { asin: "B0EFGH5678", title: "Ergonomic Office Chair" },
  { asin: "B0IJKL9012", title: "Smart Home Security Camera" },
  { asin: "B0MNOP3456", title: "Professional Blender Set" }
];

// Main function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }

    const requestData = await req.json();
    const { operation } = requestData;

    if (!operation) {
      throw new Error('Missing operation parameter');
    }

    let responseData;

    // Handle different operations
    switch (operation) {
      case 'get_campaign':
        responseData = await handleGetCampaign(requestData);
        break;
      case 'create_campaign':
        responseData = await handleCreateCampaign(requestData);
        break;
      case 'update_campaign':
        responseData = await handleUpdateCampaign(requestData);
        break;
      case 'get_campaign_metrics':
        responseData = await handleGetCampaignMetrics(requestData);
        break;
      case 'get_products':
        responseData = await handleGetProducts(requestData);
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // Return the response data
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Amazon Ads API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Handler for getting campaign data
async function handleGetCampaign(requestData) {
  const { campaignId } = requestData;
  
  // If campaignId is provided and matches our test campaign, return it
  if (campaignId && campaignId.toString() === TEST_CAMPAIGN.campaignId.toString()) {
    console.log(`Returning data for test campaign ID: ${campaignId}`);
    return TEST_CAMPAIGN;
  }
  
  // Otherwise return the test campaign anyway for demo purposes
  console.log('Campaign ID not provided or not found, returning test campaign');
  return TEST_CAMPAIGN;
}

// Handler for creating a new campaign
async function handleCreateCampaign(requestData) {
  const { campaignData } = requestData;
  
  if (!campaignData) {
    throw new Error('Missing campaign data');
  }
  
  console.log('Creating new campaign with data:', campaignData);
  
  // In a real implementation, we would make an API call to Amazon Ads
  // For now, just return a success response with the test campaign ID
  return {
    success: true,
    campaignId: TEST_CAMPAIGN.campaignId,
    message: 'Campaign created successfully'
  };
}

// Handler for updating an existing campaign
async function handleUpdateCampaign(requestData) {
  const { campaignId, updateData } = requestData;
  
  if (!campaignId) {
    throw new Error('Missing campaign ID');
  }
  
  if (!updateData) {
    throw new Error('Missing update data');
  }
  
  console.log(`Updating campaign ${campaignId} with data:`, updateData);
  
  // In a real implementation, we would make an API call to Amazon Ads
  // For now, just return a success response
  return {
    success: true,
    campaignId: campaignId,
    message: 'Campaign updated successfully'
  };
}

// Handler for getting campaign metrics
async function handleGetCampaignMetrics(requestData) {
  const { campaignId, timeframe } = requestData;
  
  console.log(`Getting metrics for campaign ${campaignId} with timeframe ${timeframe || 'last_7_days'}`);
  
  // For demo purposes, return the test metrics
  return {
    campaignId: campaignId || TEST_CAMPAIGN.campaignId,
    timeframe: timeframe || 'last_7_days',
    metrics: TEST_CAMPAIGN_METRICS
  };
}

// Handler for getting product data
async function handleGetProducts(requestData) {
  console.log('Getting product data');
  
  // For demo purposes, return the test products
  return {
    products: TEST_PRODUCTS
  };
} 