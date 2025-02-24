
export type CampaignStatus = 'live' | 'paused' | 'draft';
export type TargetingType = 'automatic' | 'manual_keyword' | 'manual_product';
export type RetailPlatform = 'amazon_sp' | 'walmart_sp' | 'instacart_sp';

export interface Campaign {
  id: string;
  created_at: string;
  campaign_name: string;
  platform: RetailPlatform;
  campaign_status: CampaignStatus;
  daily_budget: number;
  targeting_type: TargetingType;
  product_asins: string[];
  goals_description?: string;
  campaign_notes?: string;
  
  // Performance metrics
  roas_last_7_days: number;
  sales_last_7_days: number;
  spend_last_7_days: number;
  clicks_last_7_days: number;
  impressions_last_7_days: number;
  ctr_last_7_days: number;
  sales_lift_last_7_days: number;
}

export type NewCampaign = Omit<Campaign, 'id' | 'created_at'>;
