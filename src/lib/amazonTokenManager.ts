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