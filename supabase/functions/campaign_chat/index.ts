
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://deno.land/x/openai@v4.23.0/mod.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(req)
    });
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('Missing OpenAI API Key');
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: corsHeaders(req)
      });
    }

    // Create auth client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' }
      });
    }
    
    const supabaseUrl = Deno.env.get('PUBLIC_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('PUBLIC_SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key available:', !!supabaseAnonKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), { 
        status: 500,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const requestData = await req.json();
    const { messages, context } = requestData;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    // Process the most recent user message to detect Amazon campaign queries
    const latestUserMessage = messages.slice().reverse().find(msg => msg.role === 'user');
    const amazonCampaignData = await checkForAmazonCampaignQueries(latestUserMessage?.content, supabase, context);
    
    let systemContext = '';
    if (context?.campaignName) {
      systemContext = `You are discussing the campaign: ${context.campaignName}.`;
    } else if (amazonCampaignData?.hasAmazonCampaigns) {
      systemContext = 'You are discussing Amazon Advertising campaigns.';
    } else {
      systemContext = 'You are discussing marketing campaigns.';
    }

    // Update system message with campaign context and enhanced formatting instructions
    const systemMessageIndex = messages.findIndex(m => m.role === 'system');
    const enhancedSystemPrompt = `You are Adspirer, an AI assistant specialized in advertising and marketing campaigns. ${systemContext}

Your responses should be:
1. Well-formatted with markdown for readability (use headings, bullets, bold, etc.)
2. Concise and focused on answering the user's query
3. Include relevant metrics when discussing performance
4. Include specific actionable recommendations

You MUST end EVERY response with a section titled "Follow-up Questions:" that contains 3-4 highly relevant and specific questions based on the current conversation context. These questions should help the user dig deeper into the topic they're asking about.`;

    // Either update existing system message or insert a new one
    if (systemMessageIndex >= 0) {
      messages[systemMessageIndex].content = enhancedSystemPrompt;
    } else {
      messages.unshift({ role: 'system', content: enhancedSystemPrompt });
    }

    // Insert Amazon campaign data as an assistant message if available
    if (amazonCampaignData?.campaignInfo) {
      messages.push({
        role: 'assistant',
        content: "I've retrieved information about your Amazon advertising campaigns:"
      });
      
      messages.push({
        role: 'function',
        name: 'get_amazon_campaigns',
        content: amazonCampaignData.campaignInfo
      });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(messages, context);

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in campaign chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});

