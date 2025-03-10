
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://deno.land/x/openai@v4.23.0/mod.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";
import { corsHeaders } from '../_shared/cors.ts';

// This must be at the top - immediately handle OPTIONS requests before any other code executes
serve(async (req) => {
  console.log(`[campaign_chat] Request received: ${req.method} ${new URL(req.url).pathname}`);
  console.log(`[campaign_chat] User-Agent: ${req.headers.get("user-agent")}`);

  // First thing: handle CORS preflight - must be at the top of the function
  if (req.method === "OPTIONS") {
    console.log("[campaign_chat] Handling OPTIONS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      console.log(`[campaign_chat] Method not allowed: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate OpenAI API key
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('[campaign_chat] Missing OpenAI API Key');
      return new Response(JSON.stringify({ 
        error: 'Server configuration error: Missing OpenAI API Key',
        code: 'missing_openai_key'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get Supabase configuration - try both formats of environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 
                        Deno.env.get('PUBLIC_SUPABASE_URL') || 
                        Deno.env.get('VITE_SUPABASE_URL');
    
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || 
                           Deno.env.get('PUBLIC_SUPABASE_ANON_KEY') || 
                           Deno.env.get('VITE_SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration.');
      console.error('SUPABASE_URL present:', !!Deno.env.get('SUPABASE_URL'));
      console.error('PUBLIC_SUPABASE_URL present:', !!Deno.env.get('PUBLIC_SUPABASE_URL'));
      console.error('VITE_SUPABASE_URL present:', !!Deno.env.get('VITE_SUPABASE_URL'));
      console.error('SUPABASE_ANON_KEY present:', !!Deno.env.get('SUPABASE_ANON_KEY'));
      console.error('PUBLIC_SUPABASE_ANON_KEY present:', !!Deno.env.get('PUBLIC_SUPABASE_ANON_KEY'));
      console.error('VITE_SUPABASE_ANON_KEY present:', !!Deno.env.get('VITE_SUPABASE_ANON_KEY'));
      
      return new Response(JSON.stringify({ 
        error: 'Missing Supabase configuration. Check environment variables.',
        details: {
          url_sources: {
            SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
            PUBLIC_SUPABASE_URL: !!Deno.env.get('PUBLIC_SUPABASE_URL'),
            VITE_SUPABASE_URL: !!Deno.env.get('VITE_SUPABASE_URL'),
          },
          key_sources: {
            SUPABASE_ANON_KEY: !!Deno.env.get('SUPABASE_ANON_KEY'),
            PUBLIC_SUPABASE_ANON_KEY: !!Deno.env.get('PUBLIC_SUPABASE_ANON_KEY'),
            VITE_SUPABASE_ANON_KEY: !!Deno.env.get('VITE_SUPABASE_ANON_KEY'),
          }
        },
        code: 'missing_supabase_config'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get request body
    const requestData = await req.json().catch(e => {
      console.error('Error parsing request JSON:', e);
      throw new Error('Invalid JSON in request body');
    });
    
    const { messages, context } = requestData;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid messages format', 
        code: 'invalid_messages'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create auth client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Missing authorization header',
        code: 'missing_auth'
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate campaign context if provided
    if (context?.campaignId) {
      // Verify the campaign exists
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('campaign_name')
        .eq('id', context.campaignId)
        .maybeSingle();
        
      if (campaignError) {
        console.error('Campaign validation error:', campaignError);
        return new Response(JSON.stringify({ 
          error: `Campaign validation failed: ${campaignError.message}` 
        }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (!campaign) {
        console.error('Campaign not found:', context.campaignId);
        return new Response(JSON.stringify({ 
          error: `Campaign not found with ID: ${context.campaignId}` 
        }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Update context with actual campaign name if needed
      if (!context.campaignName && campaign.campaign_name) {
        context.campaignName = campaign.campaign_name;
      }
    }

    // Process the most recent user message to detect Amazon campaign queries
    const latestUserMessage = messages.slice().reverse().find(msg => msg.role === 'user');
    let amazonCampaignData;
    
    try {
      amazonCampaignData = await checkForAmazonCampaignQueries(latestUserMessage?.content, supabase, context);
    } catch (error) {
      console.error('Error checking for Amazon campaign queries:', error);
      // Continue without Amazon data rather than failing the whole request
    }
    
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in campaign chat:', error);
    
    // Determine the appropriate status code based on the error
    let statusCode = 500;
    let errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('Campaign not found') || 
        errorMessage.includes('Campaign validation failed')) {
      statusCode = 404;
    } else if (errorMessage.includes('Authorization')) {
      statusCode = 401;
    } else if (errorMessage.includes('Missing OpenAI API Key') || 
               errorMessage.includes('Supabase configuration missing')) {
      statusCode = 503; // Service Unavailable
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      status: statusCode,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
    
    try {
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
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      // Create a fallback response based on the context
      let fallbackContent = `I apologize, but I'm currently having trouble connecting to my AI service. Let me provide some basic information about your campaign.`;
      
      if (context?.campaignName) {
        fallbackContent += `\n\nYou're currently working with the "${context.campaignName}" campaign. `;
        fallbackContent += `When my full capabilities are restored, I can help you optimize this campaign and provide deeper insights.`;
      }
      
      if (latestUserMessage.content.toLowerCase().includes('hello') || 
          latestUserMessage.content.toLowerCase().includes('hi')) {
        fallbackContent += `\n\nHello! I'm here to help with your advertising campaigns. Once my connection is restored, I can analyze performance, suggest optimizations, and answer specific questions about your campaigns.`;
      } else if (latestUserMessage.content.toLowerCase().includes('performance') || 
                latestUserMessage.content.toLowerCase().includes('metrics')) {
        fallbackContent += `\n\nI understand you're interested in campaign performance. When my service is fully operational, I can provide detailed metrics, trend analysis, and actionable recommendations to improve your campaign results.`;
      }
      
      // Add follow-up suggestions
      fallbackContent += `\n\n## Follow-up Questions:
1. Would you like to try reconnecting to the AI service?
2. Can I help you with any other campaign management tasks?
3. Would you like to review basic information about Amazon advertising best practices?
4. Do you need help navigating the campaign dashboard?`;
      
      // Return fallback response with appropriate context
      return {
        role: 'assistant',
        content: fallbackContent,
        followupQuestions: generateDefaultFollowups(context),
        actionButtons: [
          { label: 'Retry Connection', action: 'retry_connection', primary: true },
          { label: 'Campaign Dashboard', action: 'view_campaign', params: { campaignId: context?.campaignId } }
        ]
      };
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Create a meaningful error response
    const errorResponse = { 
      role: 'assistant', 
      content: "I apologize, but I encountered an error while processing your request. This might be due to a temporary service disruption or configuration issue. Please try again in a few moments.",
      followupQuestions: [
        "Would you like to try a different question?",
        "Can I help you with something else instead?",
        "Would you like to check your campaign dashboard while I recover?"
      ],
      actionButtons: [
        { label: 'Retry Request', action: 'retry_request', primary: true },
        { label: 'Dashboard', action: 'view_dashboard' }
      ]
    };
    
    return errorResponse;
  }
};

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
