import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export default function AdvertiserIntegrations({ advertiserId }: { advertiserId: string }) {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useTestAccount, setUseTestAccount] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnectedPlatforms();
  }, [advertiserId]);

  const fetchConnectedPlatforms = async () => {
    setIsLoading(true);
    try {
      // Get connected platforms
      const { data, error } = await supabase.functions.invoke('token_manager', {
        body: { 
          operation: 'list_connected_platforms',
          advertiserId
        }
      });
        
      if (error) throw error;
      
      setPlatforms(data?.platforms || []);
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
          advertiserId,
          useTestAccount
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

  const getAmazonPlatform = () => {
    return platforms.find(p => p.platform_name === 'amazon');
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
          <div className="flex flex-col p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img 
                  src="/amazon-ads-logo.png" 
                  alt="Amazon Ads" 
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h3 className="font-medium">Amazon Advertising</h3>
                  <p className="text-sm text-gray-500">
                    {getAmazonPlatform() 
                      ? `Connected (Profile ID: ${getAmazonPlatform().profile_id})` 
                      : 'Not connected'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={connectAmazonAds}
                variant={getAmazonPlatform() ? 'outline' : 'default'}
              >
                {getAmazonPlatform() ? 'Reconnect' : 'Connect'}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="use-test-account"
                checked={useTestAccount}
                onCheckedChange={setUseTestAccount}
              />
              <Label htmlFor="use-test-account">Use test account</Label>
              {useTestAccount && (
                <div className="text-xs text-amber-600 ml-2">
                  This will create a test Amazon Advertising account for development purposes.
                </div>
              )}
            </div>
            
            {getAmazonPlatform() && getAmazonPlatform().token_status === 'expired' && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  Your Amazon Ads connection has expired. Please reconnect your account.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {/* Add other platforms here in the future */}
        </div>
      </CardContent>
    </Card>
  );
} 