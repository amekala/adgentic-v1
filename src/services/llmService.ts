import { supabase, getAmazonLLMCredentials } from "@/integrations/supabase/client";
import { MessageProps } from '@/components/Message';
import { toast } from 'sonner';

// Enhanced logging for debugging
const logDebug = (message: string, data?: any) => {
  console.log(`[Amazon API] ${message}`, data || '');
};

// Helper function to check if a message is related to Amazon
const isAmazonRelatedQuery = (message: string): boolean => {
  const amazonKeywords = [
    'amazon', 'sponsored', 'ppc', 'advertising', 'campaign', 'ads',
    'product listing', 'sales', 'ranking', 'acos', 'roas', 'marketing',
    'budget', 'create campaign', 'report', 'performance'
  ];
  
  const hasKeyword = amazonKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );

  logDebug(`Message contains Amazon keywords: ${hasKeyword}`, message);
  return hasKeyword;
};

// Function to directly execute Amazon API operations for testing
export const testAmazonApiOperation = async (
  operation: string,
  params: any
): Promise<any> => {
  try {
    logDebug(`Testing Amazon API operation: ${operation}`, params);
    
    // Add default operation data for common operations
    let testParams = params;
    
    if (operation === 'create_campaign' && !testParams) {
      testParams = {
        name: "Test Campaign " + new Date().toISOString().split('T')[0],
        dailyBudget: 50,
        startDate: new Date().toISOString().split('T')[0],
        targetingType: "auto",
        state: "enabled"
      };
    } else if (operation === 'adjust_budget' && !testParams) {
      testParams = {
        campaignId: 123456789,
        newDailyBudget: 75
      };
    } else if (operation === 'get_campaign_report' && !testParams) {
      const date = new Date();
      const startDate = new Date();
      startDate.setDate(date.getDate() - 30);
      
      testParams = {
        campaignIds: 123456789,
        startDate: startDate.toISOString().split('T')[0],
        endDate: date.toISOString().split('T')[0]
      };
    }
    
    const result = await executeAmazonApiOperation(operation, testParams);
    return result;
  } catch (error) {
    console.error('Error testing Amazon API operation:', error);
    throw error;
  }
};

