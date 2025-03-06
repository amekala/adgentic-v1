import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdvertiserIntegrations from '@/components/AdvertiserIntegrations';

export default function AdvertiserDashboard() {
  const [advertiser, setAdvertiser] = useState<any>(null);
  const [hasPlatforms, setHasPlatforms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchAdvertiserData();
  }, []);
  
  const fetchAdvertiserData = async () => {
    setIsLoading(true);
    try {
      // Get the current user and their advertiser
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');
      
      // For testing, you can use your test email to identify the account
      const { data: advertiser, error } = await supabase
        .from('advertisers')
        .select('*')
        .eq('company_email', 'abhilashreddi@gmail.com') // You can make this dynamic later
        .single();
        
      if (error) throw error;
      
      setAdvertiser(advertiser);
      
      // Check if this advertiser has any connected platforms
      const { data: platforms, error: platformsError } = await supabase
        .from('platform_credentials')
        .select('id')
        .eq('advertiser_id', advertiser.id);
        
      if (platformsError) throw platformsError;
      
      setHasPlatforms(platforms && platforms.length > 0);
    } catch (error) {
      console.error('Error fetching advertiser:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!advertiser) {
    return <div>No advertiser account found</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard: {advertiser.name}</h1>
      
      {!hasPlatforms && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold">Complete your setup</h2>
          <p className="mb-2">Connect your ad platforms to start managing campaigns</p>
          <AdvertiserIntegrations advertiserId={advertiser.id} />
        </div>
      )}
      
      {/* Rest of your dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dashboard widgets */}
      </div>
      
      {/* Only show if platforms are connected or as a tab */}
      {hasPlatforms && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Your Campaigns</h2>
          {/* Campaign listing */}
        </div>
      )}
      
      {/* Always show integrations section but maybe in a tab or lower on the page */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Integrations</h2>
        <AdvertiserIntegrations advertiserId={advertiser.id} />
      </div>
    </div>
  );
} 