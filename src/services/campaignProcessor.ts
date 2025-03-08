import { supabase } from '@/integrations/supabase/client';
import { MessageProps } from '@/components/Message';
import { toast } from '@/hooks/use-toast';

/**
 * Interface for conversation context data
 */
interface ConversationContext {
  messages: MessageProps[];
  campaignId?: string | null;
  campaignName?: string | null;
  userId?: string | null;
}

/**
 * Interface for campaign action results
 */
interface CampaignActionResult {
  success: boolean;
  message: string;
  data?: any;
  actionType?: string;
}

/**
 * Process conversation to detect and execute campaign actions
 * This uses a secondary LLM to analyze conversations and determine actions
 */
export const processCampaignActions = async (
  context: ConversationContext
): Promise<CampaignActionResult> => {
  try {
    console.log('Processing conversation for campaign actions');
    
    // Call the campaign_processor edge function with the conversation context
    const { data, error } = await supabase.functions.invoke('campaign_processor', {
      body: { 
        messages: context.messages,
        context: {
          campaignId: context.campaignId,
          campaignName: context.campaignName,
          userId: context.userId
        }
      }
    });
    
    if (error) {
      console.error('Error processing campaign actions:', error);
      return {
        success: false,
        message: `Failed to process campaign actions: ${error.message}`
      };
    }
    
    console.log('Campaign processor response:', data);
    
    // If no action was detected
    if (!data || !data.action) {
      return {
        success: true,
        message: 'No campaign action detected',
        actionType: 'none'
      };
    }
    
    // Return the action result
    return {
      success: true,
      message: data.message || 'Campaign action processed',
      data: data.data,
      actionType: data.action
    };
    
  } catch (error) {
    console.error('Error in campaign processor:', error);
    return {
      success: false,
      message: `Campaign processing error: ${error.message}`
    };
  }
};

/**
 * Fetch campaign data from Amazon Ads API
 */
export const fetchAmazonCampaignData = async (campaignId: string): Promise<any> => {
  try {
    console.log(`Fetching Amazon campaign data for campaign ID: ${campaignId}`);
    
    // Call the amazon_ads edge function to proxy API requests
    const { data, error } = await supabase.functions.invoke('amazon_ads', {
      body: { 
        operation: 'get_campaign',
        campaignId
      }
    });
    
    if (error) {
      console.error('Error fetching Amazon campaign data:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch campaign data: ${error.message}`,
        variant: 'destructive'
      });
      return null;
    }
    
    console.log('Amazon campaign data:', data);
    return data;
    
  } catch (error) {
    console.error('Error in fetchAmazonCampaignData:', error);
    toast({
      title: 'Error',
      description: `API request failed: ${error.message}`,
      variant: 'destructive'
    });
    return null;
  }
};

/**
 * Create a new campaign on Amazon Ads
 */
export const createAmazonCampaign = async (campaignData: any): Promise<any> => {
  try {
    console.log('Creating new Amazon campaign with data:', campaignData);
    
    // Call the amazon_ads edge function to proxy API requests
    const { data, error } = await supabase.functions.invoke('amazon_ads', {
      body: { 
        operation: 'create_campaign',
        campaignData
      }
    });
    
    if (error) {
      console.error('Error creating Amazon campaign:', error);
      toast({
        title: 'Error',
        description: `Failed to create campaign: ${error.message}`,
        variant: 'destructive'
      });
      return null;
    }
    
    console.log('New Amazon campaign created:', data);
    toast({
      title: 'Success',
      description: 'New campaign created successfully'
    });
    
    return data;
    
  } catch (error) {
    console.error('Error in createAmazonCampaign:', error);
    toast({
      title: 'Error',
      description: `Campaign creation failed: ${error.message}`,
      variant: 'destructive'
    });
    return null;
  }
};

/**
 * Update an existing campaign on Amazon Ads
 */
export const updateAmazonCampaign = async (campaignId: string, updateData: any): Promise<any> => {
  try {
    console.log(`Updating Amazon campaign ${campaignId} with data:`, updateData);
    
    // Call the amazon_ads edge function to proxy API requests
    const { data, error } = await supabase.functions.invoke('amazon_ads', {
      body: { 
        operation: 'update_campaign',
        campaignId,
        updateData
      }
    });
    
    if (error) {
      console.error('Error updating Amazon campaign:', error);
      toast({
        title: 'Error',
        description: `Failed to update campaign: ${error.message}`,
        variant: 'destructive'
      });
      return null;
    }
    
    console.log('Amazon campaign updated:', data);
    toast({
      title: 'Success',
      description: 'Campaign updated successfully'
    });
    
    return data;
    
  } catch (error) {
    console.error('Error in updateAmazonCampaign:', error);
    toast({
      title: 'Error',
      description: `Campaign update failed: ${error.message}`,
      variant: 'destructive'
    });
    return null;
  }
};

/**
 * Get test campaign data for demonstration purposes
 */
export const getTestCampaignData = async (): Promise<any> => {
  // This is your test campaign data from the Amazon Advertising API
  return {
    campaignId: 306693373344074,
    name: "Test Campaign",
    tactic: "T00020",
    startDate: "20250308",
    endDate: "20251231",
    state: "enabled",
    costType: "cpc",
    budget: 10000.0,
    budgetType: "daily",
    deliveryProfile: "as_soon_as_possible"
  };
}; 