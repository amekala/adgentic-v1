#!/bin/bash

# Deploy Supabase Edge Functions
echo "Deploying Supabase Edge Functions..."

# Make sure Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI could not be found. Installing..."
    npm install -g supabase
fi

# Check if required environment variables are set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable is not set"
    echo "Set it with: export OPENAI_API_KEY=your_key_here"
    exit 1
fi

if [ -z "$AMAZON_ADS_CLIENT_ID" ]; then
    echo "Error: AMAZON_ADS_CLIENT_ID environment variable is not set"
    echo "Set it with: export AMAZON_ADS_CLIENT_ID=your_id_here"
    exit 1
fi

if [ -z "$AMAZON_ADS_CLIENT_SECRET" ]; then
    echo "Error: AMAZON_ADS_CLIENT_SECRET environment variable is not set"
    echo "Set it with: export AMAZON_ADS_CLIENT_SECRET=your_secret_here"
    exit 1
fi

# Deploy each function
echo "Deploying token_manager function..."
supabase functions deploy token_manager --project-ref wllhsxoabzdzulomizzx

echo "Deploying amazon_ads function..."
supabase functions deploy amazon_ads --project-ref wllhsxoabzdzulomizzx

echo "Deploying campaign_chat function..."
supabase functions deploy campaign_chat --project-ref wllhsxoabzdzulomizzx

echo "Deploying chat function..."
supabase functions deploy chat --project-ref wllhsxoabzdzulomizzx

# Set environment variables
echo "Setting environment variables..."
supabase secrets set --project-ref wllhsxoabzdzulomizzx ENVIRONMENT=production
supabase secrets set --project-ref wllhsxoabzdzulomizzx OPENAI_API_KEY="$OPENAI_API_KEY"
supabase secrets set --project-ref wllhsxoabzdzulomizzx AMAZON_ADS_CLIENT_ID="$AMAZON_ADS_CLIENT_ID"
supabase secrets set --project-ref wllhsxoabzdzulomizzx AMAZON_ADS_CLIENT_SECRET="$AMAZON_ADS_CLIENT_SECRET"

# Note: Supabase doesn't allow setting SUPABASE_ prefixed environment variables
# These are automatically provided to Edge Functions

echo "Deployment complete! You can now test the functions."
echo "If you encounter any CORS issues, verify the CORS headers in your functions." 
