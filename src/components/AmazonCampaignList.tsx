import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { callAmazonAdsApi, withRetry } from '@/lib/amazonTokenManager';
import { supabase } from '@/integrations/supabase/client';

interface Campaign {
  campaignId: string;
  name: string;
  state: string;
  budget: number;
  startDate: string;
  endDate?: string;
}

export default function AmazonCampaignList({ advertiserId }: { advertiserId: string }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformCredentialId, setPlatformCredentialId] = useState<string | null>(null);
  
  // First, get the platform credential ID for this advertiser
  useEffect(() => {
    async function getPlatformCredential() {
      try {
        // Get the Amazon platform ID
        const { data: platformData, error: platformError } = await supabase
          .from('ad_platforms')
          .select('id')
          .eq('name', 'amazon')
          .single();
          
        if (platformError) throw platformError;
        
        // Get the credential for this advertiser and platform
        const { data, error } = await supabase
          .from('platform_credentials')
          .select('id, profile_id, is_active')
          .eq('advertiser_id', advertiserId)
          .eq('platform_id', platformData.id)
          .eq('is_active', true)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setPlatformCredentialId(data.id);
        } else {
          setError('No Amazon Ads account connected');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching platform credential:', error);
        setError('Error loading account information');
        setLoading(false);
      }
    }
    
    if (advertiserId) {
      getPlatformCredential();
    }
  }, [advertiserId]);
  
  // Then, fetch campaigns when we have the platform credential ID
  useEffect(() => {
    async function fetchCampaigns() {
      if (!platformCredentialId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use our withRetry utility to handle transient failures with exponential backoff
        const campaigns = await withRetry(async () => {
          // Call the server-side function that will handle token management
          const { data, error } = await supabase.functions.invoke('amazon_ads', {
            body: {
              operation: 'list_campaigns',
              platformCredentialId
            }
          });
          
          if (error) throw new Error(error.message);
          return data;
        });
        
        setCampaigns(campaigns || []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    }
    
    if (platformCredentialId) {
      fetchCampaigns();
    }
  }, [platformCredentialId]);
  
  // Alternative method using direct API calls
  const fetchCampaignsDirectly = async () => {
    if (!platformCredentialId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get the profile ID for this platform credential
      const { data: credential } = await supabase
        .from('platform_credentials')
        .select('profile_id')
        .eq('id', platformCredentialId)
        .single();
      
      // Make API call using our token management utility
      const response = await callAmazonAdsApi(
        platformCredentialId,
        'https://advertising-api.amazon.com/v2/sp/campaigns',
        {
          headers: {
            'Amazon-Advertising-API-Scope': credential.profile_id
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const campaigns = await response.json();
      setCampaigns(campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns directly:', error);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Amazon Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
          {error === 'No Amazon Ads account connected' && (
            <Button 
              className="mt-4"
              onClick={() => {
                // Open the advertiser integrations page
                window.location.href = `/advertiser/${advertiserId}/integrations`;
              }}
            >
              Connect Amazon Ads
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Amazon Campaigns</CardTitle>
        <Button
          size="sm"
          onClick={fetchCampaignsDirectly}
          disabled={loading || !platformCredentialId}
        >
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No campaigns found
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div 
                key={campaign.campaignId}
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{campaign.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    campaign.state === 'enabled' ? 'bg-green-100 text-green-800' :
                    campaign.state === 'paused' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.state}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <div>Budget: ${(campaign.budget / 100).toFixed(2)}/day</div>
                  <div>Start Date: {formatDate(campaign.startDate)}</div>
                  {campaign.endDate && <div>End Date: {formatDate(campaign.endDate)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Format date from YYYYMMDD to localized format
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  return new Date(`${year}-${month}-${day}`).toLocaleDateString();
} 