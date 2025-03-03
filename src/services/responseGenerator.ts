
import { MessageProps } from '@/components/Message';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const generateResponse = async (userMessage: string): Promise<MessageProps> => {
  const messageLower = userMessage.toLowerCase();
  
  try {
    // First try to get a response from the AI
    try {
      console.log("Trying to get AI response from Edge Function...");
      
      // Check if Supabase client is properly configured
      console.log("Invoking Supabase Edge Function: chat");
      
      // Try to get a response from the Supabase Edge Function
      const response = await supabase.functions.invoke('chat', {
        body: { 
          messages: [
            { 
              role: 'system', 
              content: 'You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. Keep your response brief and concise, under 200 words.'
            },
            { role: 'user', content: userMessage }
          ]
        }
      });
      
      console.log("Edge Function response:", response);
      
      if (response.error) {
        console.error("Edge Function error:", response.error);
        throw new Error(`Edge Function error: ${response.error.message || JSON.stringify(response.error)}`);
      }
      
      if (response.data && response.data.content) {
        // If we get a successful response from the AI
        console.log("Successfully received AI response:", response.data.content.substring(0, 100) + "...");
        return {
          role: 'assistant' as const,
          content: response.data.content,
          actionButtons: [
            { label: 'Performance Analysis', primary: false },
            { label: 'Keyword Optimization', primary: false },
            { label: 'Budget Allocation', primary: false },
            { label: 'Create Campaign', primary: true }
          ]
        };
      } else {
        console.log("No content in response, structure:", JSON.stringify(response.data));
        
        // If there's no content property but there's a message or text property
        if (response.data) {
          if (response.data.message) {
            return {
              role: 'assistant' as const,
              content: response.data.message,
              actionButtons: [
                { label: 'Create Campaign', primary: true }
              ]
            };
          } else if (response.data.choices && response.data.choices[0]?.message?.content) {
            return {
              role: 'assistant' as const,
              content: response.data.choices[0].message.content,
              actionButtons: [
                { label: 'Create Campaign', primary: true }
              ]
            };
          }
        }
        
        console.log("No recognizable content in response, falling back to scenario-based responses");
      }
    } catch (error: any) {
      console.error('Error calling AI service:', error);
      // Toast the error to make it visible to the user
      toast({
        title: "AI Service Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
      // Fall back to scenario-based responses
    }
    
    return getScenarioBasedResponse(messageLower);
  } catch (error: any) {
    console.error('Error generating response:', error);
    return {
      role: 'assistant' as const,
      content: "I'm sorry, I encountered an error processing your request. Please try again later.",
      actionButtons: [
        { label: 'Create Campaign', primary: true }
      ]
    };
  }
};

// Function to get scenario-based responses
const getScenarioBasedResponse = (messageLower: string): MessageProps => {
  // Performance analysis scenario
  if (messageLower.includes('performance') || messageLower.includes('analytics') || messageLower.includes('report')) {
    return {
      role: 'assistant' as const,
      content: "Here's the performance data for your campaigns over the past 7 days:",
      metrics: [
        { label: 'Impressions', value: '142,587', improvement: true },
        { label: 'Clicks', value: '3,842', improvement: true },
        { label: 'CTR', value: '2.69%', improvement: true },
        { label: 'ACOS', value: '15.8%', improvement: true },
        { label: 'Spend', value: '$4,215', improvement: false },
        { label: 'Sales', value: '$26,678', improvement: true }
      ],
      actionButtons: [
        { label: 'View Detailed Report', primary: false },
        { label: 'Optimize Campaigns', primary: true }
      ]
    };
  }
  
  // Keyword optimization scenario
  else if (messageLower.includes('keyword') || messageLower.includes('search terms')) {
    return {
      role: 'assistant' as const,
      content: "Based on your campaign performance, I recommend the following keyword changes:",
      metrics: [
        { label: 'Under-performing Keywords', value: '8', improvement: false },
        { label: 'Suggested New Keywords', value: '12', improvement: true },
        { label: 'Potential CTR Increase', value: '23%', improvement: true },
        { label: 'Estimated ACOS Impact', value: '-12%', improvement: true }
      ],
      actionButtons: [
        { label: 'Review All Changes', primary: false },
        { label: 'Apply Recommendations', primary: true }
      ]
    };
  }
  
  // Budget allocation scenario
  else if (messageLower.includes('budget') || messageLower.includes('spend') || messageLower.includes('allocation')) {
    return {
      role: 'assistant' as const,
      content: "Based on ROAS analysis, I recommend the following budget allocation:",
      metrics: [
        { label: 'Amazon (current)', value: '65%', improvement: false },
        { label: 'Amazon (recommended)', value: '50%', improvement: true },
        { label: 'Walmart (current)', value: '25%', improvement: false },
        { label: 'Walmart (recommended)', value: '30%', improvement: true },
        { label: 'Instacart (current)', value: '10%', improvement: false },
        { label: 'Instacart (recommended)', value: '20%', improvement: true }
      ],
      actionButtons: [
        { label: 'Adjust Manually', primary: false },
        { label: 'Apply Recommendations', primary: true }
      ]
    };
  }
  
  // Campaign creation assistance
  else if (messageLower.includes('create') || messageLower.includes('new campaign') || messageLower.includes('setup')) {
    return {
      role: 'assistant' as const,
      content: "I'd be happy to help you set up a new campaign. What type of campaign are you looking to create?",
      actionButtons: [
        { label: 'Sponsored Products', primary: false },
        { label: 'Sponsored Brands', primary: false },
        { label: 'Sponsored Display', primary: false },
        { label: 'Custom Campaign', primary: true }
      ]
    };
  }
  
  // Default response for other queries
  else {
    return {
      role: 'assistant' as const,
      content: "I'm here to help optimize your retail media campaigns. You can ask me about performance analytics, keyword optimization, budget allocation, or campaign creation.",
      actionButtons: [
        { label: 'Performance Analysis', primary: false },
        { label: 'Keyword Optimization', primary: false },
        { label: 'Budget Allocation', primary: false },
        { label: 'Create Campaign', primary: true }
      ]
    };
  }
};
