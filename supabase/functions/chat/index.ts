
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
      throw new Error('OpenAI API key not configured')
    }

    const configuration = new Configuration({
      apiKey: apiKey,
    })
    const openai = new OpenAIApi(configuration)

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required')
    }

    console.log('Processing chat request with messages:', messages)

    // Add system message if not present
    const systemMessage: Message = {
      role: 'system',
      content: 'You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. You help users optimize their ad campaigns and provide insights on marketing strategies.'
    }

    const allMessages = messages[0]?.role === 'system' ? messages : [systemMessage, ...messages]

    console.log('Sending request to OpenAI with messages:', allMessages)

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    if (!completion.data.choices[0].message) {
      throw new Error('No response received from OpenAI')
    }

    const response = completion.data.choices[0].message

    console.log('Received response from OpenAI:', response)

    return new Response(
      JSON.stringify(response),
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
    
    // Return a properly formatted error response
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
