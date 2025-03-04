
import { Message } from './types';

export const ensureValidRole = (role: string): 'user' | 'assistant' | 'system' => {
  if (role === 'user' || role === 'assistant' || role === 'system') {
    return role;
  }
  console.warn(`Invalid role: ${role}, defaulting to 'assistant'`);
  return 'assistant';
};

export const formatBreadcrumbItems = (
  chatData: { title: string } | null, 
  chatId: string | undefined, 
  campaignId: string | null, 
  campaign: { campaign_name: string } | null
) => {
  const items = [
    { 
      label: "Home", 
      href: "/app",
      type: "home",
      id: "home"
    },
  ];

  if (campaign) {
    items.push({ 
      label: campaign.campaign_name, 
      href: `/campaign/${campaignId}`,
      type: "campaign", 
      id: campaignId as string 
    });
    
    items.push({ 
      label: chatData?.title || 'New Chat', 
      href: `/chat/${chatId}${campaignId ? `?campaign_id=${campaignId}` : ''}`,
      type: "chat",
      id: chatId || 'new'
    });
  } else {
    items.push({ 
      label: chatData?.title || 'New Chat', 
      href: `/chat/${chatId}`,
      type: "chat",
      id: chatId || 'new'
    });
  }

  return items;
};
