import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://deno.land/x/openai@v4.23.0/mod.ts';

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

    const requestData = await req.json();
    const { messages, context } = requestData;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    // Format messages for the secondary LLM
    const formattedMessages = prepareMessagesForProcessor(messages, context);
    
    // Process the conversation to detect campaign actions
    const processorResponse = await processCampaignAction(formattedMessages);
    
    return new Response(JSON.stringify(processorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Server Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Prepare messages for the campaign processor LLM
 */
function prepareMessagesForProcessor(messages, context) {
  // Start with a system message that instructs the LLM how to process the conversation
  const systemMessage = {
    role: 'system',
    content: `You are a campaign processing assistant. Your job is to analyze conversations between users and the main assistant, then determine if any campaign actions need to be taken.
    
Your task is to:
1. Identify if the user is requesting to create, update, or view campaign data
2. Extract structured information about what specifically the user wants to do
3. Respond with a JSON object that includes:
   - action: The type of action to take (e.g., "create_campaign", "update_campaign", "get_campaign_data", "none")
   - data: Structured data extracted from the conversation that's needed for the action
   - message: A brief explanation of what you detected

When responding, ONLY output a valid JSON object. Do not include any other text.

Example output:
{
  "action": "create_campaign",
  "data": {
    "name": "Summer Sale 2025",
    "budget": 5000,
    "startDate": "20250601",
    "endDate": "20250831",
    "targeting": "automatic"
  },
  "message": "Detected intent to create a new campaign called 'Summer Sale 2025'"
}

OR

{
  "action": "none",
  "message": "No campaign action detected in the conversation"
}

Current campaign context: ${context?.campaignId ? `Viewing campaign ID ${context.campaignId}` : 'No specific campaign context'}`
  };

  // Filter out system messages from the original conversation
  const userAssistantMessages = messages.filter(msg => msg.role !== 'system');
  
  // Return the prepared messages array
  return [systemMessage, ...userAssistantMessages];
}

/**
 * Process the campaign action using OpenAI
 */
async function processCampaignAction(messages) {
  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    console.log('Sending request to OpenAI for campaign processing');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.2, // Lower temperature for more deterministic outputs
      max_tokens: 500,
      response_format: { type: "json_object" }, // Ensure JSON response
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No choices returned from OpenAI API');
    }

    const responseMessage = completion.choices[0].message;
    if (!responseMessage || !responseMessage.content) {
      throw new Error('No content returned from OpenAI API');
    }

    console.log('Successfully received response from OpenAI for campaign processing');
    
    // Parse the JSON response
    try {
      const processorResponse = JSON.parse(responseMessage.content);
      return processorResponse;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return {
        action: "error",
        message: "Failed to parse campaign processor response",
        rawResponse: responseMessage.content
      };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
} 