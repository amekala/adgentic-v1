# Amazon Advertising API Integration

This document outlines how to test and deploy the Amazon Advertising API integration with the LLM chat interface.

## How It Works

The integration allows users to interact with Amazon Advertising through natural language conversations:

1. **Create Campaigns**: Users can request to create new Amazon advertising campaigns
2. **Adjust Budgets**: Users can modify budgets for existing campaigns
3. **Generate Reports**: Users can request performance reports for campaigns

The system will:
- Detect the user's intent
- Ask for any missing information
- Confirm the operation before execution
- Execute the API call using the stored credentials
- Display the results to the user

## Testing in Development Environment

To test the implementation locally:

1. **Start the development server**:
   ```
   npm run dev
   ```

2. **Test Command Line**:
   You can use special test commands in any chat to directly test the API calls:
   
   ```
   /amazon-test create_campaign
   ```
   
   ```
   /amazon-test adjust_budget {"campaignId": 123456789, "newDailyBudget": 75}
   ```
   
   ```
   /amazon-test get_campaign_report {"campaignIds": 123456789, "startDate": "2023-05-01", "endDate": "2023-05-31"}
   ```

3. **Natural Language Testing**:
   You can also test the natural language understanding with queries like:
   
   ```
   Create a new Amazon campaign called "Summer Promo" with a $50 daily budget
   ```
   
   ```
   Increase the budget for Test Campaign 1 to $75
   ```
   
   ```
   Show me the performance report for Test Campaign 2 for the last 30 days
   ```

4. **Parameter Collection**:
   If you don't provide all required parameters, the system will ask for them:
   
   ```
   Create a new Amazon campaign
   ```
   
   The system will prompt for:
   - Campaign name
   - Daily budget
   - Start date
   - Targeting type

## Deploying to Production

To deploy to production:

1. **Set Environment Variables**:
   - `ENVIRONMENT=production`
   - `AMAZON_ADS_CLIENT_ID`: Your Amazon Advertising API client ID
   - `AMAZON_ADS_CLIENT_SECRET`: Your Amazon Advertising API client secret
   - `SUPABASE_URL`: URL of your Supabase instance
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

2. **Deploy Edge Functions**:
   ```
   npm run deploy:functions
   ```

3. **Deploy Web Application**:
   ```
   npm run deploy
   ```

4. **Configure Platform Credentials**:
   Ensure the Amazon credentials are correctly stored in the `platform_credentials` table with:
   - `platform_id`: "amazon_sp"
   - `profile_id`: "3211012118364113" (or your Amazon Ads profile ID)
   - `access_token` and `refresh_token`: Valid Amazon Advertising API tokens
   - `is_active`: true

## Monitoring and Troubleshooting

1. **Check API Logs**:
   - Monitor the browser console for `[Amazon API]` log entries
   - Check the Supabase edge function logs for errors

2. **Token Management**:
   - The system automatically refreshes expired tokens
   - Token refreshes are logged in the `token_refresh_logs` table

3. **Common Issues**:
   - **Missing Credentials**: Ensure the `platform_credentials` record exists
   - **Invalid Profile ID**: Verify the Amazon profile ID is correct
   - **API Rate Limits**: Amazon enforces rate limits on API calls

## Security Considerations

1. All sensitive Amazon credentials are stored in the Supabase database
2. Tokens are refreshed automatically when they expire
3. User confirmation is required before executing API operations

## Future Improvements

1. Add support for additional Amazon Advertising API operations
2. Implement better error handling and recovery mechanisms
3. Add detailed analytics for API usage tracking
4. Enhance natural language understanding for more complex queries 