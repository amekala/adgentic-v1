
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ChatInterface from './ChatInterface';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface IndexContentProps {
  isSidebarOpen: boolean;
  onNewCampaign: () => void;
}

interface Campaign {
  id: string;
  campaign_name: string;
  created_at: string;
  platform: string;
  campaign_status: string;
}

const IndexContent = ({ isSidebarOpen, onNewCampaign }: IndexContentProps) => {
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentCampaigns = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('created_by', user?.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentCampaigns(data || []);
      } catch (error: any) {
        console.error('Error fetching campaigns:', error);
        toast({
          title: "Error fetching campaigns",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchRecentCampaigns();
    }
  }, [user, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleCampaignClick = (id: string) => {
    navigate(`/campaign/${id}`);
  };

  const handleActionClick = (action: string) => {
    if (action === 'new-campaign') {
      onNewCampaign();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 h-full pt-[60px]">
      <div className="md:col-span-2 flex flex-col">
        <ChatInterface onActionClick={handleActionClick} />
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Campaigns</h2>
          <Button onClick={onNewCampaign} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : recentCampaigns.length > 0 ? (
          <div className="space-y-4">
            {recentCampaigns.map((campaign) => (
              <Card 
                key={campaign.id}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => handleCampaignClick(campaign.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{campaign.campaign_name}</CardTitle>
                  <CardDescription>Created on {formatDate(campaign.created_at)}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">{campaign.platform}</div>
                    <div className="px-2 py-1 rounded-full text-xs capitalize bg-blue-100 text-blue-800">
                      {campaign.campaign_status}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">No campaigns yet</CardTitle>
              <CardDescription>Create your first campaign to get started</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button onClick={onNewCampaign} className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IndexContent;
