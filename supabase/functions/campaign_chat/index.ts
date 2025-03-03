import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://deno.land/x/openai@v4.23.0/mod.ts';

interface RequestData {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  context?: {
    chatType: string;
    campaignId: string;
    campaignName: string;
  };
}

// Update OpenAI model configuration
const generateAIResponse = async (messages: OpenAI.Chat.ChatCompletionMessageParam[], campaignContext: any) => {
  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    // Add campaign context to system prompt
    const systemPrompt = messages[0];
    if (systemPrompt.role === 'system' && campaignContext) {
      systemPrompt.content = `${systemPrompt.content}\n\nYou are discussing the campaign: ${campaignContext.campaignName || 'Unknown Campaign'}.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Changed from gpt-4o-mini to gpt-4o
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const aiResponse = completion.choices[0].message.content;

    // Attempt to extract action buttons from the response
    let actionButtons = [];
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        const jsonString = jsonMatch[1].trim();
        const structuredData = JSON.parse(jsonString);
        if (structuredData.actionButtons && Array.isArray(structuredData.actionButtons)) {
          actionButtons = structuredData.actionButtons;
        }
      }
    } catch (e) {
      console.error('Error parsing JSON from response:', e);
    }

    return {
      content: aiResponse,
      actionButtons: actionButtons
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const requestData: RequestData = await req.json();
    const { messages, context: campaignContext } = requestData;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(messages, campaignContext);

    // Return the AI response
    return new Response(JSON.stringify(aiResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
