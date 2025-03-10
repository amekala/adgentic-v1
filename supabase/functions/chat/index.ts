
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://deno.land/x/openai@v4.23.0/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests properly
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Log all environment variables for debugging (hiding sensitive data)
    const envVars = Object.keys(Deno.env.toObject())
      .filter(key => !key.toLowerCase().includes('key') && !key.toLowerCase().includes('secret'));
    console.log('Available environment variables:', envVars);
    
    // Look for API key in standardized environment variables
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('OpenAI API Key not found');
      throw new Error('Missing OpenAI API Key');
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }

    const requestData = await req.json();
    const messages = requestData.messages;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    const aiResponse = await generateAIResponse(messages);
    return new Response(JSON.stringify(aiResponse), {
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

// Update OpenAI model configuration
const generateAIResponse = async (messages) => {
  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    console.log('Sending request to OpenAI with model: gpt-4o');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Updated from gpt-4o-mini to gpt-4o as requested
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No choices returned from OpenAI API');
    }

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No content returned from OpenAI API');
    }

    console.log('Successfully received response from OpenAI');
    return { content: responseContent };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};