// Check if the user's query is about Amazon campaigns and retrieve relevant data
async function checkForAmazonCampaignQueries(userMessage, supabase, context) {
  if (!userMessage) return null;
  
  // Check if the message contains Amazon campaign related keywords
  const amazonKeywords = [
    'amazon campaign', 'amazon ad', 'amazon ads', 'amazon advertising',
    'sponsored product', 'sponsored brand', 'sponsored display',
    'amazon ppc', 'amazon performance', 'amazon spend'
  ];
  
  const campaignQuestions = [
    'what campaigns', 'which campaigns', 'show me campaigns', 'list campaigns',
    'my campaigns', 'running campaigns', 'active campaigns', 'campaign performance',
    'campaign stats', 'campaign results', 'how are my campaigns'
  ];
  
  const messageHasAmazonKeywords = amazonKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword.toLowerCase())
  );
  
  const messageAskingForCampaigns = campaignQuestions.some(question => 
    userMessage.toLowerCase().includes(question.toLowerCase())
  );
  
  // If the message is asking about campaigns (either explicitly Amazon or generally)
  if (messageAskingForCampaigns || messageHasAmazonKeywords) {
    try {
      // Check if we have Amazon credentials in the context (from LLM service)
      const amazonCredentialId = context?.amazonCredentialId;
      const amazonProfileId = context?.amazonProfileId || "3211012118364113"; // Use hardcoded fallback
      
      // If we already have credential ID from context, use it directly
      if (amazonCredentialId) {
        console.log('Using Amazon credential ID from context:', amazonCredentialId);
        console.log('Using Amazon profile ID:', amazonProfileId);
        
        // Call the amazon_ads function to retrieve campaigns with the credentials from context
        const { data: amazonData, error } = await supabase.functions.invoke('amazon_ads', {
          body: {
            operation: 'list_campaigns',
            platformCredentialId: amazonCredentialId,
            profileId: amazonProfileId,
            chatMode: true
          }
        });
        
        if (error) throw error;
        
        return {
          hasAmazonCampaigns: true,
          campaignInfo: amazonData.text
        };
      }
      
      // Fall back to looking up credentials if not provided in context
      // Look up Amazon platform in the database
      const { data: platformData } = await supabase
        .from('ad_platforms')
        .select('id')
        .eq('name', 'amazon')
        .single();
      
      if (!platformData?.id) return null;
      
      // Find active platform credentials using the hardcoded profile ID
      const { data: credentials } = await supabase
        .from('platform_credentials')
        .select('id')
        .eq('profile_id', amazonProfileId)
        .eq('platform_id', platformData.id)
        .eq('is_active', true)
        .limit(1);
      
      if (!credentials || credentials.length === 0) {
        return { hasAmazonCampaigns: false };
      }
      
      // Found active Amazon credentials, retrieve campaign data
      const platformCredentialId = credentials[0].id;
      
      // Call the amazon_ads function to retrieve campaigns
      const { data: amazonData, error } = await supabase.functions.invoke('amazon_ads', {
        body: {
          operation: 'list_campaigns',
          platformCredentialId,
          profileId: amazonProfileId,
          chatMode: true
        }
      });
      
      if (error) throw error;
      
      return {
        hasAmazonCampaigns: true,
        campaignInfo: amazonData.text
      };
    } catch (error) {
      console.error('Error retrieving Amazon campaign data:', error);
      return { hasAmazonCampaigns: false, error: error.message };
    }
  }
  
  return null;
}

// Process the user's message and detect intent for API calls
async function processUserMessage(userMessage, previousMessages, supabase, context) {
  // Check for campaign creation intent
  if (containsIntent(userMessage, ['create campaign', 'new campaign', 'start campaign', 'launch campaign'])) {
    return {
      intent: 'create_campaign',
      missingFields: detectMissingCampaignFields(userMessage, previousMessages),
      context: context
    };
  }
  
  // Check for budget adjustment intent
  if (containsIntent(userMessage, ['adjust budget', 'increase budget', 'decrease budget', 'change budget', 'update budget'])) {
    return {
      intent: 'adjust_budget',
      missingFields: detectMissingBudgetFields(userMessage, previousMessages),
      context: context
    };
  }
  
  // Check for report generation intent
  if (containsIntent(userMessage, ['get report', 'pull report', 'show report', 'campaign performance', 'campaign metrics', 'campaign results'])) {
    return {
      intent: 'get_campaign_report',
      missingFields: detectMissingReportFields(userMessage, previousMessages),
      context: context
    };
  }
  
  // Check if there's Amazon campaign data that should be included
  const amazonCampaignData = await checkForAmazonCampaignQueries(userMessage, supabase, context);
  if (amazonCampaignData?.hasAmazonCampaigns) {
    return {
      intent: 'provide_information',
      amazonCampaignData,
      context: context
    };
  }
  
  // No specific API intent detected
  return {
    intent: 'general_query',
    context: context
  };
}

// Helper function to determine if a message contains specific intents
function containsIntent(message, intentPhrases) {
  const lowerMessage = message.toLowerCase();
  return intentPhrases.some(phrase => lowerMessage.includes(phrase.toLowerCase()));
}

// Check for missing campaign creation fields
function detectMissingCampaignFields(message, previousMessages) {
  const requiredFields = ['name', 'dailyBudget', 'startDate', 'targetingType'];
  const missingFields = [];
  
  // Extract all text from the current conversation
  const allText = [message, ...previousMessages.map(m => m.content)].join(' ').toLowerCase();
  
  // Check for campaign name
  if (!extractCampaignName(allText)) {
    missingFields.push('name');
  }
  
  // Check for budget
  if (!extractBudget(allText)) {
    missingFields.push('dailyBudget');
  }
  
  // Check for start date
  if (!extractDate(allText)) {
    missingFields.push('startDate');
  }
  
  // Check for targeting type
  if (!allText.includes('manual') && !allText.includes('auto') && !allText.includes('automatic')) {
    missingFields.push('targetingType');
  }
  
  return missingFields;
}

