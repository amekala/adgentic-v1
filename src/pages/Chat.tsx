import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { useCurrentChat } from '@/hooks/useCurrentChat';
import ChatPageHeader from '@/components/chat/ChatPageHeader';
import ChatInputArea from '@/components/chat/ChatInputArea';
import ChatMessagesArea from '@/components/chat/ChatMessagesArea';
import { toast } from "sonner";

const Chat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [diagnosisRun, setDiagnosisRun] = useState(false);
  
  // Check if device is mobile for initial sidebar state
  useEffect(() => {
    const checkIsMobile = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    
    // Set initial state
    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  const {
    chatData,
    messages,
    inputValue,
    isLoading,
    isSending,
    handleInputChange,
    handleSendMessage,
    handleDeleteChat,
    handleBackClick,
    getBreadcrumbItems,
    setInputValue,
    campaign,
    campaignId
  } = useCurrentChat();
  
  // Debug logging for campaign data and breadcrumbs
  useEffect(() => {
    console.log('Campaign data:', campaign);
    console.log('Campaign ID:', campaignId);
    console.log('Breadcrumb items:', getBreadcrumbItems());
  }, [campaign, campaignId, getBreadcrumbItems]);
  
  // Handle action button clicks
  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    if (action === 'Performance Analysis') {
      handleSendMessage('Show me performance analysis for this campaign');
    } else if (action === 'Budget Optimization') {
      handleSendMessage('Help me optimize my budget for this campaign');
    } else if (action === 'Creative Review') {
      handleSendMessage('Review my creative assets for this campaign');
    } else {
      // Process the action and send a message based on the action
      handleSendMessage(`I want to ${action}`);
    }
  };

  // Handle followup prompt clicks
  const handleFollowupClick = (prompt: string) => {
    console.log('Followup clicked:', prompt);
    handleSendMessage(prompt);
  };
  
  // Auto-run diagnostic test for Supabase Edge Function
  useEffect(() => {
    const runDiagnosticTest = async () => {
      if (diagnosisRun) return; // Only run once
      setDiagnosisRun(true);
      
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('Missing Supabase configuration. Check environment variables.');
          return;
        }
        
        console.log('🧪 DIAGNOSTIC TEST: Testing Supabase Edge Function connectivity');
        console.log('Using Supabase URL:', supabaseUrl);
        
        // First test - Try a simple ping to the edge function domain
        try {
          const domainCheckUrl = `${supabaseUrl}/functions/v1/`;
          console.log('DIAGNOSTIC: Testing edge function domain:', domainCheckUrl);
          
          const domainResponse = await fetch(domainCheckUrl);
          console.log('DIAGNOSTIC: Domain response status:', domainResponse.status);
          
          // Even if we get a 404, that's fine - at least the domain is reachable
          if (domainResponse.status === 404) {
            console.log('DIAGNOSTIC: Edge function domain is reachable (404 is expected)');
          }
        } catch (error) {
          console.error('DIAGNOSTIC ERROR: Edge function domain unreachable:', error);
          toast.error('Diagnostic: API domain unreachable');
          return;
        }
        
        // Second test - Check chat endpoint with minimal payload
        try {
          console.log('DIAGNOSTIC: Testing chat endpoint with minimal payload');
          const testResponse = await fetch(`${supabaseUrl}/functions/v1/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: 'Hello, this is a diagnostic test.' }]
            })
          });
          
          console.log('DIAGNOSTIC: Test response status:', testResponse.status);
          const responseText = await testResponse.text();
          console.log('DIAGNOSTIC: Raw response:', responseText.substring(0, 200));
          
          try {
            // Attempt to parse as JSON
            const jsonResponse = JSON.parse(responseText);
            console.log('DIAGNOSTIC: JSON parsing successful:', jsonResponse);
            
            if (jsonResponse.content) {
              console.log('DIAGNOSTIC: Edge function working correctly!');
              toast.success('Diagnostic: AI API connection success');
            } else {
              console.warn('DIAGNOSTIC: Response format unexpected:', jsonResponse);
              toast.warning('Diagnostic: Unexpected API response format');
            }
          } catch (parseError) {
            console.error('DIAGNOSTIC: Failed to parse response as JSON:', parseError);
            toast.error('Diagnostic: Invalid JSON response');
          }
        } catch (fetchError) {
          console.error('DIAGNOSTIC: Fetch error during chat test:', fetchError);
          toast.error('Diagnostic: API connection failed');
        }
      } catch (e) {
        console.error('DIAGNOSTIC: Unexpected diagnostic error:', e);
      }
    };
    
    // Run diagnostic test
    runDiagnosticTest();
  }, [diagnosisRun]);

  // Handle key presses in the textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Function to manually run the diagnostic test
  const runManualDiagnostic = () => {
    setDiagnosisRun(false); // Reset so it will run again
    toast.info('Running API diagnosis...');
    
    // Show info about environment variables (safely)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('SUPABASE URL:', supabaseUrl || 'NOT SET');
    console.log('SUPABASE KEY:', supabaseKey ? 
      `${supabaseKey.substring(0, 4)}...${supabaseKey.substring(supabaseKey.length - 4)}` : 
      'NOT SET');
    
    // Check if URLs are properly formed
    if (supabaseUrl) {
      try {
        const url = new URL(supabaseUrl);
        console.log('URL VALID:', url.origin);
      } catch (e) {
        console.error('INVALID URL FORMAT:', supabaseUrl);
        toast.error('Invalid Supabase URL format');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-adspirer-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={() => {}}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <ChatPageHeader 
          chatData={chatData}
          onBackClick={handleBackClick}
          onDeleteChat={handleDeleteChat}
          isSidebarOpen={isSidebarOpen}
        />
        
        {/* Debug button (only visible in development) */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-20 right-5 z-50">
            <button 
              onClick={runManualDiagnostic}
              className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg shadow-md text-xs"
            >
              Diagnose API
            </button>
          </div>
        )}
        
        <div className="pt-[60px]">
          {/* Breadcrumb navigation */}
          <Breadcrumb items={getBreadcrumbItems()} />
          
          {/* Chat messages */}
          <div className="flex flex-col h-[calc(100vh-160px)] sm:h-[calc(100vh-180px)] overflow-hidden">
            <ChatMessagesArea 
              messages={messages}
              isLoading={isLoading}
              onActionClick={handleActionClick}
              onFollowupClick={handleFollowupClick}
            />
            
            {/* Input area */}
            <ChatInputArea 
              inputValue={inputValue}
              isSending={isSending}
              onInputChange={handleInputChange}
              onSendMessage={handleSendMessage}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
