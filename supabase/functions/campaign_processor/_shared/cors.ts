// Enhanced CORS headers for all Edge Functions - now more permissive to fix issues
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Allow any origin
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': '*',  // Allow all headers
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
  // Add these headers to better diagnose CORS issues
  'X-Content-Type-Options': 'nosniff',
  'Vary': 'Origin, Access-Control-Request-Headers',
};
