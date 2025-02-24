
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()
    
    // Get the latest user message
    const userMessage = messages[messages.length - 1].content

    // Construct system message for the AI assistant
    const systemMessage = {
      role: "system",
      content: `You are Adgentic, an AI assistant designed to help retail media advertisers and campaign managers. 
      Your goal is to provide helpful, informative, and concise guidance on setting up and running retail media advertising campaigns, 
      primarily on platforms like Amazon, Walmart, and Instacart. You understand retail media reporting, metrics like RoAS and ACoS, 
      and campaign optimization strategies. Be concise, practical, and focus on actionable advice.`
    }

    // Prepare conversation history for the API call
    const conversationMessages = [
      systemMessage,
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    console.log('Sending request to OpenAI:', { messages: conversationMessages })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversationMessages,
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API Error:', error)
      throw new Error(error.error?.message || 'Error calling OpenAI API')
    }

    const data = await response.json()
    console.log('Received response from OpenAI:', data)

    // Extract the assistant's response
    const content = data.choices[0].message.content

    return new Response(
      JSON.stringify({ content }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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
