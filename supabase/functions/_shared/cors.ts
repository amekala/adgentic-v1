
// CORS headers for all Edge Functions
const allowedOrigins = [
  'https://www.adspirer.com',
  'https://adspirer.com',
  'https://adspirer.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

export const corsHeaders = (req: Request) => {
  const origin = req.headers.get('origin');
  
  // Check if the request origin is in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin', // Important when using dynamic origin
    };
  }
  
  // Default fallback (should match production domain)
  return {
    'Access-Control-Allow-Origin': 'https://www.adspirer.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};
