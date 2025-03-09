import { supabase } from '@/integrations/supabase/client';

/**
 * Gets a valid Amazon Advertising API access token
 * 
 * @param platformCredentialId The ID of the platform credential in the database
 * @returns A valid access token
 */
export async function getAmazonToken(platformCredentialId: string): Promise<string> {
  try {
    // Call the token_manager function to get a valid token
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

/**
 * Wrapper for making Amazon Advertising API requests with valid tokens
 * 
 * @param platformCredentialId The platform credential ID
 * @param url The API endpoint URL
 * @param options Fetch options (excluding headers.Authorization)
 * @returns The API response
 */
export async function callAmazonAdsApi(
  platformCredentialId: string,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get a valid token
  const token = await getAmazonToken(platformCredentialId);
  
  // Add the token to the request headers
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Amazon-Advertising-API-ClientId': process.env.AMAZON_ADS_CLIENT_ID || '',
    'Content-Type': 'application/json',
  };
  
  // Make the API request with the token
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized (token may have just expired)
    if (response.status === 401) {
      console.warn('Received 401 from Amazon API, retrying with fresh token');
      
      // Force refresh token by calling the function again
      const newToken = await getAmazonToken(platformCredentialId);
      
      // Retry the request with the new token
      return fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        },
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error calling Amazon Ads API:', error);
    throw error;
  }
}

/**
 * Implements exponential backoff for retrying failed API calls
 * 
 * @param operation Function to retry
 * @param maxRetries Maximum number of retries
 * @param baseDelayMs Base delay in milliseconds
 * @returns Result of the operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}):`, error);
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        // Calculate delay with exponential backoff and jitter
        const delayMs = baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random());
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

/**
 * Retrieves Amazon API credentials using the hard-coded profile ID
 * Ensures LLM chats can use profile_id as basis for conversation
 * 
 * @returns Object containing the credential ID and access token
 */
export async function getAmazonCredentialsByProfileId(): Promise<{ credentialId: string, accessToken: string }> {
  try {
    // Use the hard-coded profile ID as specified
    const profileId = "3211012118364113";
    
    // First, get the platform_id for Amazon
    const { data: platformData, error: platformError } = await supabase
      .from('ad_platforms')
      .select('id')
      .eq('name', 'amazon')
      .single();
    
    if (platformError || !platformData) {
      throw new Error(`Failed to find Amazon platform: ${platformError?.message}`);
    }
    
    // Query for the credential with the specific profile_id
    const { data: credential, error: credentialError } = await supabase
      .from('platform_credentials')
      .select('id, access_token, token_expires_at')
      .eq('profile_id', profileId)
      .eq('platform_id', platformData.id)
      .eq('is_active', true)
      .single();
    
    if (credentialError || !credential) {
      throw new Error(`Failed to find credential with profile ID ${profileId}: ${credentialError?.message}`);
    }
    
    // Check if token is expired
    const currentTime = new Date();
    const tokenExpiresAt = credential.token_expires_at ? new Date(credential.token_expires_at) : null;
    
    // If token is valid, return it directly
    if (credential.access_token && tokenExpiresAt && currentTime < tokenExpiresAt) {
      return {
        credentialId: credential.id,
        accessToken: credential.access_token
      };
    }
    
    // If token is expired, refresh it
    const token = await getAmazonToken(credential.id);
    
    return {
      credentialId: credential.id,
      accessToken: token
    };
  } catch (error) {
    console.error('Error getting Amazon credentials by profile ID:', error);
    throw error;
  }
}

/**
 * Makes an Amazon API request using the hard-coded profile ID
 * This function is designed for LLM integrations to use profile_id consistently
 * 
 * @param url The API endpoint URL
 * @param options Fetch options (excluding headers.Authorization)
 * @returns The API response
 */
export async function callAmazonApiWithProfileId(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Get credentials using profile ID
    const { credentialId, accessToken } = await getAmazonCredentialsByProfileId();
    
    // Use profile ID consistently for all Amazon API calls
    const profileId = "3211012118364113";
    
    // Set up headers with token and profile ID
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Amazon-Advertising-API-ClientId': process.env.AMAZON_ADS_CLIENT_ID || '',
      'Amazon-Advertising-API-Scope': profileId,
      'Content-Type': 'application/json',
    };
    
    // Make the API request
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized (token may have just expired)
    if (response.status === 401) {
      console.warn('Received 401 from Amazon API, retrying with fresh token');
      
      // Force refresh token
      const newToken = await getAmazonToken(credentialId);
      
      // Retry the request with the new token
      return fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        },
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error calling Amazon API with profile ID:', error);
    throw error;
  }
}
