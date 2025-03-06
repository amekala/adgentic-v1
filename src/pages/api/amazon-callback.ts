import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get query parameters from URL
    const { code, state, error } = req.query;
    
    if (error) {
      return res.redirect(`/dashboard?error=${encodeURIComponent(error as string)}`);
    }
    
    if (!code) {
      return res.redirect('/dashboard?error=No+authorization+code+provided');
    }
    
    // Decode state parameter to get advertiser ID
    let advertiserId;
    try {
      const decodedState = JSON.parse(atob(state as string));
      advertiserId = decodedState.advertiserId;
    } catch (e) {
      return res.redirect('/dashboard?error=Invalid+state+parameter');
    }
    
    if (!advertiserId) {
      return res.redirect('/dashboard?error=No+advertiser+ID+provided');
    }
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Get Amazon API credentials
    const clientId = process.env.AMAZON_ADS_CLIENT_ID;
    const clientSecret = process.env.AMAZON_ADS_CLIENT_SECRET;
    const redirectUri = 'http://localhost:8086/api/amazon-callback';
    
    if (!clientId || !clientSecret) {
      return res.redirect('/dashboard?error=Missing+API+credentials');
    }
    
    // Exchange code for refresh token
    const tokenResponse = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      return res.redirect(`/dashboard?error=${encodeURIComponent(JSON.stringify(error))}`);
    }
    
    const tokenData = await tokenResponse.json();
    const refreshToken = tokenData.refresh_token;
    const accessToken = tokenData.access_token;
    
    // Get Amazon Ads profiles using the access token
    const profilesResponse = await fetch('https://advertising-api.amazon.com/v2/profiles', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Amazon-Advertising-API-ClientId': clientId
      }
    });
    
    if (!profilesResponse.ok) {
      const error = await profilesResponse.json();
      return res.redirect(`/dashboard?error=${encodeURIComponent(JSON.stringify(error))}`);
    }
    
    const profiles = await profilesResponse.json();
    let profileId = null;
    
    if (profiles && profiles.length > 0) {
      profileId = profiles[0].profileId; // Use the first profile by default
    }
    
    // Look up platform ID for Amazon Ads
    const { data: platformData } = await supabase
      .from('ad_platforms')
      .select('id')
      .eq('name', 'amazon')
      .single();
      
    const platformId = platformData?.id;
    
    if (!platformId) {
      // Insert a platform record if it doesn't exist
      const { data: newPlatform, error: platformError } = await supabase
        .from('ad_platforms')
        .insert({
          name: 'amazon',
          display_name: 'Amazon Ads',
          api_base_url: 'https://advertising-api.amazon.com'
        })
        .select()
        .single();
        
      if (platformError) {
        return res.redirect(`/dashboard?error=${encodeURIComponent(platformError.message)}`);
      }
      
      platformId = newPlatform.id;
    }
    
    // Store the refresh token and profile ID
    const { error: credentialError } = await supabase
      .from('platform_credentials')
      .upsert({
        advertiser_id: advertiserId,
        platform_id: platformId,
        profile_id: profileId,
        refresh_token: refreshToken,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'advertiser_id,platform_id'
      });
      
    if (credentialError) {
      return res.redirect(`/dashboard?error=${encodeURIComponent(credentialError.message)}`);
    }
    
    // Redirect to dashboard with success message
    return res.redirect('/dashboard?success=amazon_connected');
  } catch (error) {
    console.error('Error in callback:', error);
    return res.redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }
} 