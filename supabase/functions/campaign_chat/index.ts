
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

    const campaignContext = context?.campaignName 
      ? `You are discussing the campaign: ${context.campaignName}.` 
      : 'You are discussing a marketing campaign.';

    // Update system message with campaign context
    const systemMessageIndex = messages.findIndex(m => m.role === 'system');
    if (systemMessageIndex >= 0) {
      messages[systemMessageIndex].content += ` ${campaignContext}`;
    } else {
      messages.unshift({
        role: 'system',
        content: `You are Adgentic, an AI assistant specialized in advertising campaigns. ${campaignContext}`
      });
    }

    console.log('Processed messages with campaign context:', messages[0].content);
    
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

// Generate AI response using the OpenAI API
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

    const responseMessage = completion.choices[0].message;
    if (!responseMessage || !responseMessage.content) {
      throw new Error('No content returned from OpenAI API');
    }

    console.log('Successfully received response from OpenAI');
    
    // Format the response for the campaign context
    // Include action buttons for campaign-related actions
    return {
      role: 'assistant',
      content: responseMessage.content,
      actionButtons: [
        { label: 'Performance Analysis', primary: false },
        { label: 'Budget Optimization', primary: false },
        { label: 'Creative Review', primary: true }
      ]
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};
