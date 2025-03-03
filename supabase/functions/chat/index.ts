
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://deno.land/x/openai@v4.23.0/mod.ts";

// Required for Edge Function
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
    // Get API Key from environment
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API Key');
    }

    // Parse request body
    const requestData = await req.json();
    const { messages } = requestData;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid request: messages array is required');
    }

    console.log('Processing chat request with messages:', JSON.stringify(messages, null, 2));

    // Configure OpenAI
    const configuration = new Configuration({
      apiKey: OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    // Call OpenAI API
    const response = await openai.createChatCompletion({
      model: "gpt-4o", // Updated to use gpt-4o
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log('Received OpenAI response');

    // Process the response
    const completion = response.choices[0]?.message?.content || "I couldn't generate a response.";
    
    // Create a structured response with potential action buttons
    const structuredResponse = {
      role: 'assistant',
      content: completion,
      actionButtons: []
    };
    
    console.log('Sending response:', structuredResponse);

    // Return the response
    return new Response(JSON.stringify(structuredResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred',
      role: 'assistant',
      content: "I'm sorry, I encountered an error while processing your request. Please try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
