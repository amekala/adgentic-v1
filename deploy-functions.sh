
#!/bin/bash

# Deploy Supabase Edge Functions
echo "Deploying Supabase Edge Functions..."

# Make sure Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI could not be found. Installing..."
    npm install -g supabase
fi

# Deploy each function with appropriate secrets
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
supabase secrets set --project-ref wllhsxoabzdzulomizzx OPENAI_API_KEY=$OPENAI_API_KEY
supabase secrets set --project-ref wllhsxoabzdzulomizzx AMAZON_ADS_CLIENT_ID=$AMAZON_ADS_CLIENT_ID
supabase secrets set --project-ref wllhsxoabzdzulomizzx AMAZON_ADS_CLIENT_SECRET=$AMAZON_ADS_CLIENT_SECRET
supabase secrets set --project-ref wllhsxoabzdzulomizzx SUPABASE_URL=https://wllhsxoabzdzulomizzx.supabase.co
supabase secrets set --project-ref wllhsxoabzdzulomizzx SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

echo "Deployment complete!" 
