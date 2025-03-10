
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get URLs from environment variables with consistent naming
const SUPABASE_URL = import.meta.env.SUPABASE_URL || 
                     import.meta.env.VITE_SUPABASE_URL || 
                     import.meta.env.PUBLIC_SUPABASE_URL || 
                     "https://wllhsxoabzdzulomizzx.supabase.co";

const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY || 
                          import.meta.env.VITE_SUPABASE_ANON_KEY || 
                          import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 
                          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbGhzeG9hYnpkenVsb21penp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNjcxMTQsImV4cCI6MjA1NTk0MzExNH0.grR0m4oXBigY-o9dsvdw6l4zy2DPoneSzWyvhQSZsWY";

// Log the configuration for debugging
console.log("[Supabase Client] Configuration:", { 
  url: SUPABASE_URL,
  key_present: !!SUPABASE_ANON_KEY,
  env_vars_present: {
    SUPABASE_URL: !!import.meta.env.SUPABASE_URL,
    VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
    PUBLIC_SUPABASE_URL: !!import.meta.env.PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: !!import.meta.env.SUPABASE_ANON_KEY,
    VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_ANON_KEY: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  }
});

// Create the Supabase client with better error handling
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Export helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !!supabase.functions;
};

// Function to store Amazon Ads tokens received directly
export const storeAmazonAdsTokens = async (credentials: {
  advertiserId: string;
  profileId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}) => {
  try {
    // First, get the platform_id for Amazon
    const { data: platformData, error: platformError } = await supabase
      .from('ad_platforms')
      .select('id')
      .eq('name', 'amazon')
      .single();
    
    if (platformError || !platformData) {
      throw new Error(`Failed to find Amazon platform: ${platformError?.message}`);
    }
    
    // Calculate token expiration time
    const expiresInSeconds = credentials.expiresIn || 3600;
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expiresInSeconds);
    
    // Store or update credentials
    const { error: credentialError } = await supabase
      .from('platform_credentials')
      .upsert({
        advertiser_id: credentials.advertiserId,
        platform_id: platformData.id,
        profile_id: credentials.profileId,
        refresh_token: credentials.refreshToken,
        access_token: credentials.accessToken,
        token_expires_at: tokenExpiresAt.toISOString(),
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'advertiser_id,platform_id'
      });
    
    if (credentialError) {
      throw new Error(`Failed to store credentials: ${credentialError.message}`);
    }
    
    // Log successful connection
    await supabase.from("token_refresh_logs").insert({
      advertiser_id: credentials.advertiserId,
      platform_id: platformData.id,
      operation_type: "manual_token_insert",
      status: "success",
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error storing Amazon Ads tokens:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// New utility function to get a valid Amazon Ads token
export const getAmazonAdsToken = async (advertiserId: string): Promise<{ accessToken: string, profileId: string }> => {
  try {
    // First, get the platform_id for Amazon
    const { data: platformData, error: platformError } = await supabase
      .from('ad_platforms')
      .select('id')
      .eq('name', 'amazon')
      .single();
    
    if (platformError || !platformData) {
      throw new Error(`Failed to find Amazon platform: ${platformError?.message}`);
    }

    // Get the credentials for this advertiser and platform
    const { data: credentials, error: credentialsError } = await supabase
      .from('platform_credentials')
      .select('id, access_token, refresh_token, token_expires_at, profile_id')
      .eq('advertiser_id', advertiserId)
      .eq('platform_id', platformData.id)
      .single();
    
    if (credentialsError || !credentials) {
      throw new Error(`Failed to retrieve credentials: ${credentialsError?.message || 'Not found'}`);
    }

    // Always use the hardcoded profile ID for Amazon API calls
    const profileId = "3211012118364113";
    
    // Check if token is expired
    const currentTime = new Date();
    const tokenExpiresAt = credentials.token_expires_at ? new Date(credentials.token_expires_at) : null;
    
    // If token is still valid, return it
    if (credentials.access_token && tokenExpiresAt && currentTime < tokenExpiresAt) {
      return { 
        accessToken: credentials.access_token,
        profileId
      };
    }
    
    // If token is expired, use the token_manager function to refresh it
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke('token_manager', {
      body: {
        operation: 'get_token',
        platformCredentialId: credentials.id
      }
    });
    
    if (tokenError || !tokenData?.access_token) {
      throw new Error(`Failed to refresh token: ${tokenError?.message || 'No token returned'}`);
    }
    
    return { 
      accessToken: tokenData.access_token,
      profileId
    };
  } catch (error) {
    console.error('Error getting Amazon Ads token:', error);
    throw error;
  }
};

// New utility function specifically for LLM integrations to use the hardcoded profile ID
export const getAmazonLLMCredentials = async (): Promise<{ 
  platformCredentialId: string, 
  profileId: string,
  accessToken: string 
}> => {
  try {
    // Always use this hardcoded profile ID for Amazon API calls in LLM contexts
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

    // Get the credentials for this profile and platform
    const { data: credentials, error: credentialsError } = await supabase
      .from('platform_credentials')
      .select('id, access_token, token_expires_at')
      .eq('profile_id', profileId)
      .eq('platform_id', platformData.id)
      .eq('is_active', true)
      .single();
    
    if (credentialsError || !credentials) {
      throw new Error(`Failed to retrieve credentials: ${credentialsError?.message || 'Not found'}`);
    }
    
    // Check if token is expired
    const currentTime = new Date();
    const tokenExpiresAt = credentials.token_expires_at ? new Date(credentials.token_expires_at) : null;
    
    // If token is still valid, return it
    if (credentials.access_token && tokenExpiresAt && currentTime < tokenExpiresAt) {
      return { 
        platformCredentialId: credentials.id,
        profileId,
        accessToken: credentials.access_token
      };
    }
    
    // If token is expired, use the token_manager function to refresh it
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke('token_manager', {
      body: {
        operation: 'get_token',
        platformCredentialId: credentials.id
      }
    });
    
    if (tokenError || !tokenData?.access_token) {
      throw new Error(`Failed to refresh token: ${tokenError?.message || 'No token returned'}`);
    }
    
    return {
      platformCredentialId: credentials.id,
      profileId,
      accessToken: tokenData.access_token
    };
  } catch (error) {
    console.error('Error getting LLM Amazon credentials:', error);
    throw error;
  }
};