// Check for missing budget adjustment fields
function detectMissingBudgetFields(message, previousMessages) {
  const missingFields = [];
  
  // Extract all text from the current conversation
  const allText = [message, ...previousMessages.map(m => m.content)].join(' ').toLowerCase();
  
  // Check for campaign ID or name
  if (!extractCampaignIdentifier(allText)) {
    missingFields.push('campaignId');
  }
  
  // Check for new budget amount
  if (!extractBudget(allText)) {
    missingFields.push('newDailyBudget');
  }
  
  return missingFields;
}

// Check for missing report fields
function detectMissingReportFields(message, previousMessages) {
  const missingFields = [];
  
  // Extract all text from the current conversation
  const allText = [message, ...previousMessages.map(m => m.content)].join(' ').toLowerCase();
  
  // Check for campaign ID or name
  if (!extractCampaignIdentifier(allText)) {
    missingFields.push('campaignIds');
  }
  
  // Check for date range
  if (!extractDate(allText)) {
    missingFields.push('startDate');
  }
  
  return missingFields;
}

// Extract campaign name from text
function extractCampaignName(text) {
  // Try to find phrases like "name: X" or "called X" or "named X"
  const namePatterns = [
    /campaign(?:\s+name)?(?:\s+is)?(?:\s+called)?(?:\s+named)?(?:\s*[:;])?\s*["']?([^"',.?!]+)["']?/i,
    /name(?:\s+of)?(?:\s+the)?(?:\s+campaign)?(?:\s*[:;])?\s*["']?([^"',.?!]+)["']?/i,
    /call(?:\s+it)(?:\s*[:;])?\s*["']?([^"',.?!]+)["']?/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Extract budget amount from text
function extractBudget(text) {
  // Try to find phrases with dollar amounts
  const budgetPatterns = [
    /budget(?:\s+of)?(?:\s*[:;])?\s*\$?\s*(\d+(?:\.\d+)?)/i, 
    /\$\s*(\d+(?:\.\d+)?)(?:\s+budget)?/i,
    /(\d+(?:\.\d+)?)(?:\s+dollars)/i
  ];
  
  for (const pattern of budgetPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
  }
  
  return null;
}

// Extract date from text
function extractDate(text) {
  // Try various date formats
  const datePatterns = [
    // YYYY-MM-DD
    /(\d{4}-\d{1,2}-\d{1,2})/,
    // MM/DD/YYYY
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    // Month Name DD, YYYY
    /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Convert to YYYY-MM-DD format
      const dateStr = match[1];
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Invalid date, continue to next pattern
      }
    }
  }
  
  return null;
}

// Extract campaign identifier (ID or name)
function extractCampaignIdentifier(text) {
  // First check for campaign ID
  const idMatch = text.match(/campaign\s+id\s*[:;]?\s*(\d+)/i) || 
                 text.match(/id\s*[:;]?\s*(\d+)/i);
  
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }
  
  // If no ID found, try to extract a campaign name
  return extractCampaignName(text);
}

