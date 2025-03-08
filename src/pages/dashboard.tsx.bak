import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import AdvertiserDashboard from '@/components/AdvertiserDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { success, error } = router.query;
  
  useEffect(() => {
    // Handle success messages
    if (success === 'amazon_connected') {
      toast({
        title: 'Connection Successful',
        description: 'Your Amazon Ads account has been connected!',
        variant: 'default'
      });
      
      // Remove the query parameter
      router.replace('/dashboard', undefined, { shallow: true });
    }
    
    // Handle error messages
    if (error) {
      toast({
        title: 'Connection Failed',
        description: error as string,
        variant: 'destructive'
      });
      
      // Remove the query parameter
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [success, error, router, toast]);
  
  return <AdvertiserDashboard />;
} 