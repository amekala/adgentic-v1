
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from environment variable
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Log request details
    console.log('Request received:', req.method, req.url);
    
    // Parse the request body
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    console.log('Processing chat request with messages count:', messages.length);

    // Add system message if not present
    const systemMessage: Message = {
      role: 'system',
      content: 'You are Adgentic, an AI assistant specialized in advertising and marketing campaigns.'
    };

    const allMessages = messages[0]?.role === 'system' ? messages : [systemMessage, ...messages];

    console.log('Sending request to OpenAI with messages count:', allMessages.length);

    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Use a stable model that's guaranteed to exist
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    // Log response status
    console.log('OpenAI API response status:', response.status);

    // Handle non-successful responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    
    if (!data.choices?.[0]?.message) {
      console.error('Invalid OpenAI response format:', JSON.stringify(data).substring(0, 200));
      throw new Error('Invalid response from OpenAI');
    }

    console.log('Response received successfully');
    
    // Return the AI's response
    return new Response(
      JSON.stringify(data.choices[0].message),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    // Handle and log errors
    console.error('Chat function error:', error.message || 'Unknown error');
    
    return new Response(
      JSON.stringify({ 
        content: `Error: ${error.message || 'An error occurred processing your request'}`,
        role: 'assistant',
        error: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
