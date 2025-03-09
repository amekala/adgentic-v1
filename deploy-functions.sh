#!/bin/bash

# List of function names
functions=(
  "amazon-auth"
  "amazon-callback"
  "amazon_ads"
  "campaign_chat"
  "campaign_processor"
  "chat"
  "token-exchange"
  "token-refresh"
  "token_manager"
)

echo "🚀 Deploying Supabase Edge Functions..."

# Get the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Copy shared files to each function directory
echo "📋 Copying shared files to function directories..."
for func in "${functions[@]}"; do
  # Create directories if they don't exist
  mkdir -p "supabase/functions/$func"
  
  # Copy the shared directory if it doesn't exist
  if [ ! -d "supabase/functions/$func/_shared" ]; then
    echo "  Creating shared directory for $func"
    mkdir -p "supabase/functions/$func/_shared"
  fi
  
  # Copy shared files
  echo "  Copying shared files to $func"
  cp -r "supabase/functions/_shared/"* "supabase/functions/$func/_shared/"
done

# Deploy each function
for func in "${functions[@]}"; do
  echo "📦 Deploying function: $func"
  npx supabase functions deploy "$func" --project-ref wllhsxoabzdzulomizzx
  
  if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed $func"
  else
    echo "❌ Failed to deploy $func"
  fi
  
  # Small delay between deployments
  sleep 2
done

echo "🎉 Deployment complete!" 