// Enhance the generateAIResponse function to handle API intents
const generateAIResponse = async (messages, context) => {
  try {
    // Extract the latest user message
    const latestUserMessage = messages.filter(m => m.role === 'user').pop();
    
    if (!latestUserMessage) {
      return { role: 'assistant', content: "I'm sorry, I couldn't find your message. How can I help you with your Amazon Advertising campaigns?" };
    }
    
    // Get previous messages excluding the newest user message
    const previousMessages = messages.filter(m => m !== latestUserMessage);
    
    // Process the message to detect API intents
    const processedMessage = await processUserMessage(
      latestUserMessage.content, 
      previousMessages, 
      supabase, 
      context
    );
    
    // Handle different intents
    let assistantPrompt = '';
    let toolCall = null;
    
    if (processedMessage.intent === 'create_campaign') {
      if (processedMessage.missingFields.length > 0) {
        // Ask for missing information to create a campaign
        assistantPrompt = generateMissingFieldsPrompt('create_campaign', processedMessage.missingFields);
      } else {
        // We have all the information, suggest executing the API call
        toolCall = {
          type: 'api_call',
          operation: 'create_campaign',
          params: extractCampaignCreationParams(messages)
        };
        assistantPrompt = "I have all the information needed to create your Amazon Advertising campaign. Would you like me to proceed with creating it now?";
      }
    } else if (processedMessage.intent === 'adjust_budget') {
      if (processedMessage.missingFields.length > 0) {
        // Ask for missing information to adjust budget
        assistantPrompt = generateMissingFieldsPrompt('adjust_budget', processedMessage.missingFields);
      } else {
        // We have all the information, suggest executing the API call
        toolCall = {
          type: 'api_call',
          operation: 'adjust_budget',
          params: extractBudgetAdjustmentParams(messages)
        };
        assistantPrompt = "I have all the information needed to adjust the budget for your campaign. Would you like me to proceed with updating it now?";
      }
    } else if (processedMessage.intent === 'get_campaign_report') {
      if (processedMessage.missingFields.length > 0) {
        // Ask for missing information to generate a report
        assistantPrompt = generateMissingFieldsPrompt('get_campaign_report', processedMessage.missingFields);
      } else {
        // We have all the information, suggest executing the API call
        toolCall = {
          type: 'api_call',
          operation: 'get_campaign_report',
          params: extractReportParams(messages)
        };
        assistantPrompt = "I have all the information needed to generate a performance report for your campaign. Would you like me to proceed with generating it now?";
      }
    } else if (processedMessage.intent === 'provide_information' && processedMessage.amazonCampaignData) {
      // We have some Amazon campaign data to provide
      assistantPrompt = "Here's information about your Amazon Advertising campaigns:";
    } else {
      // General query, no specific API intent
      assistantPrompt = null; // Let the AI generate a natural response
    }
    
    // If we have an API intent with missing fields, inject a system message
    if (assistantPrompt) {
      // Find system message
      const systemMessageIndex = messages.findIndex(m => m.role === 'system');
      if (systemMessageIndex >= 0) {
        const apiContext = `The user is asking about ${processedMessage.intent.replace('_', ' ')}. ${assistantPrompt}`;
        messages[systemMessageIndex].content += `\n\n${apiContext}`;
      }
    }
    
    // Continue with OpenAI call
    const openAI = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    const response = await openAI.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    // Extract the response content
    let aiContent = response.choices[0].message.content || "";
    
    // If we have Amazon campaign data, insert it
    if (processedMessage.intent === 'provide_information' && processedMessage.amazonCampaignData?.campaignInfo) {
      aiContent = `${aiContent}\n\n${processedMessage.amazonCampaignData.campaignInfo}`;
    }
    
    // If we have a tool call, add it to response
    if (toolCall) {
      return { 
        role: 'assistant', 
        content: aiContent,
        toolCall
      };
    }
    
    // Extract follow-up questions
    const followups = extractFollowupPrompts(aiContent);
    
    // Add action buttons if applicable
    const actionButtons = determineActionButtons(aiContent, context);
    
    // Return the formatted response
    return {
      role: 'assistant',
      content: aiContent,
      followupQuestions: followups.length > 0 ? followups : generateDefaultFollowups(context),
      actionButtons: actionButtons
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return { 
      role: 'assistant', 
      content: "I apologize, but I encountered an error while processing your request. Please try again or rephrase your question." 
    };
  }
};

// Helper to generate prompts for missing fields
function generateMissingFieldsPrompt(intent, missingFields) {
  if (intent === 'create_campaign') {
    const fieldDescriptions = {
      name: "a name for your campaign",
      dailyBudget: "the daily budget amount in dollars",
      startDate: "when the campaign should start (YYYY-MM-DD)",
      targetingType: "the targeting type (manual or automatic)"
    };
    
    const missingFieldsText = missingFields.map(field => fieldDescriptions[field]).join(', ');
    return `To create an Amazon Advertising campaign, I need ${missingFieldsText}. Could you please provide this information?`;
  } else if (intent === 'adjust_budget') {
    const fieldDescriptions = {
      campaignId: "which campaign you want to modify (either the ID or name)",
      newDailyBudget: "the new daily budget amount in dollars"
    };
    
    const missingFieldsText = missingFields.map(field => fieldDescriptions[field]).join(', ');
    return `To adjust the budget for your campaign, I need to know ${missingFieldsText}. Could you please provide this information?`;
  } else if (intent === 'get_campaign_report') {
    const fieldDescriptions = {
      campaignIds: "which campaign(s) you want to see reports for (either the ID or name)",
      startDate: "the start date for the report period (YYYY-MM-DD)"
    };
    
    const missingFieldsText = missingFields.map(field => fieldDescriptions[field]).join(', ');
    return `To generate a performance report, I need to know ${missingFieldsText}. Could you please provide this information?`;
  }
  
  return "I need more information to proceed with your request.";
}

// Extract parameters for campaign creation from conversation
function extractCampaignCreationParams(messages) {
  const allText = messages.map(m => m.content).join(' ');
  
  return {
    name: extractCampaignName(allText) || "New Campaign",
    dailyBudget: extractBudget(allText) || 10,
    startDate: extractDate(allText) || new Date().toISOString().split('T')[0],
    targetingType: allText.toLowerCase().includes('auto') || allText.toLowerCase().includes('automatic') ? 'auto' : 'manual',
    state: "enabled"
  };
}

// Extract parameters for budget adjustment from conversation
function extractBudgetAdjustmentParams(messages) {
  const allText = messages.map(m => m.content).join(' ');
  
  return {
    campaignId: extractCampaignIdentifier(allText) || null,
    newDailyBudget: extractBudget(allText) || 10
  };
}

// Extract parameters for report generation from conversation
function extractReportParams(messages) {
  const allText = messages.map(m => m.content).join(' ');
  
  return {
    campaignIds: extractCampaignIdentifier(allText) || null,
    startDate: extractDate(allText) || (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30); // Default to last 30 days
      return date.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0] // Default to today
  };
}

