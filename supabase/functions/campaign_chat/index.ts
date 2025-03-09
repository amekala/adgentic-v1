import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://deno.land/x/openai@v4.23.0/mod.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('Missing OpenAI API Key');
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }

    // Create auth client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
    const enhancedSystemPrompt = `You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. ${systemContext}

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
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
      // Get the advertiser ID from context
      const advertiserId = context?.advertiserId;
      if (!advertiserId) return null;
      
      // Look up Amazon platform in the database
      const { data: platformData } = await supabase
        .from('ad_platforms')
        .select('id')
        .eq('name', 'amazon')
        .single();
      
      if (!platformData?.id) return null;
      
      // Find active platform credentials for this advertiser
      const { data: credentials } = await supabase
        .from('platform_credentials')
        .select('id')
        .eq('advertiser_id', advertiserId)
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

const generateAIResponse = async (messages, context) => {
  try {
    const openAI = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    const response = await openAI.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    
    // Extract the follow-up prompts from the response
    const followupPrompts = extractFollowupPrompts(content);
    
    // Determine action buttons based on content
    const actionButtons = determineActionButtons(content, context);

    return {
      content: content,
      followupPrompts: followupPrompts.length > 0 
        ? followupPrompts 
        : generateDefaultFollowups(context),
      actionButtons: actionButtons,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`AI response generation failed: ${error.message}`);
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