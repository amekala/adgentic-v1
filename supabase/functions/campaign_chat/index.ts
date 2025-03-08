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

    // Update system message with campaign context and enhanced formatting instructions
    const systemMessageIndex = messages.findIndex(m => m.role === 'system');
    const enhancedSystemPrompt = `You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. ${campaignContext}

Your responses should be:
1. Well-formatted with markdown for readability (use headings, bullets, bold, etc.)
2. Concise and focused on answering the user's query
3. Include relevant metrics when discussing performance
4. Include specific actionable recommendations

You MUST end EVERY response with a section titled "Follow-up Questions:" that contains 3-4 highly relevant and specific questions based on the current conversation context. These questions should help the user dig deeper into the topic they're asking about.

You have access to a database of advertising campaigns, metrics, and best practices in retail media.
For Amazon Advertising specifically, you can help with Sponsored Products, Sponsored Brands, and Sponsored Display campaigns.

When presenting data, use a structured format that's easy to scan and understand.`;

    if (systemMessageIndex >= 0) {
      messages[systemMessageIndex].content = enhancedSystemPrompt;
    } else {
      messages.unshift({
        role: 'system',
        content: enhancedSystemPrompt
      });
    }

    console.log('Processed messages with enhanced campaign context');
    
    const aiResponse = await generateAIResponse(messages, context);
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
const generateAIResponse = async (messages, context) => {
  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    console.log('Sending request to OpenAI with model: gpt-4o');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Updated to gpt-4o for better responses
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
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
    
    // Extract followup prompts from the response if any are present
    const followupPrompts = extractFollowupPrompts(responseMessage.content);
    
    // Clean up the content by removing the followup prompts section if present
    let cleanContent = responseMessage.content;
    if (followupPrompts.length > 0) {
      // Remove the followup section from the content
      cleanContent = cleanContent.replace(/(\n*Follow-?up ?(Questions?|Prompts?):?.*$)/is, '');
    }
    
    // Determine appropriate action buttons based on context and content
    const actionButtons = determineActionButtons(cleanContent, context);
    
    // Format the response for the campaign context
    return {
      role: 'assistant',
      content: cleanContent.trim(),
      actionButtons: actionButtons,
      followupPrompts: followupPrompts.length > 0 ? followupPrompts : generateDefaultFollowups(context)
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

// Extract followup prompts from message content
function extractFollowupPrompts(content) {
  const followupPrompts = [];
  
  // Check if there's a followup section with prompts/questions
  const followupSectionRegex = /follow-?up ?(questions?|prompts?):?/i;
  if (followupSectionRegex.test(content)) {
    // Extract individual prompts using various patterns
    const patterns = [
      /\d+[\.\)\]]\s*["']?([^"'\n]+)["']?/g, // Numbered lists: 1. "question"
      /[-\*•]\s*["']?([^"'\n]+)["']?/g,      // Bullet points: - "question"
      /["']([^"'\n]{10,})["']/g               // Quoted questions: "question"
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && match[1].trim().length > 0) {
          followupPrompts.push({ text: match[1].trim() });
        }
      }
    }
  }
  
  // Return unique prompts (no duplicates)
  return [...new Map(followupPrompts.map(item => 
    [item.text, item])).values()].slice(0, 4); // Limit to 4 followups
}

// Generate default followup prompts based on context
function generateDefaultFollowups(context) {
  const defaultPrompts = [
    { text: "Show me the campaign data" },
    { text: "What are the current performance metrics?" },
    { text: "How can I improve the campaign?" },
    { text: "What budget changes do you recommend?" }
  ];
  
  return defaultPrompts;
}

// Determine appropriate action buttons based on content and context
function determineActionButtons(content, context) {
  // Default buttons
  const defaultButtons = [
    { label: 'Performance Analysis', primary: false },
    { label: 'Budget Optimization', primary: false },
    { label: 'Creative Review', primary: true }
  ];
  
  if (content.toLowerCase().includes('performance') || 
      content.toLowerCase().includes('metrics') || 
      content.toLowerCase().includes('data')) {
    // If discussing performance, offer optimization actions
    return [
      { label: 'Optimize Keywords', primary: false },
      { label: 'Adjust Bidding', primary: false },
      { label: 'Improve ROAS', primary: true }
    ];
  }
  
  if (content.toLowerCase().includes('budget') || 
      content.toLowerCase().includes('spend') || 
      content.toLowerCase().includes('cost')) {
    // If discussing budget, offer budget-related actions
    return [
      { label: 'Reallocate Budget', primary: true },
      { label: 'Reduce CPC', primary: false },
      { label: 'View Performance', primary: false }
    ];
  }
  
  if (content.toLowerCase().includes('creat') && 
     (content.toLowerCase().includes('review') || content.toLowerCase().includes('optimize'))) {
    // If discussing creative optimization
    return [
      { label: 'Improve Creatives', primary: true },
      { label: 'Test New Headlines', primary: false },
      { label: 'Compare Ads', primary: false }
    ];
  }
  
  return defaultButtons;
} 