function extractFollowupPrompts(content) {
  // Look for the "Follow-up Questions:" section
  const followupSection = content.match(/Follow-up Questions:[\s\S]*?(?=\n\n|$)/i);
  
  if (!followupSection) return [];
  
  // Extract all bulleted and numbered items
  const lines = followupSection[0].split('\n').slice(1); // Skip the heading line
  
  const questions = lines
    .map(line => {
      // Extract text from markdown list items (both numbered and bulleted)
      const match = line.match(/^(?:\d+\.|\*|-|\+)\s+(.*?)(?:\?|$)/);
      if (match && match[1]) {
        return match[1].trim() + '?';
      }
      return null;
    })
    .filter(Boolean); // Remove null values
  
  return questions;
}

function generateDefaultFollowups(context) {
  const defaultQuestions = [
    "How can I improve my campaign performance?",
    "What are the best practices for Amazon advertising?",
    "How should I adjust my budget for optimal results?",
    "What targeting strategies would you recommend?"
  ];
  
  return defaultQuestions;
}

function determineActionButtons(content, context) {
  const buttons = [];
  
  // Analyze the content for potential actions
  if (content.toLowerCase().includes('budget') || content.toLowerCase().includes('spend')) {
    buttons.push({
      label: 'Adjust Budget',
      action: 'adjust_budget',
      params: { campaignId: context?.campaignId }
    });
  }
  
  if (content.toLowerCase().includes('target') || content.toLowerCase().includes('keyword')) {
    buttons.push({
      label: 'Edit Targeting',
      action: 'edit_targeting',
      params: { campaignId: context?.campaignId }
    });
  }
  
  if (content.toLowerCase().includes('performance') || content.toLowerCase().includes('report')) {
    buttons.push({
      label: 'View Full Report',
      action: 'view_report',
      params: { campaignId: context?.campaignId }
    });
  }
  
  return buttons;
}
