import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// Configure CORS headers
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

// Handler for refreshing an Amazon access token
async function refreshAmazonToken(
  supabase: any,
  platformCredentialId: string, 
  refreshToken: string,
  platformCredentialRecord: any
) {
  try {
    console.log(`Refreshing token for platform credential ID: ${platformCredentialId}`);
    
    const clientId = Deno.env.get('AMAZON_ADS_CLIENT_ID');
    const clientSecret = Deno.env.get('AMAZON_ADS_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('Amazon Ads API credentials not configured');
    }
    
    // Make token refresh request to Amazon
    const tokenUrl = 'https://api.amazon.com/auth/o2/token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token refresh error:', errorData);
      
      // Log the token refresh error
      await supabase.from('token_refresh_logs').insert({
        advertiser_id: platformCredentialRecord.advertiser_id,
        platform_id: platformCredentialRecord.platform_id,
        operation_type: 'refresh_token',
        status: 'error',
        error_message: JSON.stringify(errorData),
      });
      
      throw new Error(`Failed to refresh token: ${JSON.stringify(errorData)}`);
    }
    
    const tokenData = await response.json();
    
    // Calculate expiration time (Amazon tokens usually last 1 hour)
    const expiresInSeconds = tokenData.expires_in || 3600; 
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expiresInSeconds);
    
    // Update the token in the database
    const { error: updateError } = await supabase
      .from('platform_credentials')
      .update({
        access_token: tokenData.access_token,
        token_expires_at: tokenExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', platformCredentialId);
    
    if (updateError) {
      throw new Error(`Failed to update token in database: ${updateError.message}`);
    }
    
    // Log the successful refresh
    await supabase.from('token_refresh_logs').insert({
      advertiser_id: platformCredentialRecord.advertiser_id,
      platform_id: platformCredentialRecord.platform_id,
      operation_type: 'refresh_token',
      status: 'success',
    });
    
    return tokenData.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// Get platform credential record to access advertiser_id and platform_id
async function getPlatformCredentialRecord(supabase: any, platformCredentialId: string) {
  const { data, error } = await supabase
    .from('platform_credentials')
    .select('advertiser_id, platform_id')
    .eq('id', platformCredentialId)
    .single();
  
  if (error) {
    throw new Error(`Failed to retrieve platform credential: ${error.message}`);
  }
  
  return data;
}

// Main function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Create a Supabase client using the request authentication
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return createResponse({ error: 'Missing authorization header' }, 401);
  }
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return createResponse({ error: 'Supabase configuration missing' }, 500);
  }
  
  // Create clients with different levels of access
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  
  // Service role client for admin operations
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    if (req.method !== 'POST') {
      return createResponse({ error: 'Method not allowed' }, 405);
    }
    
    const requestData = await req.json();
    const { operation } = requestData;
    
    if (!operation) {
      return createResponse({ error: 'Missing operation parameter' }, 400);
    }
    
    // Handle different operations
    switch (operation) {
      case 'get_token': {
        const { platformCredentialId } = requestData;
        
        if (!platformCredentialId) {
          return createResponse({ error: 'Missing platformCredentialId parameter' }, 400);
        }
        
        // Retrieve the platform credential record
        const platformCredentialRecord = await getPlatformCredentialRecord(adminSupabase, platformCredentialId);
        
        // Get the current token and check if it's expired
        const { data, error } = await adminSupabase
          .from('platform_credentials')
          .select('id, access_token, refresh_token, token_expires_at')
          .eq('id', platformCredentialId)
          .single();
        
        if (error) {
          return createResponse({ error: `Failed to get token: ${error.message}` }, 500);
        }
        
        if (!data) {
          return createResponse({ error: 'Platform credential not found' }, 404);
        }
        
        // Check if token is expired or about to expire (within 5 minutes)
        const now = new Date();
        const expiryTime = data.token_expires_at ? new Date(data.token_expires_at) : null;
        const isExpired = !expiryTime || (expiryTime.getTime() - now.getTime() < 5 * 60 * 1000);
        
        let accessToken;
        
        if (isExpired) {
          // Token is expired, refresh it
          if (!data.refresh_token) {
            return createResponse({ error: 'Refresh token not available' }, 400);
          }
          
          try {
            accessToken = await refreshAmazonToken(
              adminSupabase,
              platformCredentialId,
              data.refresh_token,
              platformCredentialRecord
            );
          } catch (refreshError) {
            return createResponse({ error: `Token refresh failed: ${refreshError.message}` }, 500);
          }
        } else {
          // Use existing token
          accessToken = data.access_token;
        }
        
        return createResponse({ 
          access_token: accessToken,
          platform_credential_id: platformCredentialId 
        });
      }
      
      case 'list_connected_platforms': {
        const { advertiserId } = requestData;
        
        if (!advertiserId) {
          return createResponse({ error: 'Missing advertiserId parameter' }, 400);
        }
        
        // Get all active platform credentials for this advertiser
        const { data: credentials, error: credentialsError } = await supabase
          .from('platform_credentials')
          .select(`
            id,
            profile_id,
            is_active,
            updated_at,
            token_expires_at,
            platform_id,
            ad_platforms!inner (
              id,
              name,
              display_name,
              api_base_url
            )
          `)
          .eq('advertiser_id', advertiserId)
          .eq('is_active', true);
        
        if (credentialsError) {
          return createResponse({ error: `Failed to list platforms: ${credentialsError.message}` }, 500);
        }
        
        // Transform data to a more usable format
        const platforms = credentials.map((cred) => {
          const platform = cred.ad_platforms;
          const now = new Date();
          const expiryTime = cred.token_expires_at ? new Date(cred.token_expires_at) : null;
          const tokenIsValid = expiryTime && (expiryTime.getTime() - now.getTime() > 0);
          
          return {
            id: cred.id,
            platform_id: platform.id,
            platform_name: platform.name,
            display_name: platform.display_name,
            profile_id: cred.profile_id,
            is_active: cred.is_active,
            token_status: tokenIsValid ? 'valid' : 'expired',
            last_updated: cred.updated_at,
          };
        });
        
        return createResponse({ platforms });
      }
      
      default:
        return createResponse({ error: `Unsupported operation: ${operation}` }, 400);
    }
  } catch (error) {
    console.error('Token manager error:', error);
    return createResponse({ error: error.message }, 500);
  }
}); 