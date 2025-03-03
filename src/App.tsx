
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Campaign from "./pages/Campaign";
import Chat from "./pages/Chat";
import Account from "./pages/Account";
import Pricing from "./pages/Pricing";
import Marketing from "./pages/Marketing";
import About from "./pages/About";

// Placeholder components for new routes
const CampaignSettings = () => <Campaign />;
const CampaignChats = () => <Campaign />;
const CampaignReport = () => <Campaign />;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="app-container light">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Marketing />} />
            <Route path="/app" element={<Index />} />
            <Route path="/campaign/:id" element={<Campaign />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/chat/new" element={<Chat />} />
            <Route path="/campaign/:campaignId/settings" element={<CampaignSettings />} />
            <Route path="/campaign/:campaignId/chats" element={<CampaignChats />} />
            <Route path="/campaign/:campaignId/report" element={<CampaignReport />} />
            <Route path="/account" element={<Account />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            {/* Add a catch-all redirect to ensure users land on Marketing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
