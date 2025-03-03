
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize OpenAI configuration
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
if (!openAIApiKey) {
  console.error("Error: OPENAI_API_KEY is not set in environment variables");
}

serve(async (req) => {
  console.log("Campaign Chat Edge Function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  // Get the Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Supabase environment variables missing");
    return new Response(
      JSON.stringify({
        error: "Server configuration error: Missing Supabase credentials",
        content: "I apologize, but I'm having trouble accessing the campaign data. Please try again later or contact support."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // Create a Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Parse the request body
    const requestData = await req.json();
    const { messages, context } = requestData;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid request: messages array is required");
    }
    
    console.log(`Received ${messages.length} messages with context:`, context);
    
    // Get information about the campaign if a campaignId is provided
    let campaignInfo = null;
    if (context && context.campaignId) {
      console.log(`Fetching campaign data for ID: ${context.campaignId}`);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', context.campaignId)
        .single();
        
      if (error) {
        console.error("Error fetching campaign data:", error);
      } else if (data) {
        campaignInfo = data;
        console.log("Retrieved campaign data:", campaignInfo);
      }
    }
    
    // Create a system message with campaign context if available
    let systemMessage = {
      role: "system",
      content: "You are Adgentic, an AI assistant specialized in advertising and marketing campaigns. Keep your responses helpful, concise, and actionable."
    };
    
    if (campaignInfo) {
      systemMessage.content += `\n\nYou are currently discussing Campaign: "${campaignInfo.campaign_name}" which is a ${campaignInfo.campaign_type || 'marketing'} campaign with status: ${campaignInfo.campaign_status || 'active'}. Tailor your responses to be specific to this campaign context.`;
    } else {
      systemMessage.content += "\n\nThis is a campaign-specific conversation, so focus your responses on advertising, marketing strategy, analytics, and campaign optimization.";
    }
    
    // Prepare the messages for OpenAI, including our system message
    const openAIMessages = [
      systemMessage,
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    console.log("Calling OpenAI API...");
    
    // Call the OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Use the appropriate model
        messages: openAIMessages,
        temperature: 0.7
      })
    });
    
    // Parse the response
    const openAIData = await openAIResponse.json();
    console.log("OpenAI response received");
    
    if (openAIData.error) {
      console.error("OpenAI API error:", openAIData.error);
      throw new Error(`OpenAI API error: ${openAIData.error.message || JSON.stringify(openAIData.error)}`);
    }
    
    // Get the content from the OpenAI response
    const aiContent = openAIData.choices && openAIData.choices[0] && openAIData.choices[0].message 
      ? openAIData.choices[0].message.content 
      : "I couldn't generate a response for your campaign question.";
    
    // Determine relevant action buttons based on content
    const content = aiContent.toLowerCase();
    const actionButtons = [];
    
    // Always include campaign-relevant action buttons
    if (content.includes("performance") || content.includes("metric") || content.includes("result") || content.includes("analytics")) {
      actionButtons.push({ label: 'View Performance Report', primary: true });
      actionButtons.push({ label: 'Export Data', primary: false });
    }
    
    if (content.includes("budget") || content.includes("spend") || content.includes("cost")) {
      actionButtons.push({ label: 'Adjust Budget', primary: true });
      actionButtons.push({ label: 'View Spending', primary: false });
    }
    
    if (content.includes("keyword") || content.includes("targeting") || content.includes("audience")) {
      actionButtons.push({ label: 'Edit Targeting', primary: true });
      actionButtons.push({ label: 'Keyword Analysis', primary: false });
    }
    
    if (content.includes("creative") || content.includes("ad") || content.includes("image") || content.includes("copy")) {
      actionButtons.push({ label: 'Edit Creatives', primary: true });
      actionButtons.push({ label: 'Generate New Ad', primary: false });
    }
    
    // If no specific buttons were added, add default campaign actions
    if (actionButtons.length === 0) {
      actionButtons.push({ label: 'Campaign Settings', primary: false });
      actionButtons.push({ label: 'Performance Analysis', primary: true });
      actionButtons.push({ label: 'Budget Allocation', primary: false });
    }
    
    // Return the response
    const responseData = {
      role: "assistant",
      content: aiContent,
      actionButtons: actionButtons
    };
    
    console.log("Returning successful response");
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error in campaign_chat function:", error);
    
    // Provide a detailed error response
    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error in campaign chat function",
        content: "I'm sorry, but I encountered an error processing your campaign request. Please try again or contact support if the problem persists."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
