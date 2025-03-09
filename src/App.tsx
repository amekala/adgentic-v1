
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, HashRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Campaign from "./pages/Campaign";
import Chat from "./pages/Chat";
import Account from "./pages/Account";
import Dashboard from "./pages/dashboard"; 
import Pricing from "./pages/Pricing";
import Marketing from "./pages/Marketing";
import About from "./pages/About";
import AmazonCallbackHandler from "./pages/api/amazon-callback";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ConfirmEmail from "./pages/auth/ConfirmEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";

// Placeholder components for new routes
const CampaignSettings = () => <Campaign />;
const CampaignChats = () => <Campaign />;
const CampaignReport = () => <Campaign />;

const queryClient = new QueryClient();

// Check for OAuth parameters in URL or session storage
const checkForOAuthRedirect = () => {
  // Check URL search params first
  const urlParams = new URLSearchParams(window.location.search);
  const hasOAuthCode = urlParams.has('code') && urlParams.has('state');

  if (hasOAuthCode) {
    console.log("Detected OAuth parameters in URL, redirecting to callback handler");
    // Redirect to the callback handler with params
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const search = `?code=${code}&state=${state}`;
    setTimeout(() => {
      window.location.href = '/#/api/amazon-callback' + search;
    }, 0);
    return true;
  }

  // Check if we have saved OAuth params in session storage
  const savedCode = sessionStorage.getItem('oauth_code');
  const savedState = sessionStorage.getItem('oauth_state');
  
  if (savedCode && savedState) {
    console.log("Found OAuth parameters in session storage, redirecting to callback handler");
    const search = `?code=${savedCode}&state=${savedState}`;
    // Clean up session storage
    sessionStorage.removeItem('oauth_code');
    sessionStorage.removeItem('oauth_state');
    setTimeout(() => {
      window.location.href = '/#/api/amazon-callback' + search;
    }, 0);
    return true;
  }
  
  return false;
};

// Check for redirects before rendering
checkForOAuthRedirect();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HashRouter>
          <AuthProvider>
            <div className="app-container light">
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Marketing />} />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                
                {/* Auth routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/confirm" element={<ConfirmEmail />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/auth/update-password" element={<UpdatePassword />} />
                
                {/* Amazon OAuth Callback Handler - multiple variants to ensure matching */}
                <Route path="/api/amazon-callback" element={<AmazonCallbackHandler />} />
                <Route path="api/amazon-callback" element={<AmazonCallbackHandler />} />
                {/* Explicitly match with * for query parameters */}
                <Route path="/api/amazon-callback/*" element={<AmazonCallbackHandler />} />
                <Route path="api/amazon-callback/*" element={<AmazonCallbackHandler />} />
                
                {/* Protected routes */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/campaign/:id" element={
                  <ProtectedRoute>
                    <Campaign />
                  </ProtectedRoute>
                } />
                <Route path="/chat/:id" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/chat/new" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/campaign/:campaignId/settings" element={
                  <ProtectedRoute>
                    <CampaignSettings />
                  </ProtectedRoute>
                } />
                <Route path="/campaign/:campaignId/chats" element={
                  <ProtectedRoute>
                    <CampaignChats />
                  </ProtectedRoute>
                } />
                <Route path="/campaign/:campaignId/report" element={
                  <ProtectedRoute>
                    <CampaignReport />
                  </ProtectedRoute>
                } />
                <Route path="/account" element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Navigate to="/account" replace />
                  </ProtectedRoute>
                } />

                {/* This catch-all redirects any unknown routes to the Marketing page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </AuthProvider>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
