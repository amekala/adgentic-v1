import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export default function AdvertiserIntegrations({ advertiserId }: { advertiserId: string }) {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnectedPlatforms();
  }, [advertiserId]);

  const fetchConnectedPlatforms = async () => {
    setIsLoading(true);
    try {
      // Get connected platforms
      const { data, error } = await supabase
        .from('platform_credentials')
        .select(`
          id, 
          platform_id,
          profile_id,
          is_active,
          created_at
        `)
        .eq('advertiser_id', advertiserId);
        
      if (error) throw error;
      
      setPlatforms(data || []);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load connected platforms',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectAmazonAds = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('amazon-auth', {
        body: { 
          operation: 'get_auth_url',
          advertiserId
        }
      });
      
      if (error) throw error;
      
      // Open in a new window
      window.open(data.authUrl, 'AmazonAdsAuth', 'width=600,height=800');
      
      toast({
        title: 'Connecting...',
        description: 'Please complete the authentication in the popup window',
      });
    } catch (error) {
      console.error('Error initiating connection:', error);
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ad Platform Integrations</CardTitle>
        <CardDescription>
          Connect your advertising accounts to enable campaign management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <img 
                src="/amazon-ads-logo.png" 
                alt="Amazon Ads" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h3 className="font-medium">Amazon Advertising</h3>
                <p className="text-sm text-gray-500">
                  {platforms.some(p => p.platform_id === 'amazon-ads') 
                    ? 'Connected' 
                    : 'Not connected'}
                </p>
              </div>
            </div>
            <Button 
              onClick={connectAmazonAds}
              variant={platforms.some(p => p.platform_id === 'amazon-ads') ? 'outline' : 'default'}
            >
              {platforms.some(p => p.platform_id === 'amazon-ads') ? 'Reconnect' : 'Connect'}
            </Button>
          </div>
          
          {/* Add other platforms here in the future */}
        </div>
      </CardContent>
    </Card>
  );
} 