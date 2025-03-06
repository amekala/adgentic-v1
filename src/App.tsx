import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
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
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* This catch-all redirects any unknown routes to the Marketing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
