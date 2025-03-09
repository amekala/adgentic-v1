import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Update this to restrict to your domain if needed (e.g., "https://www.adspirer.com")
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
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

// Add a helper function to check if we're in development mode
function isDevelopmentMode() {
  return Deno.env.get('ENVIRONMENT') === 'development' || true; // Default to true for testing
}

// Main function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // Make sure we're returning a successful status code for OPTIONS
      headers: corsHeaders
    });
  }

  try {
    if (req.method !== 'POST') {
      return createResponse({ error: 'Method not allowed' }, 405);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return createResponse({ error: "Missing Supabase credentials" }, 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const requestData = await req.json();
    const { operation, platformCredentialId, chatMode, advertiserId, profileId: requestProfileId } = requestData;
    
    if (!operation) {
      return createResponse({ error: "Missing operation parameter" }, 400);
    }
    
    // Ensure we have either a platformCredentialId or advertiserId
    if (!platformCredentialId && !advertiserId) {
      return createResponse({ error: "Missing platformCredentialId or advertiserId parameter" }, 400);
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
    
    // Override the profile ID with the hardcoded value or use the one passed in the request
    // This ensures all LLM functions use this as their basis for conversation
    const profileId = requestProfileId || "3211012118364113";
    
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
      }).eq('advertiser_id', credential.advertiser_id)
        .eq('platform_id', credential.platform_id)
        .eq('operation_type', operation);
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
          if (isDevelopmentMode()) {
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
        // Extract campaign creation parameters
        const { 
          name, 
          dailyBudget, 
          startDate, 
          endDate = null, 
          targetingType, 
          state = "enabled"
        } = requestData;
        
        // Validate required parameters
        if (!name || !dailyBudget || !startDate || !targetingType) {
          return createResponse({ 
            error: "Missing required parameters for campaign creation",
            requiredFields: ["name", "dailyBudget", "startDate", "targetingType"] 
          }, 400);
        }
        
        // Format dates to YYYYMMDD as required by Amazon API
        const formattedStartDate = startDate.replace(/-/g, '');
        const formattedEndDate = endDate ? endDate.replace(/-/g, '') : null;
        
        // Create campaign object
        const campaignData = {
          name,
          state,
          budgetType: "daily",
          budget: parseFloat(dailyBudget),
          startDate: formattedStartDate,
          ...(formattedEndDate && { endDate: formattedEndDate }),
          targetingType // e.g., "manual" or "auto"
        };
        
        // URL for creating Sponsored Products campaign
        const apiUrl = 'https://advertising-api.amazon.com/v2/sp/campaigns';
        
        if (isDevelopmentMode()) {
          console.warn('Using test data for campaign creation in development mode');
          responseData = {
            campaignId: Math.floor(Math.random() * 1000000000),
            name: campaignData.name,
            state: campaignData.state,
            budget: campaignData.budget,
            budgetType: campaignData.budgetType,
            startDate: campaignData.startDate,
            endDate: campaignData.endDate || null,
            targetingType: campaignData.targetingType,
            createdAt: new Date().toISOString()
          };
          break;
        }
        
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
      
      case 'adjust_budget': {
        // Extract budget adjustment parameters
        const { campaignId, newDailyBudget } = requestData;
        
        // Validate required parameters
        if (!campaignId || !newDailyBudget) {
          return createResponse({ 
            error: "Missing required parameters for budget adjustment",
            requiredFields: ["campaignId", "newDailyBudget"] 
          }, 400);
        }
        
        // Budget update object
        const budgetUpdate = {
          campaignId: parseInt(campaignId),
          budget: parseFloat(newDailyBudget)
        };
        
        // URL for updating a Sponsored Products campaign
        const apiUrl = 'https://advertising-api.amazon.com/v2/sp/campaigns';
        
        if (isDevelopmentMode()) {
          console.warn('Using test data for budget adjustment in development mode');
          responseData = {
            code: "SUCCESS",
            campaignId: budgetUpdate.campaignId,
            updatedFields: {
              budget: budgetUpdate.budget,
              updatedAt: new Date().toISOString()
            }
          };
          break;
        }
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Amazon-Advertising-API-ClientId': clientId,
            'Amazon-Advertising-API-Scope': profileId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([budgetUpdate])
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
      
      case 'get_campaign_report': {
        // Extract report parameters
        const { 
          campaignIds,
          startDate, 
          endDate = new Date().toISOString().split('T')[0], // Default to today
          metrics = ["impressions", "clicks", "cost", "sales"] 
        } = requestData;
        
        // Validate required parameters
        if (!campaignIds || !startDate) {
          return createResponse({ 
            error: "Missing required parameters for campaign report",
            requiredFields: ["campaignIds", "startDate"] 
          }, 400);
        }
        
        if (isDevelopmentMode()) {
          console.warn('Using test data for campaign report in development mode');
          
          // Generate test report data
          const reportData = [];
          const dayCount = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          // Generate data for each day in the range
          for (let i = 0; i < dayCount; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Use campaignIds to determine which campaigns to include
            const campaignIdList = Array.isArray(campaignIds) ? campaignIds : [campaignIds];
            
            for (const campaignId of campaignIdList) {
              // Get campaign name based on ID
              const campaignName = campaignId === "123456789" || campaignId === 123456789 
                ? "Test Campaign 1" 
                : campaignId === "987654321" || campaignId === 987654321
                  ? "Test Campaign 2"
                  : `Campaign ${campaignId}`;
                  
              // Generate random metrics
              const impressions = Math.floor(Math.random() * 5000) + 1000;
              const clicks = Math.floor(impressions * (Math.random() * 0.1));
              const cost = (clicks * (Math.random() * 1.5 + 0.5)).toFixed(2);
              const sales = (parseFloat(cost) * (Math.random() * 5 + 2)).toFixed(2);
              const acos = ((parseFloat(cost) / parseFloat(sales)) * 100).toFixed(2);
              
              reportData.push({
                date: dateStr,
                campaignId: campaignId,
                campaignName: campaignName,
                impressions: impressions,
                clicks: clicks,
                ctr: ((clicks / impressions) * 100).toFixed(2),
                cost: cost,
                sales: sales,
                acos: acos
              });
            }
          }
          
          // Format for chatMode if needed
          if (chatMode) {
            responseData = {
              text: formatReportForChat(reportData),
              report: reportData
            };
          } else {
            responseData = reportData;
          }
          
          break;
        }
        
        // Create report request
        const reportRequest = {
          name: "Campaign Performance Report",
          startDate,
          endDate,
          campaignType: "sponsoredProducts",
          reportTypeId: "spCampaigns",
          metrics,
          configurations: {
            adProduct: "SPONSORED_PRODUCTS",
            columns: ["campaignName", "impressions", "clicks", "cost", "sales", "acos"],
            reportTypeId: "campaigns",
            timeUnit: "DAILY",
            format: "JSON",
            // Add campaign IDs as filter if provided
            ...(campaignIds && { 
              filters: [
                {
                  field: "campaignId",
                  values: Array.isArray(campaignIds) ? campaignIds : [campaignIds]
                }
              ]
            })
          }
        };
        
        // First, create the report request
        const createReportUrl = 'https://advertising-api.amazon.com/reporting/reports';
        
        const createReportResponse = await fetch(createReportUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Amazon-Advertising-API-ClientId': clientId,
            'Amazon-Advertising-API-Scope': profileId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportRequest)
        });
        
        if (!createReportResponse.ok) {
          const errorData = await createReportResponse.json();
          return createResponse({ 
            error: `Amazon API error creating report: ${JSON.stringify(errorData)}` 
          }, createReportResponse.status);
        }
        
        const reportData = await createReportResponse.json();
        const reportId = reportData.reportId;
        
        // Now poll for the report to be ready
        const getReportUrl = `https://advertising-api.amazon.com/reporting/reports/${reportId}`;
        
        // Give the report some time to process
        let reportStatus;
        let attempts = 0;
        const maxAttempts = 5; // Maximum number of polling attempts
        
        while (attempts < maxAttempts) {
          attempts++;
          
          // Wait a bit before polling
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const checkReportResponse = await fetch(getReportUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Amazon-Advertising-API-ClientId': clientId,
              'Amazon-Advertising-API-Scope': profileId,
            }
          });
          
          if (!checkReportResponse.ok) {
            continue; // Try again
          }
          
          reportStatus = await checkReportResponse.json();
          
          if (reportStatus.status === 'COMPLETED') {
            break;
          } else if (reportStatus.status === 'FAILED') {
            return createResponse({ 
              error: `Report generation failed: ${reportStatus.statusDetails}` 
            }, 400);
          }
        }
        
        if (!reportStatus || reportStatus.status !== 'COMPLETED') {
          return createResponse({ 
            error: "Report generation timed out. Please try again later." 
          }, 408);
        }
        
        // Download the report
        const downloadResponse = await fetch(reportStatus.location, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!downloadResponse.ok) {
          return createResponse({ 
            error: "Failed to download report" 
          }, downloadResponse.status);
        }
        
        const reportContent = await downloadResponse.json();
        
        // Format report for LLM chat display if requested
        if (chatMode) {
          responseData = {
            text: formatReportForChat(reportContent),
            report: reportContent
          };
        } else {
          responseData = reportContent;
        }
        
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
      
      default: {
        return createResponse({ 
          error: `Unsupported operation: ${operation}`,
          supportedOperations: [
            'list_campaigns', 
            'create_campaign', 
            'adjust_budget', 
            'get_campaign_report'
          ] 
        }, 400);
      }
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

// Helper function to format report data for chat display
function formatReportForChat(reportData) {
  try {
    if (!reportData || !Array.isArray(reportData)) {
      return "No report data available.";
    }
    
    // Create a summary of the report
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalSales = 0;
    
    reportData.forEach(item => {
      totalImpressions += parseInt(item.impressions || 0);
      totalClicks += parseInt(item.clicks || 0);
      totalSpend += parseFloat(item.cost || 0);
      totalSales += parseFloat(item.sales || 0);
    });
    
    // Calculate metrics
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const acos = totalSales > 0 ? (totalSpend / totalSales) * 100 : 0;
    const roas = totalSpend > 0 ? totalSales / totalSpend : 0;
    
    // Format the summary
    return `
## Campaign Performance Report

**Period:** ${reportData[0]?.date || 'N/A'} to ${reportData[reportData.length - 1]?.date || 'N/A'}

### Summary Metrics
- **Total Impressions:** ${totalImpressions.toLocaleString()}
- **Total Clicks:** ${totalClicks.toLocaleString()}
- **CTR:** ${ctr.toFixed(2)}%
- **Total Spend:** $${totalSpend.toFixed(2)}
- **Total Sales:** $${totalSales.toFixed(2)}
- **ACoS:** ${acos.toFixed(2)}%
- **ROAS:** ${roas.toFixed(2)}x

### Campaign Details
${reportData.map(campaign => 
  `- **${campaign.campaignName || 'Unknown Campaign'}**: 
    ${parseInt(campaign.impressions || 0).toLocaleString()} impressions, 
    ${parseInt(campaign.clicks || 0).toLocaleString()} clicks, 
    $${parseFloat(campaign.cost || 0).toFixed(2)} spend, 
    $${parseFloat(campaign.sales || 0).toFixed(2)} sales`
).join('\n')}
`;
  } catch (error) {
    console.error('Error formatting report for chat:', error);
    return "Error formatting report data.";
  }
} 
