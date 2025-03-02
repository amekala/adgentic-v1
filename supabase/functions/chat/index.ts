
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_deno
// Learn more about Deno: https://deno.land/

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// OpenAI integration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

serve(async (req) => {
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request details for debugging
    console.log(`Processing chat request from ${req.headers.get("origin") || "unknown origin"}`);
    
    // Check if API keys are available
    if (!OPENAI_API_KEY && !ANTHROPIC_API_KEY) {
      console.error("Missing API keys: Both OpenAI and Anthropic API keys are missing");
      throw new Error("API configuration missing. Contact administrator.");
    }

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
    
    // Decide which API to use - prefer OpenAI if available
    let response;
    
    if (OPENAI_API_KEY) {
      console.log("Using OpenAI for response generation");
      response = await generateOpenAIResponse(requestData.messages);
    } else if (ANTHROPIC_API_KEY) {
      console.log("Using Anthropic for response generation");
      response = await generateAnthropicResponse(requestData.messages);
    }

    // Format and return the response
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Properly handle and log errors
    console.error("Chat function error:", error.message || "Unknown error");
    
    return new Response(
      JSON.stringify({
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

// Function to generate responses with Anthropic (fallback)
async function generateAnthropicResponse(messages: ChatMessage[]) {
  console.log("Generating Anthropic response");
  
  try {
    // Format messages for Anthropic API
    const anthropicMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": `${ANTHROPIC_API_KEY}`,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        messages: anthropicMessages,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Anthropic API error (${response.status}):`, errorText);
      throw new Error(`Anthropic API error: ${response.status} ${errorText.substring(0, 100)}...`);
    }

    const data = await response.json();
    console.log("Anthropic response received successfully");
    
    return {
      content: data.content[0].text,
      model: data.model,
    };
  } catch (error) {
    console.error("Error calling Anthropic:", error);
    throw new Error(`Anthropic processing error: ${error.message}`);
  }
}
