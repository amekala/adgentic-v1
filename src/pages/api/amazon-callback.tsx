import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/integrations/supabase/client';

export default function AmazonCallbackHandler() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your Amazon integration...');

  useEffect(() => {
    async function processCallback() {
      try {
        // Make sure we have the necessary parameters
        const { code, state } = router.query;
        
        if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
          setStatus('error');
          setMessage('Missing required parameters');
          return;
        }

        // Decode state parameter
        let stateData;
        try {
          stateData = JSON.parse(atob(state));
        } catch (e) {
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

        // Call our token exchange function
        const { data, error } = await supabase.functions.invoke('token-exchange', {
          body: {
            code,
            advertiserId,
            useTestAccount: !!useTestAccount
          }
        });

        if (error) {
          throw new Error(`Token exchange failed: ${error.message}`);
        }

        // Handle successful integration
        setStatus('success');
        setMessage('Successfully connected to Amazon Advertising!');
        
        // Redirect to the dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard?success=amazon_connected');
        }, 2000);
      } catch (error) {
        console.error('Error in callback processing:', error);
        setStatus('error');
        setMessage(`Error: ${error.message}`);
      }
    }

    // Only process the callback if the code parameter is present
    if (router.query.code) {
      processCallback();
    }
  }, [router.query]);

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
        {status === 'success' && (
          <p className="mt-4 text-sm text-gray-500">
            Redirecting you to the dashboard...
          </p>
        )}
        {status === 'error' && (
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
} 