// Function to execute Amazon API operations based on LLM responses
const executeAmazonApiOperation = async (
  operation: string,
  params: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    logDebug(`Executing Amazon API operation: ${operation}`, params);
    
    // Get Amazon credentials for the API call
    const amazonCredentials = await getAmazonLLMCredentials();
    logDebug(`Retrieved credentials with profile ID: ${amazonCredentials.profileId}`);
    
    // Call the amazon_ads function with the operation and parameters
    const { data, error } = await supabase.functions.invoke('amazon_ads', {
      body: {
        operation,
        profileId: amazonCredentials.profileId,
        platformCredentialId: amazonCredentials.platformCredentialId,
        ...params
      }
    });
    
    if (error) {
      logDebug(`Error executing operation: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    logDebug(`Operation executed successfully`, data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error in Amazon API operation:', error);
    return { success: false, error: error.message };
  }
};

// Function to detect Amazon operation intents in user messages
const detectAmazonOperationIntent = (message: string): { 
  intent: string | null;
  params: any;
} => {
  const messageLower = message.toLowerCase();
  
  // Check for campaign creation intent
  if (
    messageLower.includes('create campaign') || 
    messageLower.includes('new campaign') || 
    messageLower.includes('start campaign') ||
    messageLower.includes('launch campaign') ||
    messageLower.includes('setup campaign')
  ) {
    logDebug(`Detected campaign creation intent`);
    
    // Extract basic parameters if available
    const params: any = {};
    
    // Try to extract campaign name
    const nameMatch = message.match(/campaign (?:called|named) ["']([^"']+)["']/i) ||
                     message.match(/["']([^"']+)["'] campaign/i);
    if (nameMatch) params.name = nameMatch[1];
    
    // Try to extract budget
    const budgetMatch = message.match(/budget (?:of )?\$?(\d+(?:\.\d+)?)/i) ||
                       message.match(/\$(\d+(?:\.\d+)?) (?:budget|per day)/i);
    if (budgetMatch) params.dailyBudget = parseFloat(budgetMatch[1]);
    
    // Try to extract date and targeting
    const targetingMatch = message.match(/(?:use |with |using )?(auto(?:matic)?|manual) targeting/i);
    if (targetingMatch) params.targetingType = targetingMatch[1].toLowerCase().startsWith('auto') ? 'auto' : 'manual';
    
    return { intent: 'create_campaign', params };
  }
  
  // Check for budget adjustment intent
  if (
    messageLower.includes('adjust budget') || 
    messageLower.includes('change budget') || 
    messageLower.includes('increase budget') ||
    messageLower.includes('decrease budget') ||
    messageLower.includes('update budget') ||
    messageLower.includes('set budget')
  ) {
    logDebug(`Detected budget adjustment intent`);
    
    // Extract basic parameters if available
    const params: any = {};
    
    // Try to extract campaign ID or name
    const campaignMatch = message.match(/campaign (?:called|named|:)? ["']([^"']+)["']/i) ||
                         message.match(/["']([^"']+)["'] campaign/i) ||
                         message.match(/campaign (?:id:? )?(\d+)/i);
    if (campaignMatch) params.campaignId = isNaN(Number(campaignMatch[1])) ? campaignMatch[1] : Number(campaignMatch[1]);
    
    // Try to extract budget
    const budgetMatch = message.match(/budget (?:of |to )?\$?(\d+(?:\.\d+)?)/i) ||
                       message.match(/\$(\d+(?:\.\d+)?) (?:budget|per day)/i);
    if (budgetMatch) params.newDailyBudget = parseFloat(budgetMatch[1]);
    
    return { intent: 'adjust_budget', params };
  }
  
  // Check for report generation intent
  if (
    messageLower.includes('generate report') || 
    messageLower.includes('get report') || 
    messageLower.includes('campaign report') ||
    messageLower.includes('show performance') ||
    messageLower.includes('performance report') ||
    messageLower.includes('campaign metrics')
  ) {
    logDebug(`Detected report generation intent`);
    
    // Extract basic parameters if available
    const params: any = {};
    
    // Try to extract campaign ID or name
    const campaignMatch = message.match(/campaign (?:called|named|:)? ["']([^"']+)["']/i) ||
                         message.match(/["']([^"']+)["'] campaign/i) ||
                         message.match(/campaign (?:id:? )?(\d+)/i);
    if (campaignMatch) params.campaignIds = isNaN(Number(campaignMatch[1])) ? campaignMatch[1] : Number(campaignMatch[1]);
    
    // Try to extract date range
    const dateRangeMatch = message.match(/(?:from|between|since) ([\w\d, ]+) (?:to|and|until) ([\w\d, ]+)/i);
    if (dateRangeMatch) {
      try {
        params.startDate = new Date(dateRangeMatch[1]).toISOString().split('T')[0];
        params.endDate = new Date(dateRangeMatch[2]).toISOString().split('T')[0];
      } catch (e) {
        // Invalid date format, will ask for clarification
      }
    } else if (message.match(/last (\d+) days/i)) {
      const daysMatch = message.match(/last (\d+) days/i);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }
    }
    
    return { intent: 'get_campaign_report', params };
  }
  
  // No specific Amazon operation intent detected
  return { intent: null, params: {} };
};

// Function to check if we have all required parameters for an operation
const getMissingParameters = (intent: string, params: any): string[] => {
  const missingParams: string[] = [];
  
  if (intent === 'create_campaign') {
    if (!params.name) missingParams.push('name');
    if (!params.dailyBudget) missingParams.push('dailyBudget');
    if (!params.startDate) missingParams.push('startDate');
    if (!params.targetingType) missingParams.push('targetingType');
  } else if (intent === 'adjust_budget') {
    if (!params.campaignId) missingParams.push('campaignId');
    if (!params.newDailyBudget) missingParams.push('newDailyBudget');
  } else if (intent === 'get_campaign_report') {
    if (!params.campaignIds) missingParams.push('campaignIds');
    if (!params.startDate) missingParams.push('startDate');
  }
  
  return missingParams;
};

// Function to call the OpenAI integration via Supabase Edge Function
export const callLLMAPI = async (
  userMessage: string, 
  previousMessages: MessageProps[], 
  campaignId: string | null = null, 
  campaignName: string | null = null
): Promise<MessageProps> => {
  try {
    console.log('Calling LLM API with message:', userMessage);
    console.log('Using campaignId:', campaignId);
    console.log('Using campaignName:', campaignName);
    
    // Check if this is a direct Amazon API call for testing
    if (userMessage.startsWith('/amazon-test')) {
      const commandMatch = userMessage.match(/\/amazon-test (\w+)(?:\s+(.*))?/);
      if (commandMatch) {
        const operation = commandMatch[1];
        let params = null;
        
        if (commandMatch[2]) {
          try {
            params = JSON.parse(commandMatch[2]);
          } catch (e) {
            return {
              role: 'assistant',
              content: `Error parsing parameters. Use JSON format: /amazon-test ${operation} {"param1": "value1"}`
            };
          }
        }
        
        logDebug(`Executing test Amazon API operation: ${operation}`, params);
        const result = await testAmazonApiOperation(operation, params);
        
        if (result.success) {
          return {
            role: 'assistant',
            content: `✅ Amazon API test successful!\n\nOperation: ${operation}\n\nResult:\n\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\``
          };
        } else {
          return {
            role: 'assistant',
            content: `❌ Amazon API test failed.\n\nOperation: ${operation}\n\nError: ${result.error}`
          };
        }
      }
    }
    
    // First, check if this is a direct Amazon operation intent
    if (isAmazonRelatedQuery(userMessage)) {
      // Try to detect specific Amazon operation intent
      const { intent, params } = detectAmazonOperationIntent(userMessage);
      
      if (intent) {
        logDebug(`Detected Amazon operation intent: ${intent}`, params);
        
        // Update conversations from previous messages
        const conversationParams = { ...params };
        for (const message of previousMessages) {
          if (message.role === 'user') {
            const prevIntent = detectAmazonOperationIntent(message.content);
            if (prevIntent.intent === intent) {
              // Merge parameters from previous messages
              Object.assign(conversationParams, prevIntent.params);
            }
          }
        }
        
        // Check if we have all required parameters
        const missingParams = getMissingParameters(intent, conversationParams);
        
        if (missingParams.length > 0) {
          // We're missing some parameters, ask for them
          logDebug(`Missing parameters for ${intent}: ${missingParams.join(', ')}`);
          
          let promptForMissing = '';
          if (intent === 'create_campaign') {
            promptForMissing = `I'd like to help you create an Amazon advertising campaign. To proceed, I need the following details:\n\n`;
            if (missingParams.includes('name')) promptForMissing += `- What would you like to name this campaign?\n`;
            if (missingParams.includes('dailyBudget')) promptForMissing += `- What daily budget would you like to set (in USD)?\n`;
            if (missingParams.includes('startDate')) promptForMissing += `- When should the campaign start? (Please provide a date)\n`;
            if (missingParams.includes('targetingType')) promptForMissing += `- Would you prefer automatic or manual targeting?\n`;
          } else if (intent === 'adjust_budget') {
            promptForMissing = `I'd like to help you adjust the budget for your Amazon campaign. To proceed, I need the following details:\n\n`;
            if (missingParams.includes('campaignId')) promptForMissing += `- Which campaign would you like to modify? (Please provide the name or ID)\n`;
            if (missingParams.includes('newDailyBudget')) promptForMissing += `- What should the new daily budget be (in USD)?\n`;
          } else if (intent === 'get_campaign_report') {
            promptForMissing = `I'd like to generate a performance report for your Amazon campaign. To proceed, I need the following details:\n\n`;
            if (missingParams.includes('campaignIds')) promptForMissing += `- Which campaign would you like to see a report for? (Please provide the name or ID)\n`;
            if (missingParams.includes('startDate')) promptForMissing += `- What time period would you like to analyze? (e.g., "last 30 days" or specific dates)\n`;
          }
          
          promptForMissing += `\nPlease provide the missing information so I can complete your request.`;
          
          return {
            role: 'assistant',
            content: promptForMissing
          };
        } else {
          // We have all required parameters, confirm and execute the operation
          logDebug(`All required parameters are available for ${intent}`, conversationParams);
          
          let confirmationMessage = '';
          if (intent === 'create_campaign') {
            confirmationMessage = `I'll create an Amazon advertising campaign with these details:\n\n` +
              `- Name: ${conversationParams.name}\n` +
              `- Daily Budget: $${conversationParams.dailyBudget}\n` +
              `- Start Date: ${conversationParams.startDate}\n` +
              `- Targeting: ${conversationParams.targetingType === 'auto' ? 'Automatic' : 'Manual'}\n\n` +
              `Would you like me to proceed with creating this campaign?`;
          } else if (intent === 'adjust_budget') {
            confirmationMessage = `I'll update the budget for campaign "${conversationParams.campaignId}" to $${conversationParams.newDailyBudget} per day.\n\n` +
              `Would you like me to proceed with this budget adjustment?`;
          } else if (intent === 'get_campaign_report') {
            confirmationMessage = `I'll generate a performance report for campaign "${conversationParams.campaignIds}" from ${conversationParams.startDate} to ${conversationParams.endDate || 'today'}.\n\n` +
              `Would you like me to proceed with generating this report?`;
          }
          
          return {
            role: 'assistant',
            content: confirmationMessage,
            toolCall: {
              type: 'api_call',
              operation: intent,
              params: conversationParams
            }
          };
        }
      }
    }
    
    // Filter out any undefined or null messages
    const filteredMessages = previousMessages.filter(msg => 
      msg && msg.role && msg.content
    );
    
    // Prepare messages in the format expected by the Edge Function
    const messageHistory = filteredMessages.map(msg => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content
    }));
    
    // Add context about campaigns if available
    const campaignContext = campaignId 
      ? `This is a conversation about the campaign: ${campaignName || 'unknown'}. `
      : 'This is a general conversation about retail media campaigns. ';
      
    const systemMessage = {
      role: 'system' as const,
      content: `You are Adspirer, an AI assistant specialized in advertising and marketing campaigns. 
               ${campaignContext}
               You help users optimize their ad campaigns and provide insights on marketing strategies.

               IMPORTANT: ALL responses should be well-formatted with a clear structure.

               When providing data-rich responses, use this JSON format inside your response:
               \`\`\`json
               {
                 "title": "Your Response Title",
                 "content": "Your detailed explanation here...",
                 "metrics": [
                   {"label": "Metric Name", "value": "Metric Value", "improvement": true/false},
                   ...
                 ],
                 "actionButtons": [
                   {"label": "Button Text", "primary": true/false},
                   ...
                 ]
               }
               \`\`\`
               
               For follow-up questions and conversations, ALWAYS use the same JSON structure, even if you don't have metrics
               to share. For example:
               
               \`\`\`json
               {
                 "title": "About Your CPC",
                 "content": "Your Cost Per Click is lower than average because your ad creative has a high relevance score and good click-through rate. This indicates your targeting is effective.",
                 "actionButtons": [
                   {"label": "Improve CTR Further", "primary": true},
                   {"label": "Compare to Industry", "primary": false}
                 ]
               }
               \`\`\`
               
               Always respond with structured, well-formatted information. Start every response with an informative title.`
    };
    
    // Create a new history array instead of modifying the original
    const completeMessageHistory = [
      systemMessage,
      ...messageHistory,
      {
        role: 'user' as const,
        content: userMessage
      }
    ];
    
    console.log('Sending message history to edge function:', completeMessageHistory);
    
    // Determine which edge function to call based on chat type
    const functionName = campaignId ? 'campaign_chat' : 'chat';
    console.log(`Invoking Supabase Edge Function: ${functionName}`);
    
    // Get Amazon credentials if the query is Amazon-related
    let amazonCredentials = null;
    if (isAmazonRelatedQuery(userMessage)) {
      try {
        amazonCredentials = await getAmazonLLMCredentials();
        console.log('Retrieved Amazon credentials for LLM with profile ID:', amazonCredentials.profileId);
      } catch (credentialError) {
        console.warn('Could not retrieve Amazon credentials:', credentialError);
      }
    }
    
    // Call the appropriate Supabase Edge Function
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { 
        messages: completeMessageHistory,
        context: {
          ...(campaignId ? { 
            campaignId, 
            campaignName,
            chatType: 'campaign' // Add chatType to ensure backward compatibility with both edge functions
          } : { chatType: 'general' }),
          // Include Amazon credentials in context if available
          ...(amazonCredentials ? {
            amazonProfileId: amazonCredentials.profileId,
            amazonCredentialId: amazonCredentials.platformCredentialId
          } : {})
        }
      }
    });
    
    if (error) {
      console.error('Error calling OpenAI via Edge Function:', error);
      throw new Error(error.message || 'Failed to get response from AI');
    }
    
    console.log('Raw response from Edge Function:', data);
    
    // Handle the response from the edge function
    // The response structure may be different between regular and campaign chats
    let assistantMessage: MessageProps = {
      role: 'assistant',
      content: 'I apologize, but I encountered an issue processing your request.'
    };
    
    if (!data) {
      console.error('No data received from edge function');
      throw new Error('No response data received from AI service');
    }
    
    // Handle different response formats
    if (typeof data === 'string') {
      // Simple string response
      assistantMessage.content = data;
    } else if (data.content) {
      // Object with content property (new format)
      assistantMessage.content = data.content;
      
      // Handle any follow-up questions and action buttons
      if (data.followupQuestions) {
        assistantMessage.followupQuestions = data.followupQuestions;
      }
      
      if (data.actionButtons) {
        assistantMessage.actionButtons = data.actionButtons;
      }
      
      // Check if we have a tool call (API operation request)
      if (data.toolCall && data.toolCall.type === 'api_call') {
        // Ask user for confirmation before executing the API call
        const userConfirmed = window.confirm(
          `Would you like to ${data.toolCall.operation.replace('_', ' ')} now? This will make changes to your Amazon Advertising account.`
        );
        
        if (userConfirmed) {
          // Show loading state
          toast.loading(`Executing ${data.toolCall.operation.replace('_', ' ')}...`);
          
          // Execute the Amazon API operation
          const apiResult = await executeAmazonApiOperation(
            data.toolCall.operation,
            data.toolCall.params
          );
          
          // Dismiss loading toast
          toast.dismiss();
          
          if (apiResult.success) {
            // Add a success message to the content
            let successMessage = '';
            
            switch (data.toolCall.operation) {
              case 'create_campaign':
                successMessage = `✅ Successfully created campaign "${data.toolCall.params.name}" with daily budget $${data.toolCall.params.dailyBudget}.`;
                break;
              case 'adjust_budget':
                successMessage = `✅ Successfully updated campaign budget to $${data.toolCall.params.newDailyBudget}.`;
                break;
              case 'get_campaign_report':
                // Format the report data
                if (apiResult.data?.text) {
                  successMessage = `\n\n${apiResult.data.text}`;
                } else {
                  successMessage = `✅ Successfully generated campaign report.`;
                }
                break;
              default:
                successMessage = `✅ Successfully completed ${data.toolCall.operation.replace('_', ' ')}.`;
            }
            
            assistantMessage.content += `\n\n${successMessage}`;
            toast.success(`Successfully completed operation!`);
          } else {
            // Add the error message
            assistantMessage.content += `\n\n❌ Error: ${apiResult.error || 'Something went wrong with the operation.'}`;
            toast.error(`Error: ${apiResult.error || 'Operation failed'}`);
          }
        } else {
          // User declined, add message indicating this
          assistantMessage.content += `\n\nYou declined to execute the ${data.toolCall.operation.replace('_', ' ')} operation. Let me know if you'd like to try again or do something else.`;
        }
      }
    } else if (data.text || data.message) {
      // Old format
      assistantMessage.content = data.text || data.message;
    }
    
    // Try to extract structured data if present
    const structuredData = extractStructuredData(assistantMessage.content);
    if (structuredData) {
      assistantMessage.structuredData = structuredData;
    }
    
    console.log('Processed assistant response:', assistantMessage);
    return assistantMessage;
  } catch (error: any) {
    console.error('Error in LLM API call:', error);
    return {
      role: 'assistant',
      content: `I apologize, but I encountered an error: ${error.message || 'Unknown error'}. Please try again or rephrase your question.`
    };
  }
};

// Helper function to extract structured JSON data from a response
function extractStructuredData(content: string) {
  try {
    // Look for JSON blocks in markdown format
    const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/);
    
    if (jsonMatch && jsonMatch[1]) {
      // Parse the JSON data
      const jsonData = JSON.parse(jsonMatch[1]);
      return jsonData;
    }
    
    return null;
  } catch (error) {
    console.warn('Could not extract structured data from response:', error);
    return null;
  }
}
