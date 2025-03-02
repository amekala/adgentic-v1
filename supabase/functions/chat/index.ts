
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          content: 'The server is missing its OpenAI API key configuration.'
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Log the request for debugging
    console.log('Request received:', req.method, req.url);
    
    const requestData = await req.json();
    console.log('Request body:', JSON.stringify(requestData).substring(0, 500) + '...');
    
    const { messages } = requestData;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          content: 'Messages array is required'
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.log('Processing chat request with messages count:', messages.length);

    // Add system message if not present
    const systemMessage: Message = {
      role: 'system',
      content: `You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. You help users optimize their ad campaigns and provide insights on marketing strategies.`
    }

    const allMessages = messages[0]?.role === 'system' ? messages : [systemMessage, ...messages];

    console.log('Sending request to OpenAI with messages count:', allMessages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const responseStatus = response.status;
    console.log('OpenAI API response status:', responseStatus);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', responseStatus, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API returned status ${responseStatus}`,
          content: 'The AI service encountered an error. Please try again later.'
        }),
        { 
          status: 502,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const data = await response.json();
    console.log('OpenAI API response type:', typeof data);
    console.log('OpenAI API response has choices:', Boolean(data.choices));

    if (!data.choices?.[0]?.message) {
      console.error('Invalid OpenAI response format:', JSON.stringify(data).substring(0, 500));
      
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from OpenAI',
          content: 'The AI service returned an unexpected format. Please try again later.'
        }),
        { 
          status: 502,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.log('Returning AI response to client');
    return new Response(
      JSON.stringify(data.choices[0].message),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Chat function error:', error.message || error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred processing your request',
        content: 'There was an unexpected error processing your request. Please try again later.'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
