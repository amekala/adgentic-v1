import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import { supabase } from '@/integrations/supabase/client';
import AdvertiserIntegrations from '@/components/AdvertiserIntegrations';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, BellRing } from 'lucide-react';

function Dashboard() {
  const location = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [advertiser, setAdvertiser] = useState<any>(null);
  const [loadingAdvertiser, setLoadingAdvertiser] = useState(true);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  
  // Get success/error parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  
  useEffect(() => {
    // Handle success messages
    if (success === 'amazon_connected') {
      toast({
        title: 'Connection Successful',
        description: 'Your Amazon Ads account has been connected!',
      });
      setTestStatus('success');
      setTestMessage('Amazon Ads API connection successful! The OAuth flow is working correctly.');
    }
    
    // Handle error messages
    if (error) {
      toast({
        title: 'Connection Failed',
        description: error,
        variant: 'destructive'
      });
      setTestStatus('error');
      setTestMessage(`Error: ${error}`);
    }
  }, [success, error, toast]);
  
  useEffect(() => {
    fetchAdvertiserData();
  }, []);
  
  const fetchAdvertiserData = async () => {
    setLoadingAdvertiser(true);
    try {
      // For testing purposes, we'll use a hardcoded advertiser
      setAdvertiser({
        id: '123e4567-e89b-12d3-a456-426614174000', // Using proper UUID format
        name: 'Test Advertiser Account',
        company_email: 'abhilashreddi@gmail.com'
      });
    } catch (error) {
      console.error('Error fetching advertiser:', error);
    } finally {
      setLoadingAdvertiser(false);
    }
  };

  const testAmazonAdsConnection = async () => {
    try {
      setTestStatus('running');
      setTestMessage('Initiating Amazon Ads API connection test...');
      
      // Use the test advertiser ID
      const advertiserId = '123e4567-e89b-12d3-a456-426614174000';
      
      const { data, error } = await supabase.functions.invoke('amazon-auth', {
        body: { 
          operation: 'get_auth_url',
          advertiserId
        }
      });
      
      if (error) throw error;
      
      // Open in a new window
      window.open(data.authUrl, 'AmazonAdsAuth', 'width=600,height=800');
      
      setTestMessage('Authentication window opened. Please complete the login process in the popup window.');
      
      toast({
        title: 'Testing Connection',
        description: 'Please complete the authentication in the popup window',
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestStatus('error');
      setTestMessage(`Error initiating connection: ${error.message || 'Unknown error'}`);
      
      toast({
        title: 'Test Failed',
        description: error.message || 'Failed to connect to Amazon Ads',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex h-screen bg-[#212121]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={() => {}}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} />
        
        <div className="flex flex-col h-full pt-[60px] overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8 w-full">
            <h1 className="text-3xl font-bold text-white mb-8">Advertising Dashboard</h1>

            {/* API Test Status */}
            {testStatus !== 'idle' && (
              <Alert className={`mb-6 ${
                testStatus === 'running' ? 'bg-blue-950/50 text-blue-200' :
                testStatus === 'success' ? 'bg-green-950/50 text-green-200' :
                'bg-red-950/50 text-red-200'
              }`}>
                <div className="flex items-start">
                  {testStatus === 'running' && <BellRing className="h-5 w-5 mr-2 text-blue-400" />}
                  {testStatus === 'success' && <CheckCircle2 className="h-5 w-5 mr-2 text-green-400" />}
                  {testStatus === 'error' && <AlertCircle className="h-5 w-5 mr-2 text-red-400" />}
                  <div>
                    <AlertTitle className={`
                      ${testStatus === 'running' ? 'text-blue-300' :
                        testStatus === 'success' ? 'text-green-300' :
                        'text-red-300'}
                    `}>
                      {testStatus === 'running' ? 'Test in Progress' :
                       testStatus === 'success' ? 'Test Successful' :
                       'Test Failed'}
                    </AlertTitle>
                    <AlertDescription className="mt-2 text-sm opacity-90">
                      {testMessage}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {loadingAdvertiser ? (
              <div className="text-center p-8">
                <p className="text-gray-400">Loading advertiser data...</p>
              </div>
            ) : advertiser ? (
              <div className="space-y-8">
                <Card className="bg-[#2F2F2F] border border-[#383737] text-white">
                  <CardHeader>
                    <CardTitle>Ad Platform Integrations</CardTitle>
                    <CardDescription className="text-gray-400">
                      Connect your advertising accounts to enable campaign management
                    </CardDescription>
                  </CardHeader>
                  {/* We pass the advertiser ID to the AdvertiserIntegrations component */}
                  <CardContent>
                    <AdvertiserIntegrations advertiserId={advertiser.id} />
                  </CardContent>
                </Card>

                <Card className="bg-[#2F2F2F] border border-[#383737] text-white">
                  <CardHeader>
                    <CardTitle>API Connection Test</CardTitle>
                    <CardDescription className="text-gray-400">
                      Test your Amazon Ads API connection to verify it's working correctly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-300">
                        Click the button below to test the Amazon Ads API connection. This will verify that:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300 ml-4">
                        <li>The OAuth authorization URL is generated correctly</li>
                        <li>The popup window opens with the Amazon login page</li>
                        <li>After login, the callback URL works properly</li>
                        <li>The tokens are stored in your database</li>
                      </ol>
                      <Button
                        onClick={testAmazonAdsConnection}
                        className="bg-blue-600 hover:bg-blue-700 text-white mt-4"
                        disabled={testStatus === 'running'}
                      >
                        {testStatus === 'running' ? 'Test in Progress...' : 'Test Amazon Ads API Connection'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-white">No advertiser account found. Please contact support.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 