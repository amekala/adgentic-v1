
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AmazonCallbackHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your Amazon integration...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        console.log("Amazon callback handler activated");
        console.log("Full URL:", window.location.href);
        
        // Get query parameters from the URL - handle both location.search and full URL
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search || location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        console.log("Code parameter:", code?.substring(0, 5) + "...");
        console.log("State parameter:", state?.substring(0, 10) + "...");
        
        if (!code || !state) {
          console.error("Missing required parameters:", { code, state });
          setStatus('error');
          setMessage('Missing required parameters');
          return;
        }

        // Decode state parameter
        let stateData;
        try {
          stateData = JSON.parse(atob(state));
          console.log("Decoded state data:", {
            advertiserId: stateData.advertiserId?.substring(0, 8) + "...",
            useTestAccount: !!stateData.useTestAccount
          });
        } catch (e) {
          console.error("Failed to decode state:", e);
          setStatus('error');
          setMessage('Invalid state parameter');
          return;
        }

        const { advertiserId, useTestAccount } = stateData;
        
        if (!advertiserId) {
          setStatus('error');
          setMessage('Missing advertiser information');
          return;
        }

        // If useTestAccount is true, ensure the test advertiser exists
        if (useTestAccount) {
          console.log("Using test account mode, will create advertiser if needed");
          
          // Check if advertiser exists
          const { data: existingAdvertiser, error: checkError } = await supabase
            .from('advertisers')
            .select('id')
            .eq('id', advertiserId)
            .single();
            
          if (checkError || !existingAdvertiser) {
            console.log("Creating test advertiser:", advertiserId);
            // Create the test advertiser
            const { error: createError } = await supabase
              .from('advertisers')
              .insert({
                id: advertiserId,
                name: 'Test Advertiser',
                company_email: 'test@example.com',
                status: 'active'
              });
              
            if (createError) {
              console.error("Failed to create test advertiser:", createError);
              setStatus('error');
              setMessage('Failed to create test advertiser');
              setErrorDetails(createError.message);
              return;
            }
            console.log("Test advertiser created successfully");
          } else {
            console.log("Test advertiser already exists:", advertiserId);
          }
        } else {
          // Even if not using test account, verify advertiser exists
          const { data: advertiser, error: advertiserError } = await supabase
            .from('advertisers')
            .select('id')
            .eq('id', advertiserId)
            .single();
            
          if (advertiserError || !advertiser) {
            console.error("Advertiser not found:", advertiserId);
            setStatus('error');
            setMessage('Advertiser not found');
            setErrorDetails(`The advertiser ID ${advertiserId} does not exist in the database. Please create it first or enable the 'Use test account' option.`);
            return;
          }
        }

        console.log("Calling token-exchange function with:", {
          advertiserId,
          useTestAccount: !!useTestAccount,
          codeLength: code.length
        });

        // Call our token exchange function
        const { data, error } = await supabase.functions.invoke('token-exchange', {
          body: {
            code,
            advertiserId,
            useTestAccount: !!useTestAccount
          }
        });

        console.log("Token exchange response:", {
          success: !!data?.success,
          error: error?.message || data?.error || null,
          message: data?.message || null
        });

        if (error || !data?.success) {
          const errorMsg = error?.message || data?.error || 'Unknown error';
          console.error("Token exchange failed:", errorMsg);
          setStatus('error');
          setMessage(`Token exchange failed`);
          setErrorDetails(errorMsg);
          return;
        }

        // Handle successful integration
        setStatus('success');
        setMessage('Successfully connected to Amazon Advertising!');
        
        // Redirect to the dashboard after a short delay
        setTimeout(() => {
          navigate('/account?success=amazon_connected');
        }, 2000);
      } catch (error) {
        console.error('Error in callback processing:', error);
        setStatus('error');
        setMessage(`Error: ${error.message}`);
        setErrorDetails(JSON.stringify(error, null, 2));
      }
    }

    // Only process the callback if the code parameter is present
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('code')) {
      processCallback();
    }
  }, [location.search, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">
          {status === 'loading' ? 'Processing...' : 
           status === 'success' ? 'Success!' : 
           'Error'}
        </h1>
        <p className={`${status === 'error' ? 'text-red-500' : 'text-gray-700'}`}>
          {message}
        </p>
        {errorDetails && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800 break-all">
            <p className="font-semibold">Error details:</p>
            <pre className="whitespace-pre-wrap">{errorDetails}</pre>
          </div>
        )}
        {status === 'success' && (
          <p className="mt-4 text-sm text-gray-500">
            Redirecting you to the dashboard...
          </p>
        )}
        {status === 'error' && (
          <button
            onClick={() => navigate('/account')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Account
          </button>
        )}
      </div>
    </div>
  );
}
