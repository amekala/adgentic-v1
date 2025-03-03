
# Supabase Edge Functions

## Important Model Update

We've updated the OpenAI model from `gpt-4o-mini` to `gpt-4o` for better results. To apply this change:

1. In `supabase/functions/chat/index.ts`, search for the OpenAI API call and update the model parameter:

```diff
- model: 'gpt-4o-mini',
+ model: 'gpt-4o',
```

2. Similarly, in `supabase/functions/campaign_chat/index.ts`, update the model parameter:

```diff
- model: 'gpt-4o-mini',
+ model: 'gpt-4o',
```

3. Deploy the updated functions with:

```bash
supabase functions deploy chat
supabase functions deploy campaign_chat
```
