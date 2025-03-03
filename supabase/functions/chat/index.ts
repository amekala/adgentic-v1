
// Import necessary modules for Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle serving the function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Add response headers for all responses
  const responseHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json',
  };

  try {
    console.log("Chat function invoked");
    
    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // Log key status (safely)
    console.log("OpenAI API key available:", !!openaiApiKey);
    
    if (!openaiApiKey) {
      console.error("No OpenAI API key found in environment variables");
      throw new Error("OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.");
    }
    
    // Parse the incoming request
    const requestData = await req.json();
    const { messages, context } = requestData;
    
    // Log incoming context to help debug
    console.log("Request context:", context ? JSON.stringify(context) : "No context provided");
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Invalid or empty messages array");
    }
    
    // Add context to the system prompt based on the chat type
    let systemMessage = "You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. Provide helpful, concise, and actionable advice.";
    
    // If this is a campaign chat, enhance the system message with campaign context
    if (context && context.chatType === 'campaign') {
      systemMessage += " This conversation is specifically about a marketing campaign. Focus your responses on campaign optimization, performance metrics, ad creative suggestions, and strategic recommendations for improving campaign results.";
    }
    
    // Prepare the messages for OpenAI
    const formattedMessages = [
      { role: "system", content: systemMessage },
      ...messages
    ];
    
    console.log(`Sending ${formattedMessages.length} messages to OpenAI`);
    
    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: formattedMessages,
        temperature: 0.7
      })
    });
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API returned an error: ${openaiResponse.status} ${errorText}`);
    }
    
    const openaiData = await openaiResponse.json();
    
    if (!openaiData.choices || openaiData.choices.length === 0) {
      throw new Error("No response content returned from OpenAI");
    }
    
    const responseContent = openaiData.choices[0].message.content;
    console.log("AI response generated successfully");
    
    // For campaign chats, we might want to enhance the response with action buttons or metrics
    let enhancedResponse = { content: responseContent };
    
    if (context && context.chatType === 'campaign') {
      // Add some campaign-specific action buttons that might be useful
      enhancedResponse = {
        ...enhancedResponse,
        actionButtons: [
          { label: "Optimize Campaign", primary: true },
          { label: "View Metrics", primary: false },
          { label: "Generate Ad Ideas", primary: false },
          { label: "Analyze Performance", primary: false }
        ]
      };
    }
    
    return new Response(
      JSON.stringify(enhancedResponse),
      { headers: responseHeaders }
    );
    
  } catch (error) {
    console.error("Error in chat function:", error.message);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        content: "Sorry, I encountered an error while processing your request. Please try again later."
      }),
      { 
        status: 500,
        headers: responseHeaders
      }
    );
  }
});
