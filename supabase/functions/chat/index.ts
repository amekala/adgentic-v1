import { serve } from 'std/server';
import { OpenAI } from 'openai';

serve(async (req) => {
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('Missing OpenAI API Key');
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const requestData = await req.json();
    const messages = requestData.messages;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    const aiResponse = await generateAIResponse(messages);
    return new Response(JSON.stringify(aiResponse), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Server Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Update OpenAI model configuration
const generateAIResponse = async (messages: OpenAI.Chat.ChatCompletionMessageParam[]) => {
  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Changed from gpt-4o-mini to gpt-4o
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

    return { content: responseContent };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};
