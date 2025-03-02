
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
      throw new Error('OpenAI API key not configured')
    }

    // Log the request for debugging
    console.log('Request received:', req.method, req.url);
    
    const requestData = await req.json();
    console.log('Request body:', JSON.stringify(requestData));
    
    const { messages } = requestData;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required')
    }

    console.log('Processing chat request with messages:', messages)

    // Add system message if not present
    const systemMessage: Message = {
      role: 'system',
      content: `You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. You help users optimize their ad campaigns and provide insights on marketing strategies.

IMPORTANT: You MUST format ALL your responses using this JSON structure:

\`\`\`json
{
  "title": "Your Response Title",
  "content": "Your detailed explanation here. You can use markdown formatting within this content field.",
  "metrics": [
    {"label": "Metric Name", "value": "Metric Value", "improvement": true},
    {"label": "Another Metric", "value": "Value", "improvement": false}
  ],
  "actionButtons": [
    {"label": "Primary Action", "primary": true},
    {"label": "Secondary Action", "primary": false}
  ]
}
\`\`\`

For responses without specific metrics, you MUST still use the JSON structure with title, content and actionButtons.
NEVER respond in plain text format. ALWAYS use the JSON structure above.
This is REQUIRED for ALL responses without exception.`
    }

    const allMessages = messages[0]?.role === 'system' ? messages : [systemMessage, ...messages]

    console.log('Sending request to OpenAI with messages:', allMessages)

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
        max_tokens: 1500, // Increased token limit for structured responses
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      throw new Error(`OpenAI API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', JSON.stringify(data));

    if (!data.choices?.[0]?.message) {
      console.error('OpenAI response:', data);
      throw new Error('Invalid response from OpenAI');
    }

    console.log('Received response from OpenAI:', data.choices[0].message);

    return new Response(
      JSON.stringify(data.choices[0].message),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      },
    )

  } catch (error) {
    console.error('Chat function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred processing your request',
        status: 'error'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      },
    )
  }
})
