
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// OpenAI integration - only require one API key
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Simple dummy response generator for testing connection
function generateDummyResponse(text: string) {
  return {
    content: `This is a test response from the Supabase Edge Function. We received your message: "${text}"`,
    model: "dummy-test-model",
  };
}

serve(async (req) => {
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request details for debugging
    console.log(`Processing chat request from ${req.headers.get("origin") || "unknown origin"}`);
    
    // Parse request body
    const requestData = await req.json().catch(err => {
      console.error("Failed to parse request JSON:", err);
      throw new Error("Invalid request format: Could not parse JSON");
    });

    // Validate request structure
    if (!requestData || !requestData.messages || !Array.isArray(requestData.messages)) {
      console.error("Invalid request structure:", JSON.stringify(requestData).substring(0, 200));
      throw new Error("Invalid request format: Missing messages array");
    }

    // Log messages for debugging
    console.log(`Received ${requestData.messages.length} messages for processing`);
    
    // First, try with OpenAI if available
    let response;
    
    if (OPENAI_API_KEY) {
      console.log("Using OpenAI for response generation");
      try {
        response = await generateOpenAIResponse(requestData.messages);
      } catch (openaiError) {
        console.error("OpenAI error, falling back to dummy response:", openaiError);
        // Fall back to dummy response
        response = generateDummyResponse(requestData.messages[requestData.messages.length - 1].content);
      }
    } else {
      // No API key - use dummy response for testing
      console.log("No API keys available, using dummy response for testing");
      response = generateDummyResponse(requestData.messages[requestData.messages.length - 1].content);
    }

    // Format and return the response
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Properly handle and log errors
    console.error("Chat function error:", error.message || "Unknown error");
    
    // Even on error, return a valid response object to avoid client parsing errors
    return new Response(
      JSON.stringify({
        content: `Error: ${error.message || "Unknown error occurred"}. This is a fallback response to prevent UI breakage.`,
        error: error.message || "Unknown error occurred",
        status: "error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Function to generate responses with OpenAI
async function generateOpenAIResponse(messages: ChatMessage[]) {
  console.log("Generating OpenAI response");
  
  try {
    const sanitizedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: sanitizedMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText.substring(0, 100)}...`);
    }

    const data = await response.json();
    console.log("OpenAI response received successfully");
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error(`OpenAI processing error: ${error.message}`);
  }
}
